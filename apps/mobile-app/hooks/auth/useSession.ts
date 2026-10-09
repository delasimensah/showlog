import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";

export function useSession() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();

  return { isAuthenticated, isLoading, signIn, signOut };
}
