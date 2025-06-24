'use client';

import { Lock, Share2, Shield, Zap } from 'lucide-react';

import Button from '@/components/ui/Button';

interface WelcomeStepProps {
  onNext: () => void;
}

const features = [
  {
    icon: Shield,
    title: 'Secure MFA Storage',
    description: 'Store your MFA codes securely with enterprise-grade encryption',
  },
  {
    icon: Share2,
    title: 'Easy Sharing',
    description: 'Share your MFA codes with trusted people when needed',
  },
  {
    icon: Lock,
    title: 'Privacy First',
    description: 'Your data is encrypted and only accessible to you',
  },
  {
    icon: Zap,
    title: 'Quick Access',
    description: 'Get your codes instantly when you need them most',
  },
];

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="text-center">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to ShareMFA</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          The secure way to store and share your multi-factor authentication codes. Never lose access to your accounts
          again.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="text-left p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mb-3">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          );
        })}
      </div>

      {/* Benefits */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-blue-900 mb-3">What you get with your free account:</h3>
        <ul className="text-left text-blue-800 space-y-2">
          <li className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            Up to 5 MFA entries
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            10 code shares per month
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            Secure encrypted storage
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            Community support
          </li>
        </ul>
      </div>

      {/* CTA */}
      <div className="flex justify-center">
        <Button onClick={onNext} className="px-8">
          Get Started
        </Button>
      </div>
    </div>
  );
}
