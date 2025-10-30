import API from "./axios-client";
import {
  AllMembersInWorkspaceResponseType,
  AllProjectPayloadType,
  AllProjectResponseType,
  AllTaskPayloadType,
  AllTaskResponseType,
  AnalyticsResponseType,
  ChangeWorkspaceMemberRoleType,
  CreateProjectPayloadType,
  CreateTaskPayloadType,
  EditTaskPayloadType,
  CreateWorkspaceResponseType,
  EditProjectPayloadType,
  ProjectByIdPayloadType,
  ProjectResponseType,
} from "../types/api.type";
import {
  AllWorkspaceResponseType,
  CreateWorkspaceType,
  CurrentUserResponseType,
  LoginResponseType,
  loginType,
  registerType,
  WorkspaceByIdResponseType,
  EditWorkspaceType,
} from "@/types/api.type";

export const loginMutationFn = async (
  data: loginType
): Promise<LoginResponseType> => {
  const response = await API.post("/auth/login", data);
  return response.data;
};

export const registerMutationFn = async (data: registerType) =>
  await API.post("/auth/register", data);

export const logoutMutationFn = async () => await API.post("/auth/logout");

export const getCurrentUserQueryFn =
  async (): Promise<CurrentUserResponseType> => {
    const response = await API.get(`/user/current`);
    return response.data;
  };

//********* WORKSPACE ****************
//************* */

export const createWorkspaceMutationFn = async (
  data: CreateWorkspaceType
): Promise<CreateWorkspaceResponseType> => {
  const response = await API.post(`/workspace/create/new`, data);
  return response.data;
};

export const editWorkspaceMutationFn = async ({
  workspaceId,
  data,
}: EditWorkspaceType) => {
  const response = await API.put(`/workspace/update/${workspaceId}`, data);
  return response.data;
};

export const getAllWorkspacesUserIsMemberQueryFn =
  async (): Promise<AllWorkspaceResponseType> => {
    const response = await API.get(`/workspace/all`);
    return response.data;
  };

export const getWorkspaceByIdQueryFn = async (
  workspaceId: string
): Promise<WorkspaceByIdResponseType> => {
  const response = await API.get(`/workspace/${workspaceId}`);
  return response.data;
};

export const getMembersInWorkspaceQueryFn = async (
  workspaceId: string
): Promise<AllMembersInWorkspaceResponseType> => {
  const response = await API.get(`/workspace/members/${workspaceId}`);
  return response.data;
};

export const getWorkspaceAnalyticsQueryFn = async (
  workspaceId: string
): Promise<AnalyticsResponseType> => {
  const response = await API.get(`/workspace/analytics/${workspaceId}`);
  return response.data;
};

export const changeWorkspaceMemberRoleMutationFn = async ({
  workspaceId,
  data,
}: ChangeWorkspaceMemberRoleType) => {
  const response = await API.put(
    `/workspace/change/member/role/${workspaceId}`,
    data
  );
  return response.data;
};

export const deleteWorkspaceMutationFn = async (
  workspaceId: string
): Promise<{
  message: string;
  currentWorkspace: string;
}> => {
  const response = await API.delete(`/workspace/delete/${workspaceId}`);
  return response.data;
};

//*******MEMBER ****************

export const invitedUserJoinWorkspaceMutationFn = async (
  iniviteCode: string
): Promise<{
  message: string;
  workspaceId: string;
}> => {
  console.log('API - inviteCode received:', iniviteCode);
  console.log('API - URL being called:', `/member/workspace/${iniviteCode}/join`);
  
  // Validate invite code
  if (!iniviteCode || iniviteCode.includes('http') || iniviteCode.length < 6) {
    throw new Error('Invalid invite code provided');
  }
  
  const response = await API.post(`/member/workspace/${iniviteCode}/join`);
  return response.data;
};

//********* NOTIFICATIONS
export const getUserNotificationsQueryFn = async (params: {
  limit?: number;
  offset?: number;
}): Promise<{
  message: string;
  notifications: any[];
  totalCount: number;
  unreadCount: number;
}> => {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());
  
  const response = await API.get(`/notification?${queryParams.toString()}`);
  return response.data;
};

export const markNotificationAsReadMutationFn = async (notificationId: string): Promise<{
  message: string;
  notification: any;
}> => {
  const response = await API.patch(`/notification/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsAsReadMutationFn = async (): Promise<{
  message: string;
  updatedCount: number;
}> => {
  const response = await API.patch('/notification/read-all');
  return response.data;
};

export const deleteNotificationMutationFn = async (notificationId: string): Promise<{
  message: string;
  notification: any;
}> => {
  const response = await API.delete(`/notification/${notificationId}`);
  return response.data;
};

//********* */
//********* PROJECTS
export const createProjectMutationFn = async ({
  workspaceId,
  data,
}: CreateProjectPayloadType): Promise<ProjectResponseType> => {
  const response = await API.post(
    `/project/workspace/${workspaceId}/create`,
    data
  );
  return response.data;
};

export const editProjectMutationFn = async ({
  projectId,
  workspaceId,
  data,
}: EditProjectPayloadType): Promise<ProjectResponseType> => {
  const response = await API.put(
    `/project/${projectId}/workspace/${workspaceId}/update`,
    data
  );
  return response.data;
};

export const getProjectsInWorkspaceQueryFn = async ({
  workspaceId,
  pageSize = 10,
  pageNumber = 1,
}: AllProjectPayloadType): Promise<AllProjectResponseType> => {
  const response = await API.get(
    `/project/workspace/${workspaceId}/all?pageSize=${pageSize}&pageNumber=${pageNumber}`
  );
  return response.data;
};

export const getProjectByIdQueryFn = async ({
  workspaceId,
  projectId,
}: ProjectByIdPayloadType): Promise<ProjectResponseType> => {
  const response = await API.get(
    `/project/${projectId}/workspace/${workspaceId}`
  );
  return response.data;
};

export const getProjectAnalyticsQueryFn = async ({
  workspaceId,
  projectId,
}: ProjectByIdPayloadType): Promise<AnalyticsResponseType> => {
  const response = await API.get(
    `/project/${projectId}/workspace/${workspaceId}/analytics`
  );
  return response.data;
};

export const deleteProjectMutationFn = async ({
  workspaceId,
  projectId,
}: ProjectByIdPayloadType): Promise<{
  message: string;
}> => {
  const response = await API.delete(
    `/project/${projectId}/workspace/${workspaceId}/delete`
  );
  return response.data;
};

//*******TASKS ********************************
//************************* */

export const createTaskMutationFn = async ({
  workspaceId,
  projectId,
  data,
}: CreateTaskPayloadType) => {
  const response = await API.post(
    `/task/project/${projectId}/workspace/${workspaceId}/create`,
    data
  );
  return response.data;
};


export const editTaskMutationFn = async ({
  taskId,
  projectId,
  workspaceId,
  data,
}: EditTaskPayloadType): Promise<{message: string;}> => {
  const response = await API.put(
    `/task/${taskId}/project/${projectId}/workspace/${workspaceId}/update/`,
    data
  );
  return response.data;
};

export const getAllTasksQueryFn = async ({
  workspaceId,
  keyword,
  projectId,
  assignedTo,
  priority,
  status,
  dueDate,
  pageNumber,
  pageSize,
}: AllTaskPayloadType): Promise<AllTaskResponseType> => {
  const baseUrl = `/task/workspace/${workspaceId}/all`;

  const queryParams = new URLSearchParams();
  if (keyword) queryParams.append("keyword", keyword);
  if (projectId) queryParams.append("projectId", projectId);
  if (assignedTo) queryParams.append("assignedTo", assignedTo);
  if (priority) queryParams.append("priority", priority);
  if (status) queryParams.append("status", status);
  if (dueDate) queryParams.append("dueDate", dueDate);
  if (pageNumber) queryParams.append("pageNumber", pageNumber?.toString());
  if (pageSize) queryParams.append("pageSize", pageSize?.toString());

  const url = queryParams.toString() ? `${baseUrl}?${queryParams}` : baseUrl;
  const response = await API.get(url);
  return response.data;
};

export const deleteTaskMutationFn = async ({
  workspaceId,
  taskId,
}: {
  workspaceId: string;
  taskId: string;
}): Promise<{
  message: string;
}> => {
  const response = await API.delete(
    `task/${taskId}/workspace/${workspaceId}/delete`
  );
  return response.data;
};

// ==================== PAGE API FUNCTIONS ====================

export const createPageMutationFn = async ({
  workspaceId,
  data,
}: {
  workspaceId: string;
  data: {
    title: string;
    content?: string;
    projectId?: string;
    parentId?: string;
    isPublished?: boolean;
    templateId?: string;
  };
}): Promise<{ message: string; page: any }> => {
  const response = await API.post(`/page/workspace/${workspaceId}/pages`, data);
  return response.data;
};

export const getPageByIdQueryFn = async ({
  workspaceId,
  pageId,
}: {
  workspaceId: string;
  pageId: string;
}): Promise<{ message: string; page: any }> => {
  const response = await API.get(`/page/workspace/${workspaceId}/pages/${pageId}`);
  return response.data;
};

export const getPagesByWorkspaceQueryFn = async ({
  workspaceId,
  projectId,
  parentId,
}: {
  workspaceId: string;
  projectId?: string;
  parentId?: string;
}): Promise<{ message: string; pages: any[] }> => {
  const queryParams = new URLSearchParams();
  if (projectId) queryParams.append('projectId', projectId);
  if (parentId !== undefined) queryParams.append('parentId', parentId || '');

  const url = queryParams.toString() 
    ? `/page/workspace/${workspaceId}/pages?${queryParams}`
    : `/page/workspace/${workspaceId}/pages`;
  
  const response = await API.get(url);
  return response.data;
};

export const updatePageMutationFn = async ({
  workspaceId,
  pageId,
  data,
}: {
  workspaceId: string;
  pageId: string;
  data: {
    title?: string;
    content?: string;
    isPublished?: boolean;
  };
}): Promise<{ message: string; page: any }> => {
  const response = await API.put(`/page/workspace/${workspaceId}/pages/${pageId}`, data);
  return response.data;
};

export const deletePageMutationFn = async ({
  workspaceId,
  pageId,
}: {
  workspaceId: string;
  pageId: string;
}): Promise<{ message: string }> => {
  const response = await API.delete(`/page/workspace/${workspaceId}/pages/${pageId}`);
  return response.data;
};

// Page Version API Functions
export const createPageVersionMutationFn = async ({
  workspaceId,
  pageId,
  data,
}: {
  workspaceId: string;
  pageId: string;
  data: { changeDescription?: string };
}): Promise<{ message: string; version: any }> => {
  const response = await API.post(`/page/workspace/${workspaceId}/pages/${pageId}/versions`, data);
  return response.data;
};

export const getPageVersionsQueryFn = async ({
  workspaceId,
  pageId,
}: {
  workspaceId: string;
  pageId: string;
}): Promise<{ message: string; versions: any[] }> => {
  const response = await API.get(`/page/workspace/${workspaceId}/pages/${pageId}/versions`);
  return response.data;
};

export const getPageVersionByIdQueryFn = async ({
  workspaceId,
  pageId,
  versionId,
}: {
  workspaceId: string;
  pageId: string;
  versionId: string;
}): Promise<{ message: string; version: any }> => {
  const response = await API.get(`/page/workspace/${workspaceId}/pages/${pageId}/versions/${versionId}`);
  return response.data;
};

export const restorePageVersionMutationFn = async ({
  workspaceId,
  pageId,
  versionId,
}: {
  workspaceId: string;
  pageId: string;
  versionId: string;
}): Promise<{ message: string; page: any; restoredVersion: any }> => {
  const response = await API.post(`/page/workspace/${workspaceId}/pages/${pageId}/versions/${versionId}/restore`);
  return response.data;
};

export const comparePageVersionsQueryFn = async ({
  workspaceId,
  pageId,
  versionId1,
  versionId2,
}: {
  workspaceId: string;
  pageId: string;
  versionId1: string;
  versionId2: string;
}): Promise<{ message: string; version1: any; version2: any; titleChanged: boolean; contentChanged: boolean }> => {
  const response = await API.get(`/page/workspace/${workspaceId}/pages/${pageId}/versions/${versionId1}/compare/${versionId2}`);
  return response.data;
};

// ==================== PAGE TEMPLATE API FUNCTIONS ====================

export const createTemplateMutationFn = async ({
  workspaceId,
  data,
}: {
  workspaceId: string;
  data: {
    name: string;
    description?: string;
    content: string;
    category: string;
    isDefault?: boolean;
  };
}): Promise<{ message: string; template: any }> => {
  const response = await API.post(`/page/workspace/${workspaceId}/templates`, data);
  return response.data;
};

export const getTemplatesByWorkspaceQueryFn = async ({
  workspaceId,
  category,
}: {
  workspaceId: string;
  category?: string;
}): Promise<{ message: string; templates: any[] }> => {
  const queryParams = new URLSearchParams();
  if (category) queryParams.append('category', category);

  const url = queryParams.toString() 
    ? `/page/workspace/${workspaceId}/templates?${queryParams}`
    : `/page/workspace/${workspaceId}/templates`;
  
  const response = await API.get(url);
  return response.data;
};

export const getTemplateByIdQueryFn = async ({
  workspaceId,
  templateId,
}: {
  workspaceId: string;
  templateId: string;
}): Promise<{ message: string; template: any }> => {
  const response = await API.get(`/page/workspace/${workspaceId}/templates/${templateId}`);
  return response.data;
};

export const updateTemplateMutationFn = async ({
  workspaceId,
  templateId,
  data,
}: {
  workspaceId: string;
  templateId: string;
  data: {
    name?: string;
    description?: string;
    content?: string;
    category?: string;
  };
}): Promise<{ message: string; template: any }> => {
  const response = await API.put(`/page/workspace/${workspaceId}/templates/${templateId}`, data);
  return response.data;
};

export const deleteTemplateMutationFn = async ({
  workspaceId,
  templateId,
}: {
  workspaceId: string;
  templateId: string;
}): Promise<{ message: string }> => {
  const response = await API.delete(`/page/workspace/${workspaceId}/templates/${templateId}`);
  return response.data;
};

export const seedDefaultTemplatesMutationFn = async (): Promise<{ message: string; templates: any[] }> => {
  const response = await API.post(`/page/templates/seed-defaults`);
  return response.data;
};

//********* ACTIVITY FEED ****************
//************* */

export interface ActivityFeedFilters {
  userId?: string;
  resourceType?: 'page' | 'task' | 'project' | 'member' | 'comment';
  projectId?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

export interface ActivityType {
  _id: string;
  workspaceId: string;
  userId: string;
  type: 'page_created' | 'page_updated' | 'page_deleted' | 'task_created' | 'task_updated' | 'task_deleted' | 'task_moved' | 'project_created' | 'project_updated' | 'project_deleted' | 'member_added' | 'member_removed' | 'member_role_changed' | 'comment_added' | 'mention_added';
  title: string;
  description: string;
  resourceType: 'page' | 'task' | 'project' | 'member' | 'comment';
  resourceId?: string;
  resourceName?: string;
  projectId?: string;
  projectName?: string;
  data?: any;
  user: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ActivityFeedResponseType {
  message: string;
  activities: ActivityType[];
  pagination: {
    totalCount: number;
    hasMore: boolean;
    limit: number;
    offset: number;
  };
}

export const getActivityFeedQueryFn = async ({
  workspaceId,
  filters = {},
}: {
  workspaceId: string;
  filters?: ActivityFeedFilters;
}): Promise<ActivityFeedResponseType> => {
  const params = new URLSearchParams();
  
  if (filters.userId) params.append('userId', filters.userId);
  if (filters.resourceType) params.append('resourceType', filters.resourceType);
  if (filters.projectId) params.append('projectId', filters.projectId);
  if (filters.type) params.append('type', filters.type);
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.offset) params.append('offset', filters.offset.toString());

  const response = await API.get(`/workspace/${workspaceId}/activities?${params.toString()}`);
  return response.data;
};

export const getActivityByIdQueryFn = async ({
  workspaceId,
  activityId,
}: {
  workspaceId: string;
  activityId: string;
}): Promise<{ message: string; activity: ActivityType }> => {
  const response = await API.get(`/workspace/${workspaceId}/activities/${activityId}`);
  return response.data;
};

export const deleteActivityMutationFn = async ({
  workspaceId,
  activityId,
}: {
  workspaceId: string;
  activityId: string;
}): Promise<{ message: string; activity: ActivityType }> => {
  const response = await API.delete(`/workspace/${workspaceId}/activities/${activityId}`);
  return response.data;
};

// Comment API functions
export interface CommentType {
  _id: string;
  pageId: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  workspaceId: string;
  content: string;
  from: number;
  to: number;
  parentCommentId?: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  replies?: CommentType[];
  createdAt: string;
  updatedAt: string;
}

export const getCommentsByPageQueryFn = async ({
  workspaceId,
  pageId,
}: {
  workspaceId: string;
  pageId: string;
}): Promise<{ message: string; comments: CommentType[] }> => {
  const response = await API.get(`/comment/workspace/${workspaceId}/pages/${pageId}/comments`);
  return response.data;
};

export const createCommentMutationFn = async ({
  workspaceId,
  pageId,
  data,
}: {
  workspaceId: string;
  pageId: string;
  data: {
    content: string;
    from: number;
    to: number;
    parentCommentId?: string;
  };
}): Promise<{ message: string; comment: CommentType }> => {
  const response = await API.post(`/comment/workspace/${workspaceId}/pages/${pageId}/comments`, data);
  return response.data;
};

export const updateCommentMutationFn = async ({
  workspaceId,
  commentId,
  data,
}: {
  workspaceId: string;
  commentId: string;
  data: {
    content?: string;
    resolved?: boolean;
  };
}): Promise<{ message: string; comment: CommentType }> => {
  const response = await API.put(`/comment/workspace/${workspaceId}/comments/${commentId}`, data);
  return response.data;
};

export const deleteCommentMutationFn = async ({
  workspaceId,
  commentId,
}: {
  workspaceId: string;
  commentId: string;
}): Promise<{ message: string }> => {
  const response = await API.delete(`/comment/workspace/${workspaceId}/comments/${commentId}`);
  return response.data;
};

export const resolveCommentMutationFn = async ({
  workspaceId,
  commentId,
  resolved,
}: {
  workspaceId: string;
  commentId: string;
  resolved: boolean;
}): Promise<{ message: string; comment: CommentType }> => {
  const response = await API.patch(`/comment/workspace/${workspaceId}/comments/${commentId}/resolve`, { resolved });
  return response.data;
};

//********* SEARCH ****************

export interface SearchResultType {
  type: 'page' | 'task' | 'project';
  id: string;
  title: string;
  description?: string;
  content?: string;
  project?: {
    id: string;
    name: string;
    emoji?: string;
  };
  metadata?: {
    status?: string;
    priority?: string;
    assignedTo?: {
      id: string;
      name: string;
      profilePicture?: string;
    };
    createdAt?: string;
    updatedAt?: string;
  };
  score?: number;
}

export interface SearchPayloadType {
  query: string;
  types?: ('page' | 'task' | 'project')[];
  projectId?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResponseType {
  message: string;
  results: SearchResultType[];
  pagination: {
    totalCount: number;
    hasMore: boolean;
    limit: number;
    offset: number;
  };
}

export const searchQueryFn = async ({
  workspaceId,
  data,
}: {
  workspaceId: string;
  data: SearchPayloadType;
}): Promise<SearchResponseType> => {
  const response = await API.post(`/search/workspace/${workspaceId}/search`, data);
  return response.data;
};

// ==================== INTEGRATION API FUNCTIONS ====================

export interface Integration {
  _id: string;
  workspace: string;
  type: 'github' | 'google_calendar' | 'jira' | 'slack';
  name: string;
  status: 'active' | 'inactive' | 'error';
  config: Record<string, any>;
  metadata?: Record<string, any>;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const createIntegrationMutationFn = async ({
  workspaceId,
  data,
}: {
  workspaceId: string;
  data: {
    type: string;
    name: string;
    config: Record<string, any>;
  };
}): Promise<{ message: string; integration: Integration }> => {
  const response = await API.post(`/integration/workspace/${workspaceId}/integrations`, data);
  return response.data;
};

export const getIntegrationsByWorkspaceQueryFn = async ({
  workspaceId,
}: {
  workspaceId: string;
}): Promise<{ message: string; integrations: Integration[] }> => {
  const response = await API.get(`/integration/workspace/${workspaceId}/integrations`);
  return response.data;
};

export const getIntegrationByIdQueryFn = async ({
  workspaceId,
  integrationId,
}: {
  workspaceId: string;
  integrationId: string;
}): Promise<{ message: string; integration: Integration }> => {
  const response = await API.get(`/integration/workspace/${workspaceId}/integrations/${integrationId}`);
  return response.data;
};

export const updateIntegrationMutationFn = async ({
  workspaceId,
  integrationId,
  data,
}: {
  workspaceId: string;
  integrationId: string;
  data: {
    name?: string;
    config?: Record<string, any>;
    status?: string;
    metadata?: Record<string, any>;
  };
}): Promise<{ message: string; integration: Integration }> => {
  const response = await API.put(`/integration/workspace/${workspaceId}/integrations/${integrationId}`, data);
  return response.data;
};

export const deleteIntegrationMutationFn = async ({
  workspaceId,
  integrationId,
}: {
  workspaceId: string;
  integrationId: string;
}): Promise<{ message: string }> => {
  const response = await API.delete(`/integration/workspace/${workspaceId}/integrations/${integrationId}`);
  return response.data;
};

export const testIntegrationMutationFn = async ({
  workspaceId,
  integrationId,
}: {
  workspaceId: string;
  integrationId: string;
}): Promise<{ valid: boolean; message: string }> => {
  const response = await API.post(`/integration/workspace/${workspaceId}/integrations/${integrationId}/test`);
  return response.data;
};

// GitHub-specific API functions
export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  labels: Array<{ name: string; color: string }>;
  assignee: { login: string; avatar_url: string } | null;
  created_at: string;
  updated_at: string;
  html_url: string;
}

// Comprehensive GitHub sync - fetches all data types
export const syncGitHubAllDataMutationFn = async ({
  workspaceId,
  integrationId,
  projectId,
}: {
  workspaceId: string;
  integrationId: string;
  projectId?: string;
}): Promise<{
  message: string;
  repository: GitHubRepository;
  issues: GitHubIssue[];
  pullRequests: GitHubPullRequest[];
  commits: GitHubCommit[];
  releases: GitHubRelease[];
  contributors: GitHubContributor[];
  branches: GitHubBranch[];
  synced: {
    issues: number;
    pullRequests: number;
    commits: number;
    releases: number;
    contributors: number;
    branches: number;
  };
}> => {
  const response = await API.post(`/integration/workspace/${workspaceId}/integrations/${integrationId}/github/sync?syncAll=true`, {
    projectId,
  });
  return response.data;
};

// Legacy sync - issues only (for backward compatibility)
export const syncGitHubIssuesMutationFn = async ({
  workspaceId,
  integrationId,
  projectId,
}: {
  workspaceId: string;
  integrationId: string;
  projectId?: string;
}): Promise<{ message: string; issues: GitHubIssue[]; synced: number }> => {
  const response = await API.post(`/integration/workspace/${workspaceId}/integrations/${integrationId}/github/sync`, {
    projectId,
  });
  return response.data;
};

export const createGitHubIssueMutationFn = async ({
  workspaceId,
  integrationId,
  data,
}: {
  workspaceId: string;
  integrationId: string;
  data: {
    title: string;
    body?: string;
    labels?: string[];
    assignee?: string;
  };
}): Promise<{ message: string; issue: GitHubIssue }> => {
  const response = await API.post(`/integration/workspace/${workspaceId}/integrations/${integrationId}/github/issues`, data);
  return response.data;
};

// Additional GitHub interfaces
export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed' | 'merged';
  user: { login: string; avatar_url: string };
  head: { ref: string; sha: string };
  base: { ref: string; sha: string };
  merged_at: string | null;
  created_at: string;
  updated_at: string;
  html_url: string;
  review_comments?: number;
  commits?: number;
  additions?: number;
  deletions?: number;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: { name: string; email: string; login?: string; avatar_url?: string };
  committer: { name: string; email: string; login?: string; avatar_url?: string };
  date: string;
  url: string;
  html_url: string;
  stats?: { additions: number; deletions: number; total: number };
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  author: { login: string; avatar_url: string };
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string | null;
  html_url: string;
  assets_count: number;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  watchers: number;
  open_issues: number;
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  html_url: string;
  homepage: string | null;
  topics: string[];
  archived: boolean;
  private: boolean;
}

export interface GitHubContributor {
  login: string;
  id: number;
  avatar_url: string;
  contributions: number;
  type: string;
  html_url: string;
}

export interface GitHubBranch {
  name: string;
  commit: { sha: string; url: string };
  protected: boolean;
}

// New GitHub API functions
export const getGitHubRepositoryQueryFn = async ({
  workspaceId,
  integrationId,
}: {
  workspaceId: string;
  integrationId: string;
}): Promise<{ message: string; repository: GitHubRepository }> => {
  const response = await API.get(`/integration/workspace/${workspaceId}/integrations/${integrationId}/github/repository`);
  return response.data;
};

export const getGitHubPullRequestsQueryFn = async ({
  workspaceId,
  integrationId,
  state = 'all',
}: {
  workspaceId: string;
  integrationId: string;
  state?: 'open' | 'closed' | 'all';
}): Promise<{ message: string; pullRequests: GitHubPullRequest[]; count: number }> => {
  const response = await API.get(`/integration/workspace/${workspaceId}/integrations/${integrationId}/github/pull-requests`, {
    params: { state },
  });
  return response.data;
};

export const getGitHubCommitsQueryFn = async ({
  workspaceId,
  integrationId,
  branch,
  perPage = 30,
}: {
  workspaceId: string;
  integrationId: string;
  branch?: string;
  perPage?: number;
}): Promise<{ message: string; commits: GitHubCommit[]; count: number }> => {
  const response = await API.get(`/integration/workspace/${workspaceId}/integrations/${integrationId}/github/commits`, {
    params: { branch, perPage },
  });
  return response.data;
};

export const getGitHubReleasesQueryFn = async ({
  workspaceId,
  integrationId,
  perPage = 30,
}: {
  workspaceId: string;
  integrationId: string;
  perPage?: number;
}): Promise<{ message: string; releases: GitHubRelease[]; count: number }> => {
  const response = await API.get(`/integration/workspace/${workspaceId}/integrations/${integrationId}/github/releases`, {
    params: { perPage },
  });
  return response.data;
};

export const getGitHubContributorsQueryFn = async ({
  workspaceId,
  integrationId,
}: {
  workspaceId: string;
  integrationId: string;
}): Promise<{ message: string; contributors: GitHubContributor[]; count: number }> => {
  const response = await API.get(`/integration/workspace/${workspaceId}/integrations/${integrationId}/github/contributors`);
  return response.data;
};

export const getGitHubBranchesQueryFn = async ({
  workspaceId,
  integrationId,
}: {
  workspaceId: string;
  integrationId: string;
}): Promise<{ message: string; branches: GitHubBranch[]; count: number }> => {
  const response = await API.get(`/integration/workspace/${workspaceId}/integrations/${integrationId}/github/branches`);
  return response.data;
};

// ===== AI Assist =====
export const aiAssistMutationFn = async ({
  action,
  text,
}: {
  action: 'summarize' | 'improve' | 'rewrite';
  text: string;
}): Promise<{ message: string; result: string }> => {
  // Import AI_API for longer timeout
  const { AI_API } = await import('./axios-client');
  const response = await AI_API.post(`/ai/assist`, { action, text });
  return response.data;
};

// Google Calendar-specific API functions
export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  htmlLink?: string;
  status?: string;
}

export const syncCalendarEventsMutationFn = async ({
  workspaceId,
  integrationId,
  timeMin,
  timeMax,
}: {
  workspaceId: string;
  integrationId: string;
  timeMin?: string;
  timeMax?: string;
}): Promise<{ message: string; events: CalendarEvent[]; synced: number }> => {
  const response = await API.post(`/integration/workspace/${workspaceId}/integrations/${integrationId}/calendar/sync`, {
    timeMin,
    timeMax,
  });
  return response.data;
};

export const createCalendarEventMutationFn = async ({
  workspaceId,
  integrationId,
  data,
}: {
  workspaceId: string;
  integrationId: string;
  data: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone?: string };
    end: { dateTime: string; timeZone?: string };
    location?: string;
    attendees?: string[];
  };
}): Promise<{ message: string; event: CalendarEvent }> => {
  const response = await API.post(`/integration/workspace/${workspaceId}/integrations/${integrationId}/calendar/events`, data);
  return response.data;
};
