import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectApi } from "../services/api";

// 프로젝트 목록 조회
export const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: projectApi.getProjects,
  });
};

// 프로젝트 추가
export const useAddProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => projectApi.addProject(data),
    onSuccess: () => {
      // 프로젝트 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

// 프로젝트 삭제
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => projectApi.deleteProject(id),
    onSuccess: () => {
      // 프로젝트 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};
