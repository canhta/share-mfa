"use client";

import { motion } from "motion/react";
import Link from "next/link";

import { InView } from "@/components/motion-primitives/in-view";
import { TextEffect } from "@/components/motion-primitives/text-effect";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-texture">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <InView
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          viewOptions={{ once: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <TextEffect
                per="char"
                preset="slide"
                className="text-xl font-bold text-gray-900"
                speedReveal={1.2}
              >
                ShareMFA
              </TextEffect>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Securely share your TOTP-based multi-factor authentication codes
                with trusted friends and family members.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Quick Links
              </h3>
              <div className="space-y-2">
                {[
                  { name: "MFA", href: "/mfa" },
                  { name: "Billing", href: "/billing" },
                  { name: "Pricing", href: "/pricing" },
                ].map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.067 + index * 0.033, duration: 0.33 }}
                  >
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-gray-900 transition-colors duration-150 block"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Legal
              </h3>
              <div className="space-y-2">
                {[
                  { name: "Privacy Policy", href: "/privacy" },
                  { name: "Terms of Service", href: "/terms" },
                  { name: "Security", href: "/security" },
                ].map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.13 + index * 0.033, duration: 0.33 }}
                  >
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-gray-900 transition-colors duration-150 block"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Border */}
          <motion.div
            className="mt-12 pt-8 border-t border-gray-200/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.27, duration: 0.4 }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <p className="text-sm text-muted-foreground">
                © {currentYear} ShareMFA. All rights reserved.
              </p>
              <div className="flex items-center space-x-4">
                <p className="text-xs text-muted-foreground">
                  Built with security in mind
                </p>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <p className="text-xs text-muted-foreground">
                  End-to-end encrypted
                </p>
              </div>
            </div>
          </motion.div>
        </InView>
      </div>
    </footer>
  );
}
