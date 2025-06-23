import { redirect } from "next/navigation";

import { InView } from "@/components/motion-primitives/in-view";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import ShareView from "@/components/share/ShareView";

interface SharePageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ p?: string }>;
}

export default async function SharePage({
  params,
  searchParams,
}: SharePageProps) {
  const { token } = await params;
  const { p: embeddedPassword } = await searchParams;

  if (!token) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gradient-neutral bg-neutral-texture flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <InView
          variants={{
            hidden: { opacity: 0, y: 30, scale: 0.95 },
            visible: { opacity: 1, y: 0, scale: 1 },
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewOptions={{ once: true }}
        >
          <div className="text-center mb-8">
            <TextEffect
              per="word"
              preset="slide"
              className="text-3xl font-bold text-slate-900 mb-4"
            >
              Shared MFA Code
            </TextEffect>
            <TextEffect
              per="word"
              preset="fade-in-blur"
              delay={0.4}
              className="text-base text-slate-600"
            >
              Access a shared TOTP code below
            </TextEffect>
          </div>
        </InView>

        <InView
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.95 },
            visible: { opacity: 1, y: 0, scale: 1 },
          }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          viewOptions={{ once: true }}
        >
          <ShareView token={token} embeddedPassword={embeddedPassword} />
        </InView>
      </div>
    </div>
  );
}
