import { redirect } from 'next/navigation'

import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import { InView } from '@/components/motion-primitives/in-view'
import { TextEffect } from '@/components/motion-primitives/text-effect'
import Card from '@/components/ui/Card'
import { createClient } from '@/utils/supabase/server'

export default async function LoginPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 bg-subtle-pattern py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <InView
          variants={{
            hidden: { opacity: 0, y: 30, scale: 0.95 },
            visible: { opacity: 1, y: 0, scale: 1 }
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewOptions={{ once: true }}
        >
          <Card className="space-y-8">
            <div>
              <TextEffect 
                per="word" 
                preset="slide"
                className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white"
              >
                Sign in to MFA Share
              </TextEffect>
              <TextEffect 
                per="word" 
                preset="fade-in-blur"
                delay={0.4}
                className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400"
              >
                Securely share your TOTP codes with friends
              </TextEffect>
            </div>
            
            <div className="mt-8 space-y-6">
              <InView
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
                viewOptions={{ once: true }}
              >
                <GoogleSignInButton />
              </InView>
              
              <InView
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1 }
                }}
                transition={{ duration: 0.5, delay: 1.0, ease: "easeOut" }}
                viewOptions={{ once: true }}
              >
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    By signing in, you agree to our terms of service and privacy policy.
                  </p>
                </div>
              </InView>
            </div>
          </Card>
        </InView>
      </div>
    </div>
  )
} 