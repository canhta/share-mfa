"use client";

import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import AdminLayout from "@/components/admin/AdminLayout";

interface ProtectedAdminLayoutProps {
  children: ReactNode;
}

interface LoadingState {
  isLoading: boolean;
  user: User | null;
  isAdmin: boolean;
  error: string | null;
}

export default function ProtectedAdminLayout({
  children,
}: ProtectedAdminLayoutProps) {
  const router = useRouter();
  const [state, setState] = useState<LoadingState>({
    isLoading: true,
    user: null,
    isAdmin: false,
    error: null,
  });

  useEffect(() => {
    const checkAuthAndRole = async () => {
      try {
        const response = await fetch("/api/auth/admin");

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (response.status === 403) {
          router.push("/dashboard");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: errorData.error || "Failed to verify admin permissions",
          }));
          return;
        }

        const data = await response.json();

        // User is authenticated and is admin
        setState({
          isLoading: false,
          user: data.user,
          isAdmin: data.isAdmin,
          error: null,
        });
      } catch (error) {
        console.error("Error in auth check:", error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Authentication error occurred",
        }));
      }
    };

    checkAuthAndRole();
  }, [router]);

  // Loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
            <h3 className="font-bold">Access Error</h3>
            <p>{state.error}</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-3 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not admin (should not reach here due to redirect, but safety check)
  if (!state.isAdmin || !state.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded max-w-md">
            <h3 className="font-bold">Access Denied</h3>
            <p>You don&apos;t have permission to access the admin panel.</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and admin - render admin layout
  return <AdminLayout user={state.user}>{children}</AdminLayout>;
}
