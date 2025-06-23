'use client'

import { Check, Shield, Star, Users,Zap } from 'lucide-react'
import { useState } from 'react'

import Alert from '@/components/ui/Alert'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import FormInput from '@/components/ui/FormInput'
import FormTextarea from '@/components/ui/FormTextarea'
import Modal from '@/components/ui/Modal'
import ModalActions from '@/components/ui/ModalActions'

interface PricingTier {
  name: string
  price: string
  duration: string
  description: string
  features: string[]
  cta: string
  popular?: boolean
  ctaVariant?: 'primary' | 'secondary'
  icon: React.ComponentType<{ className?: string }>
}

interface LeadFormData {
  name: string
  email: string
  company: string
  message: string
  tierInterest: 'pro' | 'enterprise' | 'newsletter'
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
      'Basic usage analytics'
    ],
    cta: 'Get Started Free',
    ctaVariant: 'secondary',
    icon: Shield
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
      'Share link management'
    ],
    cta: 'Start Pro Trial',
    popular: true,
    ctaVariant: 'primary',
    icon: Zap
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
      'SLA guarantees'
    ],
    cta: 'Contact Sales',
    ctaVariant: 'secondary',
    icon: Users
  }
]

export default function PricingPage() {
  const [showContactModal, setShowContactModal] = useState(false)
  const [showNewsletterModal, setShowNewsletterModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [contactForm, setContactForm] = useState<LeadFormData>({
    name: '',
    email: '',
    company: '',
    message: '',
    tierInterest: 'enterprise'
  })
  const [newsletterEmail, setNewsletterEmail] = useState('')

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

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
          referrer_url: document.referrer
        }),
      })

      if (response.ok) {
        setSubmitMessage('Thank you! We\'ll be in touch within 24 hours.')
        setContactForm({ name: '', email: '', company: '', message: '', tierInterest: 'enterprise' })
        setTimeout(() => setShowContactModal(false), 2000)
      } else {
        setSubmitMessage('Something went wrong. Please try again.')
      }
    } catch (error) {
      console.error('Contact form submission error:', error)
      setSubmitMessage('Something went wrong. Please try again.')
    }

    setIsSubmitting(false)
  }

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newsletterEmail,
          tierInterest: 'newsletter',
          source: 'pricing_page_newsletter',
          utm_source: new URLSearchParams(window.location.search).get('utm_source'),
          utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
          utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
          referrer_url: document.referrer
        }),
      })

      if (response.ok) {
        setSubmitMessage('Thank you for subscribing! Check your email for confirmation.')
        setNewsletterEmail('')
        setTimeout(() => setShowNewsletterModal(false), 2000)
      } else {
        setSubmitMessage('Something went wrong. Please try again.')
      }
    } catch (error) {
      console.error('Newsletter submission error:', error)
      setSubmitMessage('Something went wrong. Please try again.')
    }

    setIsSubmitting(false)
  }

  const handleCtaClick = (tier: PricingTier) => {
    if (tier.name === 'Free') {
      window.location.href = '/login'
    } else if (tier.name === 'Pro') {
      window.location.href = '/billing/subscribe?plan=pro'
    } else if (tier.name === 'Enterprise') {
      setContactForm(prev => ({ ...prev, tierInterest: 'enterprise' }))
      setShowContactModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Simple, transparent{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                pricing
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Choose the perfect plan for your MFA sharing needs. Start free and upgrade as you grow.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>30-day money back</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid md:grid-cols-3 gap-8 -mt-12">
          {tiers.map((tier) => {
            const Icon = tier.icon
            return (
              <Card
                key={tier.name}
                className={`relative p-8 ${
                  tier.popular
                    ? 'ring-2 ring-blue-500 shadow-2xl scale-105 bg-white'
                    : 'shadow-lg bg-white'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <p className="text-gray-600 mb-4">{tier.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                    {tier.price !== 'Custom' && (
                      <span className="text-gray-600 ml-2">/{tier.duration}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={tier.ctaVariant}
                  className="w-full"
                  onClick={() => handleCtaClick(tier)}
                >
                  {tier.cta}
                </Button>
              </Card>
            )
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately with prorated billing.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens to my data if I cancel?
              </h3>
              <p className="text-gray-600">
                Your data remains accessible during your current billing period. After cancellation, you can export your data anytime.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer discounts for teams?
              </h3>
              <p className="text-gray-600">
                Yes! Enterprise plans include volume discounts for teams of 10+ users. Contact sales for custom pricing.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is my data secure?
              </h3>
              <p className="text-gray-600">
                Absolutely. We use enterprise-grade encryption and follow industry best practices to keep your MFA codes secure.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay updated with product news
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Get the latest features, security updates, and product announcements.
          </p>
          <Button
            variant="secondary"
            onClick={() => setShowNewsletterModal(true)}
            className="bg-white text-blue-600 hover:bg-gray-50"
          >
            Subscribe to Newsletter
          </Button>
        </div>
      </div>

      {/* Contact Sales Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Contact Sales"
      >
        <form onSubmit={handleContactSubmit} className="space-y-4">
          <FormInput
            id="contact-name"
            label="Name"
            value={contactForm.name}
            onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          <FormInput
            id="contact-email"
            label="Email"
            type="email"
            value={contactForm.email}
            onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
            required
          />
          <FormInput
            id="contact-company"
            label="Company"
            value={contactForm.company}
            onChange={(e) => setContactForm(prev => ({ ...prev, company: e.target.value }))}
            required
          />
          <FormTextarea
            id="contact-message"
            label="Tell us about your needs"
            value={contactForm.message}
            onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
            rows={4}
          />
          
          {submitMessage && (
            <Alert variant={submitMessage.includes('Thank you') ? 'success' : 'error'}>
              {submitMessage}
            </Alert>
          )}

          <ModalActions>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowContactModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </ModalActions>
        </form>
      </Modal>

      {/* Newsletter Modal */}
      <Modal
        isOpen={showNewsletterModal}
        onClose={() => setShowNewsletterModal(false)}
        title="Subscribe to Newsletter"
      >
        <form onSubmit={handleNewsletterSubmit} className="space-y-4">
          <p className="text-gray-600">
            Get the latest product updates, security tips, and feature announcements delivered to your inbox.
          </p>
          <FormInput
            id="newsletter-email"
            label="Email Address"
            type="email"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
          
          {submitMessage && (
            <Alert variant={submitMessage.includes('Thank you') ? 'success' : 'error'}>
              {submitMessage}
            </Alert>
          )}

          <ModalActions>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowNewsletterModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </ModalActions>
        </form>
      </Modal>
    </div>
  )
}
