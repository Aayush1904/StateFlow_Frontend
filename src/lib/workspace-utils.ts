/**
 * Validates if a workspaceId is valid (not undefined, null, or the string "undefined")
 * @param workspaceId - The workspace ID to validate
 * @returns true if workspaceId is a valid string, false otherwise
 */
export const isValidWorkspaceId = (workspaceId: string | undefined): workspaceId is string => {
  return Boolean(workspaceId && workspaceId !== "undefined" && typeof workspaceId === "string");
};

/**
 * Gets a valid workspace ID or throws an error message
 * @param workspaceId - The workspace ID to validate
 * @param errorMessage - Custom error message if invalid
 * @returns The validated workspace ID
 * @throws Error if workspaceId is invalid
 */
export const requireWorkspaceId = (
  workspaceId: string | undefined,
  errorMessage = "Workspace ID is required"
): string => {
  if (!isValidWorkspaceId(workspaceId)) {
    throw new Error(errorMessage);
  }
  return workspaceId;
};

