'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { InView } from '@/components/motion-primitives/in-view';
import { TextEffect } from '@/components/motion-primitives/text-effect';
import Card from '@/components/ui/Card';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          router.push('/dashboard');
        }
      } catch {
        // User not authenticated, stay on login page
        console.log('User not authenticated');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-neutral bg-neutral-texture py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <InView
          variants={{
            hidden: { opacity: 0, y: 30, scale: 0.95 },
            visible: { opacity: 1, y: 0, scale: 1 },
          }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          viewOptions={{ once: true }}
        >
          <Card className="space-y-8">
            <div>
              <TextEffect per="word" preset="slide" className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                Sign in to MFA Share
              </TextEffect>
              <TextEffect
                per="word"
                preset="fade-in-blur"
                delay={0.4}
                className="mt-2 text-center text-sm text-slate-600"
              >
                Securely share your TOTP codes with friends
              </TextEffect>
            </div>

            <div className="mt-8 space-y-6">
              <InView
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.33, delay: 0.53, ease: 'easeOut' }}
                viewOptions={{ once: true }}
              >
                <GoogleSignInButton />
              </InView>

              <InView
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1 },
                }}
                transition={{ duration: 0.33, delay: 0.67, ease: 'easeOut' }}
                viewOptions={{ once: true }}
              >
                <div className="text-center">
                  <p className="text-xs text-slate-500">
                    By signing in, you agree to our terms of service and privacy policy.
                  </p>
                </div>
              </InView>
            </div>
          </Card>
        </InView>
      </div>
    </div>
  );
}
