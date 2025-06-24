'use client';

import { Check, Shield, Star, Users, Zap } from 'lucide-react';
import { useState } from 'react';

import { GlowEffect } from '@/components/motion-primitives/glow-effect';
import { InView } from '@/components/motion-primitives/in-view';
import { TextEffect } from '@/components/motion-primitives/text-effect';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import FormInput from '@/components/ui/FormInput';
import FormTextarea from '@/components/ui/FormTextarea';
import Modal from '@/components/ui/Modal';
import ModalActions from '@/components/ui/ModalActions';

interface PricingTier {
  name: string;
  price: string;
  duration: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  ctaVariant?: 'primary' | 'secondary';
  icon: React.ComponentType<{ className?: string }>;
}

interface LeadFormData {
  name: string;
  email: string;
  company: string;
  message: string;
  tierInterest: 'pro' | 'enterprise' | 'newsletter';
}

const tiers: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    duration: 'forever',
    description: 'Perfect for personal use',
    features: [
      'Up to 5 MFA entries',
      'Up to 10 code shares per month',
      'Standard sharing features',
      'Community support',
      'Basic usage analytics',
    ],
    cta: 'Get Started Free',
    ctaVariant: 'secondary',
    icon: Shield,
  },
  {
    name: 'Pro',
    price: '$5',
    duration: 'per month',
    description: 'For power users and small teams',
    features: [
      'Unlimited MFA entries',
      'Unlimited code shares',
      'Advanced sharing controls',
      'Detailed analytics on shared links',
      'Priority email support',
      'QR code scanning',
      'Custom expiration times',
      'Share link management',
    ],
    cta: 'Start Pro Trial',
    popular: true,
    ctaVariant: 'primary',
    icon: Zap,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    duration: 'contact sales',
    description: 'For large teams and organizations',
    features: [
      'Everything in Pro',
      'Team management',
      'Shared workspaces',
      'Audit logs',
      'Single Sign-On (SSO)',
      'Priority phone support',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantees',
    ],
    cta: 'Contact Sales',
    ctaVariant: 'secondary',
    icon: Users,
  },
];

export default function PricingPage() {
  const [showContactModal, setShowContactModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [contactForm, setContactForm] = useState<LeadFormData>({
    name: '',
    email: '',
    company: '',
    message: '',
    tierInterest: 'enterprise',
  });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...contactForm,
          source: 'pricing_page',
          utm_source: new URLSearchParams(window.location.search).get('utm_source'),
          utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
          utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
          referrer_url: document.referrer,
        }),
      });

      if (response.ok) {
        setSubmitMessage("Thank you! We'll be in touch within 24 hours.");
        setContactForm({
          name: '',
          email: '',
          company: '',
          message: '',
          tierInterest: 'enterprise',
        });
        setTimeout(() => setShowContactModal(false), 2000);
      } else {
        setSubmitMessage('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      setSubmitMessage('Something went wrong. Please try again.');
    }

    setIsSubmitting(false);
  };

  const handleCtaClick = (tier: PricingTier) => {
    if (tier.name === 'Free') {
      window.location.href = '/login';
    } else if (tier.name === 'Pro') {
      window.location.href = '/billing/subscribe?plan=pro';
    } else if (tier.name === 'Enterprise') {
      setContactForm((prev) => ({ ...prev, tierInterest: 'enterprise' }));
      setShowContactModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-neutral bg-neutral-texture">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <TextEffect
              per="word"
              preset="slide"
              className="text-4xl md:text-6xl font-bold text-slate-900 mb-6"
              speedReveal={1.2}
            >
              Simple, transparent pricing
            </TextEffect>
            <TextEffect
              per="word"
              preset="fade-in-blur"
              delay={0.5}
              className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto"
            >
              Choose the perfect plan for your MFA sharing needs. Start free and scale as you grow.
            </TextEffect>
          </div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <InView
              key={tier.name}
              variants={{
                hidden: { opacity: 0, y: 40, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: 'easeOut',
              }}
              viewOptions={{ once: true }}
            >
              <div className="relative">
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1 text-sm font-medium">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                {tier.popular ? (
                  <div className="relative h-full">
                    <GlowEffect
                      colors={['#404040', '#525252', '#737373']}
                      mode="pulse"
                      className="absolute inset-0 -z-10 rounded-2xl"
                    />
                    <Card hover variant="elevated" className="glass-neutral h-full p-8 relative overflow-hidden">
                      <PricingCardContent tier={tier} onCtaClick={handleCtaClick} />
                    </Card>
                  </div>
                ) : (
                  <Card hover variant="elevated" className="surface-elevated h-full p-8">
                    <PricingCardContent tier={tier} onCtaClick={handleCtaClick} />
                  </Card>
                )}
              </div>
            </InView>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <InView
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          viewOptions={{ once: true }}
        >
          <div className="text-center mb-16">
            <TextEffect per="word" preset="slide" className="text-3xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </TextEffect>
          </div>
        </InView>

        <div className="space-y-6">
          {[
            {
              question: 'Can I upgrade or downgrade my plan anytime?',
              answer:
                'Yes, you can change your plan at any time. Changes will be reflected in your next billing cycle.',
            },
            {
              question: 'What happens to my data if I cancel?',
              answer:
                'Your data is kept for 30 days after cancellation, giving you time to export or reactivate your account.',
            },
            {
              question: 'Do you offer refunds?',
              answer: 'We offer a 14-day money-back guarantee for all paid plans, no questions asked.',
            },
            {
              question: 'How secure is my MFA data?',
              answer:
                'All data is encrypted at rest and in transit. We use industry-standard security practices and regular security audits.',
            },
          ].map((faq, index) => (
            <InView
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: 'easeOut',
              }}
              viewOptions={{ once: true }}
            >
              <Card className="surface-elevated p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{faq.question}</h3>
                <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
              </Card>
            </InView>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-neutral border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <InView
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            viewOptions={{ once: true }}
          >
            <TextEffect per="word" preset="slide" className="text-3xl font-bold text-slate-900 mb-4">
              Ready to get started?
            </TextEffect>
            <TextEffect per="word" preset="fade-in-blur" delay={0.3} className="text-xl text-slate-600 mb-8">
              Join thousands of users who trust us with their MFA codes.
            </TextEffect>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                className="rounded-xl"
                onClick={() => (window.location.href = '/login')}
              >
                Start Free Trial
              </Button>
              <Button variant="outline" size="lg" className="rounded-xl" onClick={() => setShowContactModal(true)}>
                Talk to Sales
              </Button>
            </div>
          </InView>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <Modal isOpen={showContactModal} onClose={() => setShowContactModal(false)} title="Contact Sales">
          <form onSubmit={handleContactSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                id="contact-name"
                label="Name"
                type="text"
                value={contactForm.name}
                onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                className="focus-ring-neutral"
              />
              <FormInput
                id="contact-email"
                label="Email"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
                required
                className="focus-ring-neutral"
              />
            </div>
            <FormInput
              id="contact-company"
              label="Company"
              type="text"
              value={contactForm.company}
              onChange={(e) => setContactForm((prev) => ({ ...prev, company: e.target.value }))}
              className="focus-ring-neutral"
            />
            <FormTextarea
              id="contact-message"
              label="Message"
              value={contactForm.message}
              onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))}
              rows={4}
              placeholder="Tell us about your needs..."
              className="focus-ring-neutral"
            />

            {submitMessage && (
              <Alert variant={submitMessage.includes('Thank you') ? 'success' : 'destructive'}>{submitMessage}</Alert>
            )}

            <ModalActions>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowContactModal(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isSubmitting} className="rounded-xl">
                Send Message
              </Button>
            </ModalActions>
          </form>
        </Modal>
      )}
    </div>
  );
}

// Extracted component for pricing card content
function PricingCardContent({ tier, onCtaClick }: { tier: PricingTier; onCtaClick: (tier: PricingTier) => void }) {
  const IconComponent = tier.icon;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-6 rounded-full bg-primary/10">
        <IconComponent className="w-6 h-6 text-primary" />
      </div>

      <div className="text-center mb-6">
        <h3 className="text-2xl font-semibold text-slate-900 mb-2">{tier.name}</h3>
        <p className="text-slate-600 mb-4">{tier.description}</p>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-5xl font-bold text-slate-900">{tier.price}</span>
          <span className="text-slate-600 ml-1">/{tier.duration}</span>
        </div>
      </div>

      <ul className="space-y-3 mb-8 flex-grow">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-slate-600 text-sm leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>

      <Button variant={tier.ctaVariant} size="lg" className="w-full rounded-xl" onClick={() => onCtaClick(tier)}>
        {tier.cta}
      </Button>
    </div>
  );
}
