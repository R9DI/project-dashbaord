import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// 프로젝트 관련 hooks
export const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/projects`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5분
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await axios.put(`${API_BASE_URL}/projects/${id}`, data);
      return response.data;
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
      const response = await axios.delete(`${API_BASE_URL}/projects/${id}`);
      return response.data;
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
    queryKey: ["issues", projectId],
    queryFn: async () => {
      const response = await axios.get(
        `${API_BASE_URL}/projects/${projectId}/issues`
      );
      return response.data;
    },
    enabled: !!projectId, // projectId가 있을 때만 실행
    staleTime: 2 * 60 * 1000, // 2분
  });
};

export const useCreateIssue = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      // projectId를 data에 추가
      const issueData = { ...data, projectId };
      const response = await axios.post(`${API_BASE_URL}/issues`, issueData);
      return response.data;
    },
    onSuccess: (newIssue) => {
      // 프로젝트별 이슈 캐시에 추가
      queryClient.setQueryData(["issues", projectId], (oldData) => {
        if (!oldData) return [newIssue];
        return [...oldData, newIssue];
      });
    },
  });
};

export const useUpdateIssue = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      // projectId를 data에 추가
      const issueData = { ...data, projectId };
      const response = await axios.put(
        `${API_BASE_URL}/issues/${id}`,
        issueData
      );
      return response.data;
    },
    onSuccess: (updatedIssue) => {
      // 프로젝트별 이슈 캐시 업데이트
      queryClient.setQueryData(["issues", projectId], (oldData) => {
        if (!oldData) return [updatedIssue];
        return oldData.map((issue) =>
          issue.id === updatedIssue.id ? updatedIssue : issue
        );
      });
    },
  });
};

// 색상 설정 관련 hooks
export const useColorSettings = () => {
  return useQuery({
    queryKey: ["colorSettings"],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/color-settings`);
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10분
  });
};

export const useUpdateColorSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings) => {
      const response = await axios.put(
        `${API_BASE_URL}/color-settings`,
        settings
      );
      return response.data;
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
      const response = await axios.get(`${API_BASE_URL}/statistics`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5분
  });
};
