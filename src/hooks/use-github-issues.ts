import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import API from '@/lib/axios-client';
import { GitHubIssue } from '@/lib/api';

interface UseGitHubIssuesProps {
  workspaceId: string | undefined;
  projectId?: string;
  enabled?: boolean;
}

interface GitHubIssuesResponse {
  issues: GitHubIssue[];
  integration: {
    _id: string;
    type: string;
    config: {
      organization: string;
      repository: string;
    };
  };
}

export const useGitHubIssues = ({ 
  workspaceId, 
  projectId,
  enabled = true 
}: UseGitHubIssuesProps) => {
  const [showGitHubIssues, setShowGitHubIssues] = useState(true);

  // Fetch GitHub integration
  const { data: integrationData } = useQuery({
    queryKey: ['integrations', workspaceId],
    queryFn: async () => {
      const response = await API.get(`/integration/workspace/${workspaceId}/integrations`);
      return response.data;
    },
    enabled: enabled && !!workspaceId && workspaceId !== "undefined",
  });

  // Find GitHub integration
  const githubIntegration = useMemo(() => {
    if (!integrationData?.integrations) return null;
    return integrationData.integrations.find(
      (integration: any) => integration.type === 'github' && integration.status === 'active'
    );
  }, [integrationData]);

  // Fetch GitHub issues
  const {
    data: issuesData,
    isLoading,
    error,
    refetch,
  } = useQuery<GitHubIssuesResponse>({
    queryKey: ['github-issues', workspaceId, githubIntegration?._id],
    queryFn: async () => {
      if (!githubIntegration) {
        throw new Error('No active GitHub integration found');
      }

      const response = await API.get(
        `/integration/workspace/${workspaceId}/integrations/${githubIntegration._id}/github/issues`
      );
      return response.data;
    },
    enabled: enabled && !!githubIntegration,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Map GitHub issues to Kanban columns based on state and labels
  const issuesByStatus = useMemo(() => {
    if (!issuesData?.issues || !showGitHubIssues) {
      return {
        todo: [],
        inProgress: [],
        done: [],
      };
    }

    const todo: GitHubIssue[] = [];
    const inProgress: GitHubIssue[] = [];
    const done: GitHubIssue[] = [];

    issuesData.issues.forEach((issue) => {
      // Closed issues go to done
      if (issue.state === 'closed') {
        done.push(issue);
        return;
      }

      // Check labels for status hints
      const hasInProgressLabel = issue.labels.some(
        (label) =>
          label.name.toLowerCase().includes('in progress') ||
          label.name.toLowerCase().includes('wip') ||
          label.name.toLowerCase().includes('doing')
      );

      const hasTodoLabel = issue.labels.some(
        (label) =>
          label.name.toLowerCase().includes('todo') ||
          label.name.toLowerCase().includes('backlog') ||
          label.name.toLowerCase().includes('ready')
      );

      if (hasInProgressLabel) {
        inProgress.push(issue);
      } else if (hasTodoLabel || issue.labels.length === 0) {
        todo.push(issue);
      } else {
        // Default: put in todo
        todo.push(issue);
      }
    });

    return { todo, inProgress, done };
  }, [issuesData, showGitHubIssues]);

  // Sync issues from GitHub
  const syncIssues = async () => {
    if (!githubIntegration) {
      throw new Error('No GitHub integration found');
    }

    try {
      await API.post(
        `/integration/workspace/${workspaceId}/integrations/${githubIntegration._id}/github/sync`,
        { projectId }
      );
      await refetch();
    } catch (error) {
      console.error('Failed to sync GitHub issues:', error);
      throw error;
    }
  };

  return {
    issues: issuesData?.issues || [],
    issuesByStatus,
    isLoading,
    error,
    hasIntegration: !!githubIntegration,
    integration: githubIntegration,
    repository: githubIntegration?.config?.repository,
    organization: githubIntegration?.config?.organization,
    showGitHubIssues,
    setShowGitHubIssues,
    syncIssues,
    refetch,
  };
};

