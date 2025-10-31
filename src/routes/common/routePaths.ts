export const isAuthRoute = (pathname: string): boolean => {
  return Object.values(AUTH_ROUTES).includes(pathname);
};

export const AUTH_ROUTES = {
  SIGN_IN: "/",
  SIGN_UP: "/sign-up",
  GOOGLE_OAUTH_CALLBACK: "/google/oauth/callback",
};

export const PROTECTED_ROUTES = {
  WORKSPACE: "/workspace/:workspaceId",
  TASKS: "/workspace/:workspaceId/tasks",
  PAGES: "/workspace/:workspaceId/pages",
  PAGES_NEW: "/workspace/:workspaceId/pages/new",
  PAGES_EDIT: "/workspace/:workspaceId/pages/:pageId",
  MEMBERS: "/workspace/:workspaceId/members",
  SETTINGS: "/workspace/:workspaceId/settings",
  INTEGRATIONS: "/workspace/:workspaceId/integrations",
  PRICING: "/workspace/:workspaceId/pricing",
  PROJECT_DETAILS: "/workspace/:workspaceId/project/:projectId",
  TEST_EDITOR: "/workspace/:workspaceId/test-editor",
  NOTIFICATIONS: "/workspace/:workspaceId/notifications",
};

export const BASE_ROUTE = {
  INVITE_URL: "/invite/workspace/:inviteCode/join",
};
