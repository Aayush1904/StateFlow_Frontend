/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { getWorkspaceByIdQueryFn } from "@/lib/api";
import { CustomError } from "@/types/custom-error.type";

const useGetWorkspaceQuery = (workspaceId: string | undefined) => {
  // Validate workspaceId - must be a valid string and not "undefined"
  const isValidWorkspaceId = workspaceId && workspaceId !== "undefined" && typeof workspaceId === "string";
  
  const query = useQuery<any, CustomError>({
    queryKey: ["workspace", workspaceId],
    queryFn: () => getWorkspaceByIdQueryFn(workspaceId!),
    staleTime: 0,
    retry: 2,
    enabled: isValidWorkspaceId,
  });

  return query;
};

export default useGetWorkspaceQuery;
