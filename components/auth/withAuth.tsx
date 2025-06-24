'use client';

import type { User } from '@supabase/supabase-js';
import { ComponentType } from 'react';

import { useAuth } from './AuthProvider';
import ProtectedRoute from './ProtectedRoute';

interface WithAuthProps {
  redirectTo?: string;
}

export function withAuth<P extends object>(Component: ComponentType<P>, options: WithAuthProps = {}) {
  const { redirectTo = '/login' } = options;

  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute redirectTo={redirectTo}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

export function withAuthUser<P extends object>(Component: ComponentType<P & { user: User }>) {
  return function AuthenticatedUserComponent(props: P) {
    return (
      <ProtectedRoute>
        <UserProviderWrapper Component={Component} {...props} />
      </ProtectedRoute>
    );
  };
}

function UserProviderWrapper<P extends object>({
  Component,
  ...props
}: P & {
  Component: ComponentType<P & { user: User }>;
}) {
  const { user } = useAuth();

  // This should never happen inside ProtectedRoute, but TypeScript doesn't know that
  if (!user) {
    return null;
  }

  return <Component {...(props as P)} user={user} />;
}
