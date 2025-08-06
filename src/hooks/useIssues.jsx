import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { issueApi } from "../services/api";

// 이슈 목록 조회
export const useIssues = () => {
  return useQuery({
    queryKey: ["issues"],
    queryFn: issueApi.getIssues,
  });
};

// 이슈 추가
export const useAddIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => issueApi.createIssue(data),
    onSuccess: () => {
      // 이슈 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
  });
};

// 이슈 업데이트
export const useUpdateIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => issueApi.updateIssue(id, data),
    onMutate: async ({ id, data }) => {
      // 이전 데이터 백업
      await queryClient.cancelQueries({ queryKey: ["issues"] });
      const previousIssues = queryClient.getQueryData(["issues"]);

      // 낙관적 업데이트
      queryClient.setQueryData(["issues"], (old) => {
        if (!old) return old;
        return old.map((issue) =>
          issue.id === id ? { ...issue, ...data } : issue
        );
      });

      return { previousIssues };
    },
    onError: (err, variables, context) => {
      // 에러 시 이전 데이터로 롤백
      if (context?.previousIssues) {
        queryClient.setQueryData(["issues"], context.previousIssues);
      }
    },
    onSuccess: (updatedData, { id, data }) => {
      // 성공 시 캐시를 업데이트된 데이터로 직접 설정
      queryClient.setQueryData(["issues"], (old) => {
        if (!old) return old;
        return old.map((issue) =>
          issue.id === id ? { ...issue, ...data } : issue
        );
      });
    },
  });
};
