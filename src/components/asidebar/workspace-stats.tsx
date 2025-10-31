import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllWorkspacesUserIsMemberQueryFn } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Users } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

const WorkspaceStats: React.FC = () => {
    const { state } = useSidebar();

    const { data: workspacesData, isLoading } = useQuery({
        queryKey: ['userWorkspaces'],
        queryFn: getAllWorkspacesUserIsMemberQueryFn,
    });

    const workspaces = workspacesData?.workspaces || [];
    const workspaceCount = workspaces.length;

    if (isLoading) {
        return (
            <Card className="mx-2 mb-2">
                <CardContent className="p-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>Loading...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mx-2 mb-2">
            <CardContent className="p-3">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-primary" />
                        {state === "expanded" && (
                            <>
                                <span className="font-medium">Workspaces</span>
                                <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                    {workspaceCount}
                                </span>
                            </>
                        )}
                    </div>
                    {state === "expanded" && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>Member of {workspaceCount} workspace{workspaceCount !== 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default WorkspaceStats;
