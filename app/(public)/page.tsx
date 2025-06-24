"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { InView } from "@/components/motion-primitives/in-view";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/user");
        if (response.ok) {
          router.push("/dashboard");
        }
      } catch {
        // User not authenticated, stay on this page
        console.log("User not authenticated");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-neutral bg-neutral-texture">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-8 pb-16 text-center lg:pt-16">
          <TextEffect
            per="word"
            preset="slide"
            className="mx-auto max-w-4xl font-display text-5xl font-medium tracking-tight text-slate-900 sm:text-7xl"
            speedReveal={1.2}
          >
            Securely share MFA codes with friends
          </TextEffect>
          <TextEffect
            per="word"
            preset="fade-in-blur"
            delay={0.5}
            className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-700"
          >
            Share your TOTP-based multi-factor authentication codes securely
            with trusted friends and family members.
          </TextEffect>
          <div className="mt-10 flex justify-center gap-x-6">
            <InView
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.9 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.4, delay: 0.67, ease: "easeOut" }}
              viewOptions={{ once: true }}
            >
              <Link href="/login">
                <Button variant="primary" size="lg" className="rounded-full">
                  Get started
                </Button>
              </Link>
            </InView>
          </div>
        </div>

        <div className="mt-20 lg:mt-32">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <InView
              variants={{
                hidden: { opacity: 0, y: 40, scale: 0.9 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.4, delay: 0.067, ease: "easeOut" }}
              viewOptions={{ once: true }}
            >
              <Card hover className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-900">
                  Secure by Design
                </h3>
                <p className="mt-2 text-base text-slate-600">
                  All secrets are encrypted at rest and shared links can be
                  password protected.
                </p>
              </Card>
            </InView>

            <InView
              variants={{
                hidden: { opacity: 0, y: 40, scale: 0.9 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
              viewOptions={{ once: true }}
            >
              <Card hover className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                    />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-900">
                  Easy Sharing
                </h3>
                <p className="mt-2 text-base text-slate-600">
                  Generate shareable links with customizable expiration and
                  password protection.
                </p>
              </Card>
            </InView>

            <InView
              variants={{
                hidden: { opacity: 0, y: 40, scale: 0.9 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.4, delay: 0.33, ease: "easeOut" }}
              viewOptions={{ once: true }}
            >
              <Card hover className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                    />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-900">
                  Google Integration
                </h3>
                <p className="mt-2 text-base text-slate-600">
                  Sign in with Google and import your existing authenticator
                  codes.
                </p>
              </Card>
            </InView>
          </div>
        </div>
      </div>
    </div>
  );
}
