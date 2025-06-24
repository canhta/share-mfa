# Phase 8 Requirements: Advanced Shortlink Management & Multi-Strategy Sharing System

This document outlines Phase 8 development, focusing on implementing a comprehensive shortlink management system that allows multiple sharing strategies per MFA entry, advanced link tracking, and full Context7 integration for optimal performance and user experience.

---

## 1. Multi-Strategy Sharing System Architecture

### 1.1. Objective

Transform the current single-token sharing system into a robust multi-link management platform where each MFA entry can have multiple active sharing links with different configurations, strategies, and access controls.

### 1.2. Current State Analysis

**Current Limitations:**

- **Single Token per MFA**: Each `mfa_entries` record can only have one `share_token` at a time
- **Limited Strategy Options**: Only basic password protection with embed/require options
- **No Link Management**: Cannot create, disable, or manage multiple links per entry
- **Basic Tracking**: Limited analytics on link usage and access patterns
- **Client-Side Dependencies**: Components still fetch share data using client-side patterns

**Existing Foundation:**

- ✅ `shared_links` table exists with tracking capabilities (`click_count`, `last_accessed_at`, `status`)
- ✅ Password hashing and validation system in place
- ✅ Prisma ORM integration complete
- ✅ Basic usage tracking infrastructure
- ✅ Next.js 15 server components foundation

### 1.3. Key Changes

- Implement multiple sharing strategies: **Temporary**, **Password-Protected**, **Time-Limited**, **Access-Limited**, **Public**, and **Enterprise**
- Create comprehensive shortlink management dashboard with Context7 patterns
- Advanced analytics and usage tracking with real-time updates
- Server-side link generation and management using Next.js 15 cache()
- Implement link lifecycle management (create, activate, pause, expire, delete)

---

## 2. Shortlink Management System Implementation

### 2.1. Enhanced Database Schema (Prisma Migrations)

1. **Update Prisma Schema (`prisma/schema.prisma`):**

   ```prisma
   model shared_links {
     id                     String      @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
     mfa_entry_id           String      @db.Uuid
     share_token            String      @unique
     status                 String      @default("active")
     strategy               String      @default("basic")  // NEW: Sharing strategy type
     require_password       Boolean     @default(false)
     share_password         String?
     embed_password_in_link Boolean     @default(false)
     expires_at             DateTime?   @db.Timestamptz(6)
     max_accesses          Int?        // NEW: Access limit per link
     access_window_hours   Int?        // NEW: Time window restrictions
     custom_slug           String?     @unique  // NEW: Custom short URLs
     description           String?     // NEW: Link description/notes
     ip_restrictions       Json?       // NEW: IP geofencing rules
     analytics_enabled     Boolean     @default(true)  // NEW: Analytics toggle
     qr_code_data         String?     // NEW: Generated QR code data
     created_by            String      @db.Uuid
     click_count           Int?        @default(0)
     last_accessed_at      DateTime?   @db.Timestamptz(6)
     created_at            DateTime?   @default(now()) @db.Timestamptz(6)
     updated_at            DateTime?   @default(now()) @db.Timestamptz(6)

     users                 users       @relation(fields: [created_by], references: [id], onDelete: NoAction, onUpdate: NoAction)
     mfa_entries           mfa_entries @relation(fields: [mfa_entry_id], references: [id], onDelete: Cascade, onUpdate: NoAction)
     shortlink_analytics   shortlink_analytics[]  // NEW: One-to-many analytics

     @@index([created_by], map: "idx_shared_links_created_by")
     @@index([expires_at], map: "idx_shared_links_expires_at")
     @@index([mfa_entry_id], map: "idx_shared_links_mfa_entry_id")
     @@index([share_token], map: "idx_shared_links_share_token")
     @@index([status], map: "idx_shared_links_status")
     @@index([strategy], map: "idx_shared_links_strategy")  // NEW
     @@index([custom_slug], map: "idx_shared_links_custom_slug")  // NEW
     @@schema("public")
   }

   model shortlink_analytics {  // NEW: Detailed access analytics
     id              String      @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
     shared_link_id  String      @db.Uuid
     accessed_at     DateTime    @default(now()) @db.Timestamptz(6)
     ip_address      String?     @db.Inet
     user_agent      String?
     referrer        String?
     geolocation     Json?       // Store geographic data as JSON
     device_type     String?     // mobile, desktop, tablet
     success         Boolean     @default(true)
     failure_reason  String?     // Why access failed (expired, wrong password, etc.)

     shared_link     shared_links @relation(fields: [shared_link_id], references: [id], onDelete: Cascade)

     @@index([shared_link_id], map: "idx_shortlink_analytics_link_id")
     @@index([accessed_at], map: "idx_shortlink_analytics_accessed_at")
     @@index([ip_address], map: "idx_shortlink_analytics_ip")
     @@schema("public")
   }

   model link_strategy_templates {  // NEW: Reusable strategy templates
     id             String    @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
     name           String    @db.VarChar(100)
     strategy       String    @db.VarChar(50)
     default_config Json      // Strategy configuration as JSON
     is_premium     Boolean   @default(false)
     created_at     DateTime? @default(now()) @db.Timestamptz(6)

     @@index([strategy], map: "idx_strategy_templates_strategy")
     @@schema("public")
   }
   ```

2. **Migration Commands:**

   ```bash
   # Generate migration for schema changes
   npx prisma migrate dev --name add-advanced-shortlink-features

   # Apply migration to database
   npx prisma db push

   # Regenerate Prisma client with new schema
   npx prisma generate
   ```

3. **Phase out single token from `mfa_entries`:**

   ```prisma
   model mfa_entries {
     id                     String         @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
     user_id                String         @db.Uuid
     name                   String
     secret                 String
     notes                  String?
     // Remove legacy single-token fields in favor of shared_links
     // share_password         String?     // REMOVE
     // share_token            String?     // REMOVE
     // require_password       Boolean     // REMOVE
     // embed_password_in_link Boolean     // REMOVE
     // token_expires_at       DateTime?   // REMOVE
     created_at             DateTime?      @default(now()) @db.Timestamptz(6)
     updated_at             DateTime?      @default(now()) @db.Timestamptz(6)
     users                  users          @relation(fields: [user_id], references: [id], onDelete: Cascade, onUpdate: NoAction)
     shared_links           shared_links[] // Multiple links per MFA entry

     @@index([user_id], map: "idx_mfa_entries_user_id")
     @@schema("public")
   }
   ```

### 2.2. Sharing Strategy System

1. **Strategy Definitions:**

   ```typescript
   // types/sharing-strategies.ts
   export type SharingStrategy =
     | 'temporary' // Expires after X hours, auto-delete
     | 'password' // Requires password authentication
     | 'time-limited' // Active only during specific time windows
     | 'access-limited' // Expires after X accesses
     | 'public' // Open access, no restrictions
     | 'enterprise'; // IP restrictions, advanced controls

   export interface StrategyConfig {
     strategy: SharingStrategy;
     expires_at?: Date;
     max_accesses?: number;
     require_password: boolean;
     password?: string;
     embed_password_in_link: boolean;
     access_window_start?: string; // "09:00"
     access_window_end?: string; // "17:00"
     allowed_ip_ranges?: string[];
     custom_slug?: string;
     description?: string;
     analytics_enabled: boolean;
   }
   ```

2. **Strategy Templates Implementation:**

   ```typescript
   // lib/data/strategy-templates.ts
   import { cache } from 'react';
   import { prisma } from '@/lib/prisma';

   export const getStrategyTemplates = cache(async () => {
     return await prisma.link_strategy_templates.findMany({
       select: {
         id: true,
         name: true,
         strategy: true,
         default_config: true,
         is_premium: true,
       },
       orderBy: { name: 'asc' },
     });
   });

   export const applyStrategyTemplate = (
     templateId: string,
     customConfig?: Partial<StrategyConfig>
   ): StrategyConfig => {
     // Implementation for applying strategy templates with overrides
   };
   ```

### 2.3. Context7 Shortlink Management

1. **Server-Side Link Management with Prisma:**

   ```typescript
   // lib/data/shortlink-data.ts
   import { cache } from 'react';
   import { nanoid } from 'nanoid';
   import { prisma } from '@/lib/prisma'; // Use existing Prisma singleton
   import { hashPassword } from '@/lib/crypto';
   import type { StrategyConfig } from '@/types/sharing-strategies';

   export const getCachedShortlinks = cache(async (userId: string) => {
     return await prisma.shared_links.findMany({
       where: {
         mfa_entries: { user_id: userId },
       },
       include: {
         mfa_entries: {
           select: { id: true, name: true },
         },
         _count: {
           select: { shortlink_analytics: true },
         },
       },
       orderBy: { created_at: 'desc' },
       cacheStrategy: {
         // Use Prisma caching for performance
         ttl: 60, // Fresh for 1 minute
         swr: 300, // Serve stale for up to 5 minutes
         tags: [`shortlinks-${userId}`],
       },
     });
   });

   export const createShortlink = async (mfaEntryId: string, strategy: StrategyConfig, userId: string) => {
     // Verify MFA entry ownership
     const mfaEntry = await prisma.mfa_entries.findFirst({
       where: { id: mfaEntryId, user_id: userId },
       select: { id: true },
     });

     if (!mfaEntry) {
       throw new Error('MFA entry not found or unauthorized');
     }

     const shareToken = strategy.custom_slug || nanoid(8);

     return await prisma.shared_links.create({
       data: {
         mfa_entry_id: mfaEntryId,
         share_token: shareToken,
         strategy: strategy.strategy,
         require_password: strategy.require_password,
         share_password: strategy.password ? await hashPassword(strategy.password) : null,
         embed_password_in_link: strategy.embed_password_in_link,
         expires_at: strategy.expires_at,
         max_accesses: strategy.max_accesses,
         access_window_hours: strategy.access_window_hours,
         custom_slug: strategy.custom_slug,
         description: strategy.description,
         ip_restrictions: strategy.allowed_ip_ranges ? { ranges: strategy.allowed_ip_ranges } : null,
         analytics_enabled: strategy.analytics_enabled,
         created_by: userId,
         status: 'active',
       },
       include: {
         mfa_entries: { select: { name: true } },
       },
     });
   };

   export const updateShortlinkStatus = async (
     shortlinkId: string,
     status: 'active' | 'paused' | 'expired',
     userId: string
   ) => {
     return await prisma.shared_links.update({
       where: {
         id: shortlinkId,
         created_by: userId, // Ensure ownership
       },
       data: {
         status,
         updated_at: new Date(),
       },
     });
   };
   ```

2. **Advanced Analytics Implementation with Prisma:**

   ```typescript
   // lib/data/shortlink-analytics.ts
   import { cache } from 'react';
   import { prisma } from '@/lib/prisma';
   import type { NextRequest } from 'next/server';

   export const trackShortlinkAccess = async (
     shortlinkId: string,
     request: NextRequest,
     success: boolean = true,
     failureReason?: string
   ) => {
     const ip = getClientIP(request);
     const userAgent = request.headers.get('user-agent');
     const referrer = request.headers.get('referer');

     // Update shortlink access count
     await prisma.shared_links.update({
       where: { id: shortlinkId },
       data: {
         click_count: { increment: 1 },
         last_accessed_at: new Date(),
       },
     });

     // Record detailed analytics
     await prisma.shortlink_analytics.create({
       data: {
         shared_link_id: shortlinkId,
         ip_address: ip,
         user_agent: userAgent,
         referrer: referrer,
         device_type: parseDeviceType(userAgent),
         geolocation: await getGeolocation(ip),
         success,
         failure_reason: failureReason,
       },
     });
   };

   export const getShortlinkAnalytics = cache(
     async (shortlinkId: string, timeRange: 'day' | 'week' | 'month' = 'week', userId?: string) => {
       const startDate = getStartDate(timeRange);

       // Verify user has access to this shortlink's analytics
       if (userId) {
         const shortlink = await prisma.shared_links.findFirst({
           where: {
             id: shortlinkId,
             created_by: userId,
           },
           select: { id: true },
         });

         if (!shortlink) {
           throw new Error('Unauthorized access to analytics');
         }
       }

       return await prisma.shortlink_analytics.findMany({
         where: {
           shared_link_id: shortlinkId,
           accessed_at: { gte: startDate },
         },
         select: {
           accessed_at: true,
           ip_address: true,
           device_type: true,
           success: true,
           failure_reason: true,
           geolocation: true,
           user_agent: true,
           referrer: true,
         },
         orderBy: { accessed_at: 'desc' },
         cacheStrategy: {
           ttl: 30, // Fresh for 30 seconds (real-time feel)
           swr: 120, // Serve stale for up to 2 minutes
           tags: [`analytics-${shortlinkId}`],
         },
       });
     }
   );

   export const getAnalyticsSummary = cache(async (shortlinkId: string, userId: string) => {
     const [totalAccesses, uniqueIPs, deviceBreakdown, recentActivity] = await Promise.all([
       // Total access count
       prisma.shortlink_analytics.count({
         where: { shared_link_id: shortlinkId },
       }),

       // Unique IP addresses
       prisma.shortlink_analytics.groupBy({
         by: ['ip_address'],
         where: { shared_link_id: shortlinkId },
         _count: true,
       }),

       // Device type breakdown
       prisma.shortlink_analytics.groupBy({
         by: ['device_type'],
         where: {
           shared_link_id: shortlinkId,
           device_type: { not: null },
         },
         _count: true,
       }),

       // Recent activity (last 24 hours)
       prisma.shortlink_analytics.count({
         where: {
           shared_link_id: shortlinkId,
           accessed_at: {
             gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
           },
         },
       }),
     ]);

     return {
       totalAccesses,
       uniqueVisitors: uniqueIPs.length,
       deviceBreakdown,
       recentActivity,
     };
   });
   ```

---

## 3. Context7 Frontend Integration

### 3.1. Server Component Architecture

1. **Shortlink Dashboard Page:**

   ```typescript
   // app/(protected)/mfa/shortlinks/page.tsx
   import { getCachedUser } from '@/lib/data/user-data'
   import { getCachedShortlinks } from '@/lib/data/shortlink-data'
   import { getCachedMfaEntries } from '@/lib/data/mfa-data'
   import { ShortlinkDashboard } from '@/components/shortlinks/ShortlinkDashboard'

   export default async function ShortlinksPage() {
     const [user, shortlinks, mfaEntries] = await Promise.all([
       getCachedUser(),
       getCachedShortlinks(user.id),
       getCachedMfaEntries(user.id)
     ])

     return (
       <div className="space-y-6">
         <ShortlinkDashboard
           shortlinks={shortlinks}
           mfaEntries={mfaEntries}
           user={user}
         />
       </div>
     )
   }
   ```

2. **Enhanced Share Management Modal:**

   ```typescript
   // components/shortlinks/CreateShortlinkModal.tsx
   'use client'

   import { useState } from 'react'
   import { createShortlinkAction } from '@/app/actions/shortlink-actions'
   import { StrategySelector } from './StrategySelector'
   import { LinkPreview } from './LinkPreview'

   export function CreateShortlinkModal({
     mfaEntry,
     strategies,
     onClose
   }: CreateShortlinkModalProps) {
     const [selectedStrategy, setSelectedStrategy] = useState<StrategyConfig>()
     const [isCreating, setIsCreating] = useState(false)

     const handleCreateLink = async () => {
       setIsCreating(true)
       try {
         await createShortlinkAction(mfaEntry.id, selectedStrategy)
         onClose()
       } finally {
         setIsCreating(false)
       }
     }

     return (
       <Modal title="Create New Shortlink" onClose={onClose}>
         <div className="space-y-6">
           <StrategySelector
             strategies={strategies}
             selected={selectedStrategy}
             onSelect={setSelectedStrategy}
           />

           {selectedStrategy && (
             <LinkPreview
               strategy={selectedStrategy}
               mfaEntry={mfaEntry}
             />
           )}

           <div className="flex justify-end space-x-3">
             <Button variant="secondary" onClick={onClose}>
               Cancel
             </Button>
             <Button
               onClick={handleCreateLink}
               disabled={!selectedStrategy || isCreating}
               loading={isCreating}
             >
               Create Shortlink
             </Button>
           </div>
         </div>
       </Modal>
     )
   }
   ```

### 3.2. Real-Time Analytics Dashboard

1. **Analytics Visualization:**

   ```typescript
   // components/shortlinks/ShortlinkAnalytics.tsx
   import { getCachedShortlinkAnalytics } from '@/lib/data/shortlink-analytics'
   import { AnalyticsChart } from './AnalyticsChart'
   import { DeviceBreakdown } from './DeviceBreakdown'
   import { GeographicMap } from './GeographicMap'

   export async function ShortlinkAnalytics({
     shortlinkId,
     timeRange
   }: ShortlinkAnalyticsProps) {
     const analytics = await getCachedShortlinkAnalytics(shortlinkId, timeRange)

     return (
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <AnalyticsChart data={analytics} />
         <DeviceBreakdown data={analytics} />
         <GeographicMap data={analytics} className="lg:col-span-2" />
       </div>
     )
   }
   ```

2. **Live Link Status Management:**

   ```typescript
   // components/shortlinks/LinkStatusManager.tsx
   'use client'

   import { useState } from 'react'
   import { updateShortlinkStatusAction } from '@/app/actions/shortlink-actions'

   export function LinkStatusManager({ shortlink }: LinkStatusManagerProps) {
     const [status, setStatus] = useState(shortlink.status)

     const handleStatusChange = async (newStatus: 'active' | 'paused' | 'expired') => {
       await updateShortlinkStatusAction(shortlink.id, newStatus)
       setStatus(newStatus)
     }

     return (
       <div className="flex items-center space-x-2">
         <StatusBadge status={status} />
         <StatusDropdown
           currentStatus={status}
           onStatusChange={handleStatusChange}
         />
       </div>
     )
   }
   ```

---

## 4. Advanced Features & Enterprise Capabilities

### 4.1. Custom Domain Support

1. **Branded Shortlinks:**
   ```typescript
   // Configure custom domains for enterprise users
   const shortlinkUrl = user.customDomain
     ? `https://${user.customDomain}/${shareToken}`
     : `https://app.sharemfa.com/s/${shareToken}`;
   ```

### 4.2. QR Code Generation & Tracking

1. **Dynamic QR Codes:**

   ```typescript
   // lib/qr-code.ts
   import QRCode from 'qrcode';

   export const generateQRCode = async (shortlinkUrl: string, options?: QRCodeOptions): Promise<string> => {
     return await QRCode.toDataURL(shortlinkUrl, {
       width: 256,
       margin: 1,
       color: {
         dark: '#000000',
         light: '#FFFFFF',
       },
       ...options,
     });
   };
   ```

### 4.3. Advanced Security Features

1. **IP Geofencing:**

   ```typescript
   export const validateIPAccess = (clientIP: string, allowedRanges: string[]): boolean => {
     return allowedRanges.some((range) => isIPInRange(clientIP, range));
   };
   ```

2. **Rate Limiting:**
   ```typescript
   export const rateLimitShortlink = async (shortlinkId: string, clientIP: string): Promise<boolean> => {
     const recentAccesses = await prisma.shortlink_analytics.count({
       where: {
         shared_link_id: shortlinkId,
         ip_address: clientIP,
         accessed_at: {
           gte: new Date(Date.now() - 60 * 1000), // Last minute
         },
       },
     });

     return recentAccesses < 5; // Max 5 accesses per minute
   };
   ```

---

## 5. API Routes & Server Actions

### 5.1. Next.js 15 Server Actions

1. **Shortlink Management Actions:**

   ```typescript
   // app/actions/shortlink-actions.ts
   'use server';

   import { revalidateTag } from 'next/cache';

   export async function createShortlinkAction(mfaEntryId: string, strategy: StrategyConfig) {
     const user = await getCachedUser();
     const shortlink = await createShortlink(mfaEntryId, strategy, user.id);

     revalidateTag(`shortlinks-${user.id}`);
     return shortlink;
   }

   export async function updateShortlinkStatusAction(shortlinkId: string, status: 'active' | 'paused' | 'expired') {
     await prisma.shared_links.update({
       where: { id: shortlinkId },
       data: { status },
     });

     revalidateTag('shortlinks');
   }
   ```

### 5.2. Enhanced Share Access Route

1. **Multi-Strategy Access Handler:**

   ```typescript
   // app/(public)/s/[token]/page.tsx
   import { validateShortlinkAccess } from '@/lib/shortlink-validation'
   import { trackShortlinkAccess } from '@/lib/data/shortlink-analytics'

   export default async function ShortlinkAccessPage({
     params: { token },
     searchParams
   }: {
     params: { token: string }
     searchParams: { [key: string]: string | undefined }
   }) {
     try {
       const accessResult = await validateShortlinkAccess(token, searchParams)

       if (!accessResult.success) {
         return <AccessDenied reason={accessResult.reason} />
       }

       await trackShortlinkAccess(accessResult.shortlink.id, request)

       return <ShareView entry={accessResult.entry} />
     } catch (error) {
       return <ShareError error={error} />
     }
   }
   ```

---

## 6. Success Metrics & Performance Goals

### 6.1. Performance Targets

- **Page Load Time**: < 200ms for shortlink access pages
- **Cache Hit Rate**: > 95% for frequently accessed shortlinks
- **Database Query Time**: < 50ms for shortlink validation
- **Analytics Processing**: Real-time updates with < 1s latency

### 6.2. User Experience Goals

- **Link Creation Time**: < 3 seconds from click to shareable URL
- **Multi-Link Management**: Support 50+ active links per MFA entry
- **Analytics Visibility**: Real-time access tracking and insights
- **Strategy Flexibility**: 6+ sharing strategies with custom configurations

### 6.3. Security & Compliance

- **Access Validation**: 100% server-side validation with rate limiting
- **Audit Trail**: Complete analytics and access logging
- **Data Protection**: Encrypted shortlink tokens and password hashing
- **Enterprise Controls**: IP restrictions and custom domain support

---

## 7. Implementation Timeline

### 7.1. Phase 8A: Database & Core Infrastructure (Week 1)

- Database schema extensions
- Strategy system implementation
- Basic shortlink creation/management APIs

### 7.2. Phase 8B: Context7 Frontend Integration (Week 2)

- Server component dashboard
- Multi-strategy share modal
- Real-time analytics components

### 7.3. Phase 8C: Advanced Features & Polish (Week 3)

- QR code generation
- Custom domains and branding
- IP geofencing and enterprise features
- Performance optimization and caching

---

This phase establishes MFA Share as a comprehensive shortlink management platform with enterprise-grade features, leveraging Context7 patterns for optimal performance and user experience.
