import { getMembersInWorkspaceQueryFn } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { isValidWorkspaceId } from "@/lib/workspace-utils";

const useGetWorkspaceMembers = (workspaceId: string | undefined) => {
  const isValid = isValidWorkspaceId(workspaceId);
  
  const query = useQuery({
    queryKey: ["members", workspaceId],
    queryFn: () => getMembersInWorkspaceQueryFn(workspaceId!),
    staleTime: Infinity,
    enabled: isValid,
  });
  return query;
};

export default useGetWorkspaceMembers;
