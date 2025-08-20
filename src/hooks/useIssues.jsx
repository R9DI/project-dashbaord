// React Query 기반 이슈 hooks 사용
export {
  useIssuesByProject,
  useCreateIssue,
  useUpdateIssue,
} from "./useReactQuery";

// 별칭 추가
export const useAddIssue = useCreateIssue;
