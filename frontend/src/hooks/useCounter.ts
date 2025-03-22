import { api } from "@/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Types
interface CounterResponse {
  count: number;
}

/**
 * Hook for querying the current counter value
 */
export const useCounterQuery = () => {
  return useQuery({
    queryKey: ["counter"],
    queryFn: async () => {
      const { data } = await api.counter.count.get();

      if (!data) {
        throw new Error("Failed to fetch counter");
      }

      return data as CounterResponse;
    },
  });
};

/**
 * Hook for triggering counter increment mutation
 */
export const useCounterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.counter.increment.post();

      if (!data) {
        throw new Error("Failed to increment counter");
      }

      return data as CounterResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counter"] });
    },
  });
};

/**
 * Consolidated hook for counter state management
 * Combines both query and mutation functionality in one hook
 */
export const useCounterState = () => {
  const { data, isLoading, isError, error } = useCounterQuery();

  const {
    mutate: increment,
    isPending,
    isError: isMutationError,
    error: mutationError,
  } = useCounterMutation();

  return {
    // Counter data
    count: data?.count || 0,

    // Loading states
    isLoading,
    isPending,

    // Actions
    increment,

    // Error states
    isError,
    isMutationError,
    error,
    mutationError,
  };
};
