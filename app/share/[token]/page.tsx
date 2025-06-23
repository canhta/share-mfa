import { redirect } from 'next/navigation'

import ShareView from '@/components/share/ShareView'

interface SharePageProps {
  params: Promise<{ token: string }>
  searchParams: Promise<{ p?: string }>
}

export default async function SharePage({ params, searchParams }: SharePageProps) {
  const { token } = await params
  const { p: embeddedPassword } = await searchParams

  if (!token) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-neutral bg-neutral-texture py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Shared MFA Code
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Access a shared TOTP code
          </p>
        </div>
        
        <ShareView token={token} embeddedPassword={embeddedPassword} />
      </div>
    </div>
  )
} 