"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Custom hook for protecting routes that require authentication
 * Redirects to get-started page if user is not authenticated
 */
export const useRequireAuth = (redirectTo: string = "/get-started") => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return {
    isAuthenticated,
    isLoading,
    user,
    // Return true if we should show the protected content
    shouldRender: isAuthenticated && !isLoading,
  };
};

/**
 * Custom hook for redirecting authenticated users away from auth pages
 * Redirects to dashboard if user is already authenticated
 */
export const useRedirectIfAuthenticated = (redirectTo: string = "/dashboard") => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return {
    isAuthenticated,
    isLoading,
    user,
    // Return true if we should show the auth content (login/signup forms)
    shouldRender: !isAuthenticated && !isLoading,
  };
};
