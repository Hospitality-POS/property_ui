import { useQuery } from "@tanstack/react-query";

interface UseQueryProperties {
  queryKey: [string, any | null];
  queryFn: any;
}

export default function useQueryUtil({ queryKey, queryFn }: UseQueryProperties) {
  return useQuery({
    queryKey: queryKey,
    queryFn: queryFn,
    refetchOnWindowFocus: false,
    retry: 3,
  });
}

