import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { IntegrationsList } from '@/components/workspace/integrations/integrations-list';
import { GitHubIssuesSync } from '@/components/workspace/integrations/github-issues-sync';
import { CalendarEventsSync } from '@/components/workspace/integrations/calendar-events-sync';
import { getIntegrationsByWorkspaceQueryFn, Integration } from '@/lib/api';
import useWorkspaceId from '@/hooks/use-workspace-id';
import Breadcrumbs, { useBreadcrumbs } from '@/components/ui/breadcrumbs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Integrations: React.FC = () => {
    const workspaceId = useWorkspaceId();
    const { getIntegrationsBreadcrumbs } = useBreadcrumbs();

    const { data } = useQuery({
        queryKey: ['integrations', workspaceId],
        queryFn: () => getIntegrationsByWorkspaceQueryFn({ workspaceId }),
    });

    const integrations = data?.integrations || [];
    const githubIntegrations = integrations.filter((i: Integration) => i.type === 'github');
    const calendarIntegrations = integrations.filter((i: Integration) => i.type === 'google_calendar');

    return (
        <div className="w-full h-full flex-col space-y-6 pt-3">
            <Breadcrumbs items={getIntegrationsBreadcrumbs()} />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Integrations</h1>
                    <p className="text-muted-foreground mt-1">
                        Connect external services to enhance your workflow
                    </p>
                </div>
            </div>

            <Tabs defaultValue="manage" className="w-full">
                <TabsList className="overflow-x-auto scrollbar-hide">
                    <div className="flex min-w-max gap-1">
                        <TabsTrigger value="manage" className="whitespace-nowrap">Manage Integrations</TabsTrigger>
                        <TabsTrigger value="github" className="whitespace-nowrap">GitHub</TabsTrigger>
                        <TabsTrigger value="calendar" className="whitespace-nowrap">Calendar</TabsTrigger>
                    </div>
                </TabsList>

                <TabsContent value="manage" className="space-y-4">
                    <IntegrationsList />
                </TabsContent>

                <TabsContent value="github" className="space-y-4">
                    {githubIntegrations.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No GitHub integrations found. Add one from the "Manage Integrations" tab.</p>
                        </div>
                    ) : (
                        githubIntegrations.map((integration: Integration) => (
                            <GitHubIssuesSync key={integration._id} integration={integration} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="calendar" className="space-y-4">
                    {calendarIntegrations.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No Calendar integrations found. Add one from the "Manage Integrations" tab.</p>
                        </div>
                    ) : (
                        calendarIntegrations.map((integration: Integration) => (
                            <CalendarEventsSync key={integration._id} integration={integration} />
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Integrations;







