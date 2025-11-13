import { trpc } from "@/lib/trpc";

export function useAdminAuth() {
  const { data: admin, isLoading, error } = trpc.adminAuth.me.useQuery();
  const logoutMutation = trpc.adminAuth.logout.useMutation();

  const logout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/admin/login";
  };

  return {
    admin,
    isAuthenticated: !!admin,
    loading: isLoading,
    error,
    logout,
  };
}
