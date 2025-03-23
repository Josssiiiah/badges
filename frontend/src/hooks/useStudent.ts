import { api } from "@/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCounterQuery = () => {
  return useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data } = await api.students.get();

      if (!data) {
        throw new Error("Failed to fetch counter");
      }

      return data;
    },
  });
};
