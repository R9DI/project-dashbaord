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
    onSuccess: () => {
      // 이슈 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
  });
};

// 이슈 삭제
export const useDeleteIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => issueApi.deleteIssue(id),
    onSuccess: () => {
      // 이슈 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
  });
};
