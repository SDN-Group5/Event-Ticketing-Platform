import { useMutation, useQuery, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import { useEffect } from "react";
import useAppContext from "./useAppContext";

// Custom hook for queries with global loading
// React Query v5: Chỉ hỗ trợ object format, không có onSuccess/onError/onSettled
export const useQueryWithLoading = <TData, TError = Error>(
  queryKey: any,
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> & { loadingMessage?: string }
) => {
  const { hideGlobalLoading } = useAppContext();
  
  const queryResult = useQuery({
    queryKey,
    queryFn,
    ...options,
  });

  // React Query v5: Dùng useEffect để handle success/error
  useEffect(() => {
    if (queryResult.isSuccess || queryResult.isError) {
      hideGlobalLoading();
    }
  }, [queryResult.isSuccess, queryResult.isError, hideGlobalLoading]);

  return queryResult;
};

// Custom hook for mutations with global loading
// React Query v5: useMutation với object format
export const useMutationWithLoading = <TData, TError, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, TError, TVariables> & { loadingMessage?: string }
) => {
  const { showGlobalLoading, hideGlobalLoading } = useAppContext();
  
  const mutation = useMutation({
    mutationFn,
    ...options,
  });

  // Handle loading state với useEffect
  useEffect(() => {
    if (mutation.isPending) {
      if (options?.loadingMessage) {
        showGlobalLoading(options.loadingMessage);
      } else {
        showGlobalLoading();
      }
    } else {
      hideGlobalLoading();
    }
  }, [mutation.isPending, options?.loadingMessage, showGlobalLoading, hideGlobalLoading]);

  return mutation;
};
