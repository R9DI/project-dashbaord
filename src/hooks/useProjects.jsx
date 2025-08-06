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
    onMutate: async (newProject) => {
      // 이전 데이터 백업
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      const previousProjects = queryClient.getQueryData(["projects"]);

      // 낙관적 업데이트
      queryClient.setQueryData(["projects"], (old) => {
        if (!old) return [newProject];
        return [...old, newProject];
      });

      return { previousProjects };
    },
    onError: (err, variables, context) => {
      // 에러 시 이전 데이터로 롤백
      if (context?.previousProjects) {
        queryClient.setQueryData(["projects"], context.previousProjects);
      }
    },
    onSuccess: (newProject) => {
      // 성공 시 캐시를 업데이트된 데이터로 직접 설정
      queryClient.setQueryData(["projects"], (old) => {
        if (!old) return [newProject];
        return old.map((project) =>
          project.id === newProject.id ? newProject : project
        );
      });
    },
  });
};
