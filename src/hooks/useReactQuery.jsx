import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = "http://localhost:5000/api";

// 프로젝트 관련 hooks
export const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/projects`);
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      return await response.json();
    },
    staleTime: 5 * 60 * 1000, // 5분
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update project");
      }
      return await response.json();
    },
    onSuccess: (updatedProject) => {
      // 프로젝트 목록 캐시 업데이트
      queryClient.setQueryData(["projects"], (oldData) => {
        if (!oldData) return [updatedProject];
        return oldData.map((project) =>
          project.id === updatedProject.id ? updatedProject : project
        );
      });
      // 통계 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete project");
      }
      return await response.json();
    },
    onSuccess: (_, deletedId) => {
      // 프로젝트 목록 캐시에서 삭제된 프로젝트 제거
      queryClient.setQueryData(["projects"], (oldData) => {
        if (!oldData) return [];
        return oldData.filter((project) => project.id !== deletedId);
      });
      // 통계 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
};

// 이슈 관련 hooks
export const useIssuesByProject = (projectId) => {
  return useQuery({
    queryKey: ["issues", "project", projectId],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/issues`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch project issues");
      }
      return await response.json();
    },
    enabled: !!projectId, // projectId가 있을 때만 실행
    staleTime: 2 * 60 * 1000, // 2분
  });
};

export const useCreateIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`${API_BASE_URL}/issues`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create issue");
      }
      return await response.json();
    },
    onSuccess: (newIssue) => {
      // 프로젝트별 이슈 캐시에 추가
      queryClient.setQueryData(
        ["issues", "project", newIssue.projectId],
        (oldData) => {
          if (!oldData) return [newIssue];
          return [...oldData, newIssue];
        }
      );
    },
  });
};

export const useUpdateIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update issue");
      }
      return await response.json();
    },
    onSuccess: (updatedIssue) => {
      // 프로젝트별 이슈 캐시 업데이트
      queryClient.setQueryData(
        ["issues", "project", updatedIssue.projectId],
        (oldData) => {
          if (!oldData) return [updatedIssue];
          return oldData.map((issue) =>
            issue.id === updatedIssue.id ? updatedIssue : issue
          );
        }
      );
    },
  });
};

// 색상 설정 관련 hooks
export const useColorSettings = () => {
  return useQuery({
    queryKey: ["colorSettings"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/color-settings`);
      if (!response.ok) {
        throw new Error("Failed to fetch color settings");
      }
      return await response.json();
    },
    staleTime: 10 * 60 * 1000, // 10분
  });
};

export const useUpdateColorSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings) => {
      const response = await fetch(`${API_BASE_URL}/color-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });
      if (!response.ok) {
        throw new Error("Failed to update color settings");
      }
      return await response.json();
    },
    onSuccess: (updatedSettings) => {
      // 색상 설정 캐시 업데이트
      queryClient.setQueryData(["colorSettings"], updatedSettings);
    },
  });
};

// 통계 관련 hooks
export const useStatistics = () => {
  return useQuery({
    queryKey: ["statistics"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/statistics`);
      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }
      return await response.json();
    },
    staleTime: 5 * 60 * 1000, // 5분
  });
};
