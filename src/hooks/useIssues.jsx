import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { issueApi } from "../services/api";

// 이슈 목록 조회 (전체)
export const useIssues = () => {
  return useQuery({
    queryKey: ["issues"],
    queryFn: issueApi.getIssues,
  });
};

// 프로젝트별 이슈 목록 조회
export const useIssuesByProject = (projectId) => {
  console.log("useIssuesByProject 호출됨 - projectId:", projectId);
  console.log("useIssuesByProject - projectId 타입:", typeof projectId);

  // projectId가 유효하지 않으면 쿼리를 비활성화
  const isEnabled =
    projectId !== null && projectId !== undefined && projectId !== "";

  console.log("useIssuesByProject - enabled 조건:", isEnabled);

  if (!isEnabled) {
    console.warn(
      "useIssuesByProject - projectId가 유효하지 않아 쿼리를 비활성화합니다:",
      projectId
    );
    console.warn("useIssuesByProject - projectId 타입:", typeof projectId);
    console.warn("useIssuesByProject - projectId 값:", projectId);
  }

  return useQuery({
    queryKey: ["issues", "project", projectId],
    queryFn: () => {
      console.log("useIssuesByProject queryFn 실행 - projectId:", projectId);
      console.log("useIssuesByProject queryFn - projectId 타입:", typeof projectId);
      if (!isEnabled) {
        throw new Error("프로젝트 ID가 유효하지 않습니다.");
      }
      return issueApi.getIssuesByProject(projectId);
    },
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000, // 5분간 데이터를 신선하게 유지
    retry: false, // 에러 시 재시도하지 않음
  });
};

// 이슈 추가
export const useAddIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => issueApi.createIssue(data),
    onMutate: async (newIssue) => {
      // 이전 데이터 백업
      await queryClient.cancelQueries({ queryKey: ["issues"] });
      const previousIssues = queryClient.getQueryData(["issues"]);

      // 낙관적 업데이트 - 새 이슈를 즉시 캐시에 추가
      queryClient.setQueryData(["issues"], (old) => {
        if (!old) return [newIssue];
        return [newIssue, ...old];
      });

      // 프로젝트별 캐시도 업데이트
      if (newIssue.projectId) {
        const projectKey = ["issues", "project", newIssue.projectId];
        const previousProjectIssues = queryClient.getQueryData(projectKey);

        queryClient.setQueryData(projectKey, (old) => {
          if (!old) return [newIssue];
          return [newIssue, ...old];
        });

        return { previousIssues, previousProjectIssues, projectKey };
      }

      return { previousIssues };
    },
    onError: (err, variables, context) => {
      // 에러 시 이전 데이터로 롤백
      if (context?.previousIssues) {
        queryClient.setQueryData(["issues"], context.previousIssues);
      }
      if (context?.previousProjectIssues && context?.projectKey) {
        queryClient.setQueryData(
          context.projectKey,
          context.previousProjectIssues
        );
      }
    },
    onSuccess: (newIssue) => {
      // 성공 시 관련된 모든 캐시를 새로고침
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      if (newIssue.projectId) {
        queryClient.invalidateQueries({
          queryKey: ["issues", "project", newIssue.projectId],
        });
      }
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

      // 프로젝트별 캐시도 업데이트
      const projectKeys = [];
      if (data.projectId) {
        projectKeys.push(["issues", "project", data.projectId]);
      }

      // 기존 프로젝트 ID도 확인하여 업데이트
      const existingIssue = previousIssues?.find((issue) => issue.id === id);
      if (existingIssue?.projectId) {
        projectKeys.push(["issues", "project", existingIssue.projectId]);
      }

      const previousProjectIssues = {};
      projectKeys.forEach((key) => {
        previousProjectIssues[key] = queryClient.getQueryData(key);
        queryClient.setQueryData(key, (old) => {
          if (!old) return old;
          return old.map((issue) =>
            issue.id === id ? { ...issue, ...data } : issue
          );
        });
      });

      return { previousIssues, previousProjectIssues, projectKeys };
    },
    onError: (err, variables, context) => {
      // 에러 시 이전 데이터로 롤백
      if (context?.previousIssues) {
        queryClient.setQueryData(["issues"], context.previousIssues);
      }
      if (context?.previousProjectIssues) {
        Object.entries(context.previousProjectIssues).forEach(([key, data]) => {
          queryClient.setQueryData(JSON.parse(key), data);
        });
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

      // 프로젝트별 캐시도 업데이트
      if (data.projectId) {
        queryClient.setQueryData(
          ["issues", "project", data.projectId],
          (old) => {
            if (!old) return old;
            return old.map((issue) =>
              issue.id === id ? { ...issue, ...data } : issue
            );
          }
        );
      }
    },
  });
};
