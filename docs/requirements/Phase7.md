# Phase 7 Requirements: Context7 Optimization & Next.js 15 Performance Engineering

This document outlines Phase 7 development, focusing on implementing Context7 best practices, leveraging Next.js 15 advanced features, and achieving optimal caching, server-side rendering, and performance characteristics.

---

## 1. Context7 Implementation & Client-Side Fetching Elimination

### 1.1. Objective

Complete the Context7 refactoring by eliminating all remaining client-side data fetching patterns and implementing a centralized, server-first architecture that maximizes Next.js 15 Server Components and streaming capabilities.

### 1.2. Current State Analysis

Based on codebase analysis and Context7 research, the following areas require optimization:

**Supabase Client Patterns (Critical Updates Required):**

- **AuthProvider.tsx**: Still uses deprecated `createClientComponentClient` pattern
- **Middleware.ts**: Should use new `@supabase/ssr` patterns with `updateSession`
- **Server Components**: Missing `createServerClient` with proper cookie handling
- **Authentication**: Not using `supabase.auth.getUser()` for server-side protection

**Prisma Optimization Opportunities:**

- **No Prisma Accelerate**: Missing edge caching with `withAccelerate()`
- **Connection Management**: Multiple PrismaClient instances causing connection exhaustion
- **Query Optimization**: No cache strategies, tags, or TTL configurations
- **N+1 Query Problems**: Missing fluent API usage for batched queries

**Next.js 15 Advanced Features:**

- **Missing cache() implementation**: No usage of React 19 cache() function
- **No streaming optimization**: Limited use of Suspense boundaries for progressive loading
- **Edge Runtime**: No optimization for global performance
- **Server Actions**: Missing optimistic updates and proper revalidation

### 1.3. Key Changes

- Implement comprehensive server-side data fetching with React 19/Next.js 15 cache()
- Create centralized app context with server data injection
- Eliminate all useEffect + fetch patterns
- Replace client-side auth state with server-side session management
- Implement streaming server rendering with proper Suspense boundaries

---

## 2. Context7 Supabase Optimization Implementation

### 2.1. Supabase SSR Migration (Critical Priority)

1. **Update Server Client Creation (Following Context7 Best Practices):**

   ```typescript
   // utils/supabase/server.ts
   import { createServerClient } from '@supabase/ssr';
   import { cookies } from 'next/headers';

   export async function createClient() {
     const cookieStore = await cookies();

     return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
       cookies: {
         getAll() {
           return cookieStore.getAll();
         },
         setAll(cookiesToSet) {
           try {
             cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
           } catch {
             // The `setAll` method was called from a Server Component.
             // This can be ignored if you have middleware refreshing
             // user sessions.
           }
         },
       },
     });
   }
   ```

2. **Implement Proper Authentication Middleware:**

   ```typescript
   // middleware.ts
   import { type NextRequest } from 'next/server';
   import { updateSession } from '@/utils/supabase/middleware';

   export async function middleware(request: NextRequest) {
     return await updateSession(request);
   }

   export const config = {
     matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
   };
   ```

3. **Server-Side Authentication Protection:**

   ```typescript
   // app/(protected)/dashboard/page.tsx
   import { redirect } from 'next/navigation'
   import { createClient } from '@/utils/supabase/server'

   export default async function PrivatePage() {
     const supabase = await createClient()
     const { data, error } = await supabase.auth.getUser()

     if (error || !data?.user) {
       redirect('/login')
     }

     return <DashboardContent user={data.user} />
   }
   ```

### 2.2. Next.js 15 Cache Implementation with Supabase

1. **Implement cache() for Supabase data functions:**

   ```typescript
   // lib/data/cached-data.ts
   import { cache } from 'react';
   import { createClient } from '@/utils/supabase/server';

   export const getCachedUser = cache(async () => {
     const supabase = await createClient();
     const {
       data: { user },
     } = await supabase.auth.getUser();
     return user;
   });

   export const getCachedMfaEntries = cache(async (userId: string) => {
     const supabase = await createClient();
     const { data } = await supabase.from('mfa_entries').select('*').eq('userId', userId);
     return data;
   });
   ```

2. **Convert to async Server Components:**

   ```typescript
   // app/(protected)/dashboard/page.tsx
   export default async function DashboardPage() {
     const [user, mfaEntries, usage] = await Promise.all([
       getCachedUser(),
       getCachedMfaEntries(user.id),
       getCachedUsageStats(user.id)
     ])

     return (
       <Suspense fallback={<DashboardSkeleton />}>
         <DashboardContent user={user} entries={mfaEntries} usage={usage} />
       </Suspense>
     )
   }
   ```

---

## 3. Context7 Prisma Performance Engineering

### 3.1. Prisma Accelerate Implementation (High Priority)

1. **Install and Configure Prisma Accelerate:**

   ```bash
   npm install @prisma/extension-accelerate
   ```

2. **Extend Prisma Client with Accelerate:**

   ```typescript
   // lib/prisma.ts
   import { PrismaClient } from '@prisma/client';
   import { withAccelerate } from '@prisma/extension-accelerate';

   // Single global instance to prevent connection exhaustion
   export const prisma = new PrismaClient().$extends(withAccelerate());
   ```

3. **Implement Cache Strategies with TTL and SWR:**

   ```typescript
   // lib/data/mfa-data.ts
   export async function getCachedMfaEntries(userId: string) {
     return await prisma.mfaEntries.findMany({
       where: { userId },
       select: { id: true, service: true, secret: true, createdAt: true },
       cacheStrategy: {
         ttl: 300, // Fresh for 5 minutes
         swr: 600, // Serve stale for up to 10 minutes while revalidating
         tags: [`mfa-entries-${userId}`, 'mfa-entries'],
       },
     });
   }
   ```

4. **Implement Targeted Cache Invalidation:**

   ```typescript
   // app/actions/mfa-actions.ts
   'use server';

   export async function createMfaEntry(formData: FormData) {
     const newEntry = await prisma.mfaEntries.create({
       data: {
         /* entry data */
       },
     });

     // Invalidate specific cache tags
     try {
       await prisma.$accelerate.invalidate({
         tags: [`mfa-entries-${newEntry.userId}`, 'mfa-entries'],
       });
     } catch (e) {
       if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P6003') {
         console.log('Cache invalidation rate limit reached. Please try again later.');
       }
       throw e;
     }

     return { success: true, data: newEntry };
   }
   ```

### 3.2. Query Optimization Patterns

1. **Prevent N+1 Queries with Fluent API:**

   ```typescript
   // Instead of this (causes N+1 problem):
   const users = await prisma.user.findMany({});
   users.forEach(async (user) => {
     const mfaEntries = await prisma.mfaEntries.findMany({
       where: { userId: user.id },
     });
   });

   // Use this (batched queries):
   const users = await prisma.user.findMany({
     include: {
       mfaEntries: {
         select: { id: true, service: true, createdAt: true },
       },
     },
     cacheStrategy: { ttl: 300, swr: 600, tags: ['users-with-mfa'] },
   });
   ```

2. **Optimize Middleware Performance:**
   ```typescript
   // lib/prisma-middleware.ts
   prisma.$use(async (params, next) => {
     // Only run logic for specific models/actions to prevent overhead
     if (params.model === 'MfaEntries' && params.action === 'delete') {
       // Audit logging logic here
     }
     return next(params);
   });
   ```

### 3.3. Edge Runtime Optimization

1. **Configure Edge Runtime for API Routes:**

   ```typescript
   // app/api/mfa/route.ts
   import { NextResponse } from 'next/server';
   import { PrismaClient } from '@prisma/client';
   import { PrismaNeon } from '@prisma/adapter-neon';

   export const runtime = 'edge';

   export async function GET(request: Request) {
     const adapter = new PrismaNeon({
       connectionString: process.env.DATABASE_URL,
     });
     const prisma = new PrismaClient({ adapter });

     const entries = await prisma.mfaEntries.findMany({
       cacheStrategy: { ttl: 300, swr: 600 },
     });

     return NextResponse.json(entries, { status: 200 });
   }
   ```

### 2.2. Streaming & Progressive Enhancement

1. **Implement streaming layouts:**

   ```typescript
   // app/(protected)/layout.tsx
   export default async function ProtectedLayout({ children }) {
     return (
       <div className="min-h-screen">
         <Suspense fallback={<HeaderSkeleton />}>
           <Header />
         </Suspense>

         <main>
           <Suspense fallback={<MainContentSkeleton />}>
             {children}
           </Suspense>
         </main>

         <Suspense fallback={<FooterSkeleton />}>
           <Footer />
         </Suspense>
       </div>
     )
   }
   ```

2. **Create intelligent loading boundaries:**
   - Critical content loads first (navigation, primary actions)
   - Secondary content streams in progressively (analytics, recommendations)
   - Non-critical content loads lazily (tooltips, help content)

### 2.3. Server Actions with Supabase Authentication

1. **Implement authentication server actions:**

   ```typescript
   // app/login/actions.ts
   'use server';
   import { revalidatePath } from 'next/cache';
   import { redirect } from 'next/navigation';
   import { createClient } from '@/utils/supabase/server';

   export async function login(formData: FormData) {
     const supabase = await createClient();

     const data = {
       email: formData.get('email') as string,
       password: formData.get('password') as string,
     };

     const { error } = await supabase.auth.signInWithPassword(data);

     if (error) {
       redirect('/error');
     }

     revalidatePath('/', 'layout');
     redirect('/dashboard');
   }

   export async function signup(formData: FormData) {
     const supabase = await createClient();

     const data = {
       email: formData.get('email') as string,
       password: formData.get('password') as string,
     };

     const { error } = await supabase.auth.signUp(data);

     if (error) {
       redirect('/error');
     }

     revalidatePath('/', 'layout');
     redirect('/account');
   }
   ```

2. **Implement data mutations with proper revalidation:**

   ```typescript
   // app/actions/mfa-actions.ts
   'use server';
   import { revalidateTag, revalidatePath } from 'next/cache';
   import { createClient } from '@/utils/supabase/server';

   export async function createMfaEntry(formData: FormData) {
     const supabase = await createClient();

     // Ensure user is authenticated
     const {
       data: { user },
       error,
     } = await supabase.auth.getUser();
     if (error || !user) {
       throw new Error('Unauthorized');
     }

     // Create entry in Supabase
     const { data: newEntry, error: insertError } = await supabase
       .from('mfa_entries')
       .insert({
         user_id: user.id,
         service: formData.get('service') as string,
         secret: formData.get('secret') as string,
       })
       .select()
       .single();

     if (insertError) {
       throw new Error('Failed to create MFA entry');
     }

     // Revalidate relevant cache tags and paths
     revalidateTag('mfa-entries');
     revalidateTag(`mfa-entries-${user.id}`);
     revalidatePath('/dashboard');

     return { success: true, data: newEntry };
   }
   ```

---

## 4. Context7 Advanced Caching Strategy Implementation

### 4.1. Multi-Layer Caching Architecture with Context7 Patterns

1. **Request-level caching with React 19 cache() and Supabase:**

   ```typescript
   // lib/data/supabase-cached.ts
   import { cache } from 'react';
   import { createClient } from '@/utils/supabase/server';

   export const getCachedUser = cache(async () => {
     const supabase = await createClient();
     const {
       data: { user },
     } = await supabase.auth.getUser();
     return user;
   });

   export const getCachedMfaEntries = cache(async (userId: string) => {
     const supabase = await createClient();
     const { data } = await supabase
       .from('mfa_entries')
       .select('id, service, secret, created_at')
       .eq('user_id', userId);
     return data;
   });
   ```

2. **Supabase ISR and Dynamic Rendering Patterns:**

   ```typescript
   // app/(protected)/dashboard/page.tsx
   import { createClient } from '@/utils/supabase/server'

   // For frequently changing data - force dynamic
   export const revalidate = 0
   // Alternative: export const dynamic = 'force-dynamic'

   export default async function DashboardPage() {
     const supabase = await createClient()
     const { data: mfaEntries } = await supabase
       .from('mfa_entries')
       .select('*')

     return <DashboardContent entries={mfaEntries} />
   }
   ```

   ```typescript
   // app/public/stats/page.tsx - For semi-static content
   export const revalidate = 60 // ISR with 60 second revalidation

   export default async function StatsPage() {
     const supabase = await createClient()
     const { data: stats } = await supabase
       .from('usage_stats')
       .select('*')

     return <StatsContent stats={stats} />
   }
   ```

3. **Prisma Accelerate with Edge Caching:**

   ```typescript
   // lib/data/prisma-cached.ts
   export const getCachedMfaEntry = async (id: string) => {
     return await prisma.mfaEntries.findUnique({
       where: { id },
       include: {
         user: { select: { id: true, email: true } },
       },
       cacheStrategy: {
         ttl: 300, // Fresh for 5 minutes
         swr: 600, // Serve stale for up to 10 minutes
         tags: [`mfa-entry-${id}`, 'mfa-entries'],
       },
     });
   };
   ```

4. **Edge Runtime API Routes with Supabase:**

   ```typescript
   // app/api/mfa/route.ts
   import { createClient } from '@/utils/supabase/server';

   export const runtime = 'edge';
   export const dynamic = 'force-dynamic';

   export async function GET(request: Request) {
     const supabase = await createClient();
     const url = new URL(request.url);
     const userId = url.searchParams.get('userId');

     const { data: entries } = await supabase
       .from('mfa_entries')
       .select('id, service, secret, created_at')
       .eq('user_id', userId);

     return Response.json(entries, {
       headers: {
         'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
       },
     });
   }
   ```

### 3.2. Smart Revalidation Strategies

1. **Time-based revalidation for static content:**
   - Public pages: 1 hour
   - User dashboards: 5 minutes
   - Admin pages: 30 minutes

2. **Tag-based revalidation for dynamic updates:**

   ```typescript
   // Use tags for granular cache invalidation
   const tags = ['user', `user-${userId}`, 'mfa-entries', `mfa-${entryId}`];

   const data = await fetch(`/api/data`, {
     next: { revalidate: 300, tags },
   });
   ```

3. **On-demand revalidation for real-time updates:**
   - MFA entry creation/deletion: Immediate revalidation
   - User settings changes: Immediate revalidation
   - Admin actions: Immediate revalidation

---

## 4. Context Management & State Architecture

### 4.1. Centralized App Context

1. **Create server-injected app context:**

   ```typescript
   // lib/contexts/app-context.tsx
   'use client'

   interface AppContextType {
     user: User | null
     mfaEntries: MfaEntry[]
     usage: UsageStats
     settings: UserSettings
   }

   export function AppProvider({ children, serverData }: {
     children: React.ReactNode
     serverData: AppContextType
   }) {
     return (
       <AppContext.Provider value={serverData}>
         {children}
       </AppContext.Provider>
     )
   }
   ```

2. **Server-side data fetching in root layout:**
   ```typescript
   // app/(protected)/layout.tsx
   export default async function ProtectedLayout({ children }) {
     const serverData = await getServerData()

     return (
       <AppProvider serverData={serverData}>
         {children}
       </AppProvider>
     )
   }
   ```

### 4.2. Eliminate Client-Side Providers

1. **Replace AuthProvider with server-side auth:**
   - Remove client-side auth state management
   - Use server-side session validation
   - Implement auth context for client components only when needed

2. **Optimize UserProvider:**
   - Remove useEffect patterns
   - Use server-injected user data
   - Maintain minimal client state for UI interactions only

---

## 5. Performance Optimization Implementation

### 5.1. Core Web Vitals Optimization

1. **Largest Contentful Paint (LCP) - Target: <2.5s:**
   - Implement priority prop for hero images
   - Use Next.js Image component with proper sizing
   - Optimize font loading with font-display: swap

2. **Interaction to Next Paint (INP) - Target: <200ms:**
   - Implement React Suspense for non-blocking UI
   - Use Server Actions for form submissions
   - Optimize JavaScript bundle with dynamic imports

3. **Cumulative Layout Shift (CLS) - Target: <0.1:**
   - Reserve space for images with aspect-ratio
   - Avoid dynamically injected content above fold
   - Use skeleton loaders with correct dimensions

### 5.2. Bundle Optimization

1. **Dynamic imports for heavy components:**

   ```typescript
   const HeavyChart = dynamic(() => import('../components/HeavyChart'), {
     loading: () => <ChartSkeleton />,
     ssr: false
   })
   ```

2. **Route-based code splitting:**
   - Admin routes bundled separately
   - Dashboard components lazy-loaded
   - Authentication flow optimized

3. **Third-party script optimization:**

   ```typescript
   // app/layout.tsx
   import Script from 'next/script'

   <Script
     src="https://analytics.example.com/script.js"
     strategy="afterInteractive"
   />
   ```

### 5.3. Image & Asset Optimization

1. **Next.js Image component configuration:**

   ```typescript
   // next.config.ts
   const nextConfig = {
     images: {
       formats: ['image/avif', 'image/webp'],
       deviceSizes: [640, 750, 828, 1080, 1200, 1920],
       imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
     },
   };
   ```

2. **Font optimization:**

   ```typescript
   // app/layout.tsx
   import { Inter } from 'next/font/google';

   const inter = Inter({
     subsets: ['latin'],
     display: 'swap',
     variable: '--font-inter',
   });
   ```

---

## 6. Monitoring & Analytics Implementation

### 6.1. Performance Monitoring

1. **Vercel Analytics integration:**

   ```typescript
   // app/layout.tsx
   import { Analytics } from '@vercel/analytics/react'
   import { SpeedInsights } from '@vercel/speed-insights/next'

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
           <SpeedInsights />
         </body>
       </html>
     )
   }
   ```

2. **Custom performance metrics:**
   - Track MFA generation time
   - Monitor share link access patterns
   - Measure auth flow completion rates

### 6.2. Real User Monitoring (RUM)

1. **Core Web Vitals tracking:**
   - LCP for dashboard pages
   - INP for form interactions
   - CLS for dynamic content

2. **Custom business metrics:**
   - Time to MFA generation
   - Share success rates
   - User engagement patterns

---

## 7. Implementation Timeline & Deliverables

### 7.1. Phase 7.1: Context7 Foundation (Week 1-2)

1. **Context7 research and planning:**
   - Research latest Context7 patterns and documentation
   - Audit current client-side fetching patterns
   - Plan migration strategy

2. **Core infrastructure:**
   - Implement cache() for all data functions
   - Create centralized app context
   - Migrate AuthProvider to server-side pattern

### 7.2. Phase 7.2: Advanced Caching (Week 3-4)

1. **Multi-layer caching implementation:**
   - Request-level caching with cache()
   - Route-level caching configuration
   - Database query optimization

2. **Revalidation strategies:**
   - Time-based revalidation setup
   - Tag-based revalidation implementation
   - On-demand revalidation for real-time updates

### 7.3. Phase 7.3: Performance Optimization (Week 5-6)

1. **Core Web Vitals optimization:**
   - LCP optimization with image and font loading
   - INP optimization with Suspense and Server Actions
   - CLS prevention with layout reservations

2. **Bundle and asset optimization:**
   - Dynamic imports implementation
   - Code splitting optimization
   - Third-party script management

### 7.4. Phase 7.4: Monitoring & Validation (Week 7-8)

1. **Analytics and monitoring setup:**
   - Vercel Analytics integration
   - Custom performance tracking
   - Real User Monitoring implementation

2. **Performance validation:**
   - Lighthouse score optimization (target: 95+)
   - Core Web Vitals compliance
   - Load testing and optimization

---

## 8. Context7 Performance Monitoring & Analytics

### 8.1. Prisma Performance Metrics (Based on Context7 Research)

1. **Implement Prisma Optimize Metrics Tracking:**

   ```typescript
   // lib/monitoring/prisma-metrics.ts
   interface PrismaMetrics {
     avg: number; // Average query duration
     p50: number; // 50th percentile (median)
     p99: number; // 99th percentile
     max: number; // Maximum query duration
   }

   export function trackQueryPerformance() {
     // Track query performance with these targets:
     // AVG: <50ms for cached queries, <200ms for complex queries
     // P50: <100ms for typical user performance
     // P99: <500ms for slowest 1% of queries (critical for UX)
     // MAX: <1000ms for absolute worst case scenarios
   }
   ```

2. **Monitor Prisma Accelerate Cache Performance:**
   ```typescript
   // Track cache hit rates and invalidation patterns
   export function monitorCachePerformance() {
     // Target metrics:
     // - Cache hit rate: >90%
     // - Cache invalidation latency: <100ms
     // - TTL effectiveness: >80% of queries served from cache
     // - SWR efficiency: <200ms background revalidation
   }
   ```

### 8.2. Supabase Performance Monitoring

1. **Connection Pool and Query Monitoring:**

   ```typescript
   // Monitor Supabase connection performance
   export function trackSupabaseMetrics() {
     // Target metrics:
     // - Connection establishment: <100ms
     // - Query execution: <200ms for simple queries
     // - Auth operations: <300ms for login/signup
     // - Edge proximity: <50ms TTFB from nearest edge
   }
   ```

2. **Real-time Monitoring Setup:**
   ```typescript
   // app/lib/monitoring/realtime-metrics.ts
   export function setupRealtimeMonitoring() {
     // Track:
     // - Database query latencies
     // - Authentication success/failure rates
     // - API response times across different regions
     // - Cache effectiveness metrics
   }
   ```

## 9. Success Metrics & Targets

### 9.1. Context7 Implementation Targets

- **Supabase Migration:** 100% migration to `@supabase/ssr` patterns
- **Prisma Accelerate:** 90%+ cache hit rate achieved
- **Client-side Fetching:** Zero remaining useEffect + fetch patterns
- **Server Components:** 95%+ of components converted to Server Components
- **Edge Runtime:** 50%+ of API routes optimized for Edge Runtime

### 9.2. Performance Targets (Based on Context7 Research)

- **Lighthouse Score:** 95+ for all primary pages
- **LCP:** <1.2s for 95% of page loads (stricter than before)
- **INP:** <100ms for all interactions (optimized with Server Actions)
- **CLS:** <0.1 for all pages
- **TTFB:** <50ms for edge-cached content, <200ms for dynamic pages

### 9.3. Database & Caching Performance

- **Prisma Query Performance:**
  - Average: <50ms for cached queries
  - P99: <200ms for complex queries
  - Cache hit rate: >90%
  - Connection pool efficiency: >95%

- **Supabase Performance:**
  - Auth operations: <200ms
  - Simple queries: <100ms
  - Complex queries: <300ms
  - Real-time subscriptions: <50ms latency

### 9.4. Developer Experience Metrics

- **Build Performance:** <90 seconds full build with optimizations
- **Development Speed:** <500ms hot reload with Turbopack
- **Type Safety:** 100% TypeScript coverage for database operations
- **Cache Debugging:** Comprehensive cache hit/miss tracking in development

---

## 9. Risk Mitigation & Rollback Strategy

### 9.1. Incremental Implementation

- Implement changes feature by feature, not all at once
- Use feature flags for gradual rollout
- Monitor performance metrics during each deployment

### 9.2. Fallback Mechanisms

- Maintain backward compatibility during transition
- Keep current patterns functional until migration complete
- Implement graceful degradation for cache failures

### 9.3. Testing Strategy

- Comprehensive unit tests for cache functions
- Integration tests for Server Components
- End-to-end performance testing
- Load testing for high-traffic scenarios

---

## 10. Implementation Timeline & Priorities

### 10.1. Week 1-2: Context7 Foundation & Supabase Migration

**Priority 1: Supabase SSR Migration (Critical)**

- [ ] Install `@supabase/ssr` and update all client creation patterns
- [ ] Migrate from `createServerComponentClient` to new `createServerClient`
- [ ] Update middleware to use `updateSession` pattern
- [ ] Replace `supabase.auth.getSession()` with `supabase.auth.getUser()` for protection

**Priority 2: Eliminate Client-Side Fetching**

- [ ] Remove all `useEffect + fetch` patterns
- [ ] Convert AuthProvider and UserProvider to server-side patterns
- [ ] Implement React 19 `cache()` for all data functions

### 10.2. Week 3-4: Prisma Accelerate & Performance Engineering

**Priority 1: Prisma Accelerate Implementation**

- [ ] Install and configure `@prisma/extension-accelerate`
- [ ] Create single global PrismaClient instance
- [ ] Implement cache strategies with TTL, SWR, and tags
- [ ] Set up cache invalidation patterns

**Priority 2: Query Optimization**

- [ ] Identify and fix N+1 query problems with fluent API
- [ ] Implement Edge Runtime for API routes with PrismaNeon adapter
- [ ] Add middleware optimization with conditional logic

### 10.3. Week 5-6: Advanced Caching & Edge Optimization

**Priority 1: Multi-Layer Caching Architecture**

- [ ] Implement ISR with `revalidate` exports for appropriate pages
- [ ] Set up dynamic rendering with `revalidate = 0` for real-time data
- [ ] Configure edge caching with proper Cache-Control headers

**Priority 2: Server Actions & Revalidation**

- [ ] Implement authentication server actions with proper error handling
- [ ] Set up smart revalidation with tags and paths
- [ ] Add optimistic updates where appropriate

### 10.4. Week 7-8: Monitoring & Performance Validation

**Priority 1: Performance Monitoring Setup**

- [ ] Implement Prisma performance metrics tracking (AVG, P50, P99, MAX)
- [ ] Set up Supabase connection and query monitoring
- [ ] Configure real-time monitoring for cache effectiveness

**Priority 2: Validation & Optimization**

- [ ] Achieve Context7 performance targets
- [ ] Validate all success metrics are met
- [ ] Performance testing and final optimizations

---

## 11. Context7 Research Integration Summary

This Phase 7 implementation leverages extensive Context7 research findings:

**Supabase Optimizations:**

- Modern `@supabase/ssr` patterns for Next.js 15 compatibility
- Proper authentication flows with `getUser()` for server-side protection
- Edge Runtime optimization for global performance
- ISR and dynamic rendering strategies for optimal caching

**Prisma Performance Engineering:**

- Accelerate edge caching with TTL/SWR strategies
- Connection pool optimization to prevent exhaustion
- Query optimization patterns to eliminate N+1 problems
- Comprehensive performance monitoring with industry-standard metrics

**Next.js 15 Advanced Features:**

- React 19 `cache()` function for request-level caching
- Server Components architecture with proper streaming
- Server Actions with optimistic updates and smart revalidation
- Edge Runtime deployment for maximum global performance

This Context7-optimized implementation will establish the MFA sharing application as a showcase of modern Next.js 15 performance engineering, delivering exceptional user experience while maintaining developer productivity and code maintainability.
