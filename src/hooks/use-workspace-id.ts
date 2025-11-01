import { useParams } from "react-router-dom";

const useWorkspaceId = () => {
  const params = useParams();
  const workspaceId = params.workspaceId;
  // Return undefined if workspaceId is undefined, null, or the string "undefined"
  if (!workspaceId || workspaceId === "undefined") {
    return undefined;
  }
  return workspaceId;
};

export default useWorkspaceId;
