import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getProjectsInWorkspaceQueryFn } from "@/lib/api";
import { AllProjectPayloadType } from "@/types/api.type";

const useGetProjectsInWorkspaceQuery = ({
  workspaceId,
  pageSize,
  pageNumber,
  skip = false,
}: AllProjectPayloadType) => {
  // Validate workspaceId - must be a valid string and not "undefined"
  const isValidWorkspaceId = workspaceId && workspaceId !== "undefined" && typeof workspaceId === "string";
  
  const query = useQuery({
    queryKey: ["allprojects", workspaceId, pageNumber, pageSize],
    queryFn: () =>
      getProjectsInWorkspaceQueryFn({
        workspaceId: workspaceId!,
        pageSize,
        pageNumber,
      }),
    staleTime: Infinity,
    placeholderData: skip ? undefined : keepPreviousData,
    enabled: !skip && isValidWorkspaceId,
  });
  return query;
};

export default useGetProjectsInWorkspaceQuery;
