import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { KanbanBoard } from "@/components/workspace/kanban";
import ProjectAnalytics from "@/components/workspace/project/project-analytics";
import ProjectHeader from "@/components/workspace/project/project-header";
import TaskTable from "@/components/workspace/task/task-table";
import ProjectTimeline from "@/components/workspace/project/project-timeline";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { getProjectAnalyticsQueryFn } from "@/lib/api";
import { useNotifications } from "@/context/notification-provider";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const workspaceId = useWorkspaceId();
  const [activeTab, setActiveTab] = useState("kanban");
  const queryClient = useQueryClient();
  const { socket } = useNotifications();

  const { data, isPending } = useQuery({
    queryKey: ["project-analytics", workspaceId, projectId],
    queryFn: () =>
      getProjectAnalyticsQueryFn({
        workspaceId,
        projectId: projectId!,
      }),
    enabled: Boolean(workspaceId && projectId),
    staleTime: 0,
  });

  const analytics = data?.analytics;

  useEffect(() => {
    if (!socket || !projectId) {
      return;
    }

    socket.emit('join-project', projectId);

    const handleAnalyticsUpdate = (payload: { projectId: string }) => {
      if (payload.projectId === projectId) {
        queryClient.invalidateQueries({ queryKey: ["project-analytics", workspaceId, projectId] });
      }
    };

    socket.on('project-analytics-update', handleAnalyticsUpdate);

    return () => {
      socket.emit('leave-project', projectId);
      socket.off('project-analytics-update', handleAnalyticsUpdate);
    };
  }, [socket, projectId, queryClient, workspaceId]);

  return (
    <div className="w-full space-y-6 py-4 md:pt-3">
      <ProjectHeader />
      <div className="space-y-5">
        <ProjectAnalytics analytics={analytics} isLoading={isPending} />
        <Separator />

        {/* Task Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full overflow-x-auto scrollbar-hide">
            <div className="flex min-w-max gap-1 sm:grid sm:grid-cols-3 sm:w-full">
              <TabsTrigger value="kanban" className="whitespace-nowrap flex-shrink-0 sm:flex-shrink">Kanban Board</TabsTrigger>
              <TabsTrigger value="table" className="whitespace-nowrap flex-shrink-0 sm:flex-shrink">Task Table</TabsTrigger>
              <TabsTrigger value="timeline" className="whitespace-nowrap flex-shrink-0 sm:flex-shrink">Timeline</TabsTrigger>
            </div>
          </TabsList>

          <TabsContent value="kanban" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <KanbanBoard projectId={projectId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="table" className="mt-6">
            <TaskTable />
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <ProjectTimeline analytics={analytics} isLoading={isPending} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectDetails;
