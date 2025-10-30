import React, { useState, useMemo } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MoreHorizontal, GitBranch, RefreshCw } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TaskType } from '@/types/api.type';
import { TaskStatusEnum } from '@/constant';
import { getAllTasksQueryFn, editTaskMutationFn } from '@/lib/api';
import useWorkspaceId from '@/hooks/use-workspace-id';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

import KanbanColumn from './kanban-column';
import KanbanCard from './kanban-card';
import GitHubIssueCard from './github-issue-card';
import CreateTaskDialog from '../task/create-task-dialog';
import { useGitHubIssues } from '@/hooks/use-github-issues';

interface KanbanBoardProps {
    projectId?: string;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId }) => {
    const workspaceId = useWorkspaceId();
    const queryClient = useQueryClient();
    const [activeTask, setActiveTask] = useState<TaskType | null>(null);
    
    // GitHub Issues integration
    const {
        issues: githubIssues,
        issuesByStatus: githubIssuesByStatus,
        hasIntegration: hasGitHubIntegration,
        showGitHubIssues,
        setShowGitHubIssues,
        syncIssues,
        repository,
        organization,
    } = useGitHubIssues({ workspaceId, projectId, enabled: true });

    const sensors = useSensors(
        // Mouse (desktop)
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        // Touch (mobile)
        useSensor(TouchSensor, {
            // Small long-press delay helps avoid conflict with scrolling
            pressDelay: 150,
            activationConstraint: {
                tolerance: 8,
            },
        })
    );

    // Fetch tasks
    const { data, isLoading } = useQuery({
        queryKey: ['all-tasks', workspaceId, projectId],
        queryFn: () =>
            getAllTasksQueryFn({
                workspaceId,
                projectId: projectId || '',
                pageNumber: 1,
                pageSize: 1000, // Get all tasks for Kanban
            }),
        staleTime: 0,
    });

    const tasks: TaskType[] = data?.tasks || [];

    // Group tasks by status
    const tasksByStatus = useMemo(() => {
        const grouped = {
            [TaskStatusEnum.BACKLOG]: [] as TaskType[],
            [TaskStatusEnum.TODO]: [] as TaskType[],
            [TaskStatusEnum.IN_PROGRESS]: [] as TaskType[],
            [TaskStatusEnum.IN_REVIEW]: [] as TaskType[],
            [TaskStatusEnum.DONE]: [] as TaskType[],
        };

        tasks.forEach((task) => {
            if (grouped[task.status as TaskStatusEnum]) {
                grouped[task.status as TaskStatusEnum].push(task);
            }
        });

        return grouped;
    }, [tasks]);

    // Mutation for updating task status
    const { mutate: updateTaskStatus } = useMutation({
        mutationFn: editTaskMutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-tasks', workspaceId] });
            toast({
                title: 'Success',
                description: 'Task updated successfully',
                variant: 'success',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = tasks.find((t) => t._id === active.id);
        setActiveTask(task || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const taskId = active.id as string;
        const newStatus = over.id as TaskStatusEnum;
        const task = tasks.find((t) => t._id === taskId);

        if (!task || task.status === newStatus) return;

        // Update task status
        updateTaskStatus({
            workspaceId,
            projectId: task.project?._id || '',
            taskId,
            data: {
                title: task.title,
                description: task.description || '',
                priority: task.priority,
                status: newStatus,
                assignedTo: task.assignedTo?._id || null,
                dueDate: task.dueDate || '',
            },
        });
    };

    const getStatusInfo = (status: TaskStatusEnum) => {
        switch (status) {
            case TaskStatusEnum.BACKLOG:
                return {
                    title: 'Backlog',
                    color: 'bg-gray-100 text-gray-800',
                    count: tasksByStatus[TaskStatusEnum.BACKLOG].length,
                };
            case TaskStatusEnum.TODO:
                return {
                    title: 'To Do',
                    color: 'bg-blue-100 text-blue-800',
                    count: tasksByStatus[TaskStatusEnum.TODO].length,
                };
            case TaskStatusEnum.IN_PROGRESS:
                return {
                    title: 'In Progress',
                    color: 'bg-yellow-100 text-yellow-800',
                    count: tasksByStatus[TaskStatusEnum.IN_PROGRESS].length,
                };
            case TaskStatusEnum.IN_REVIEW:
                return {
                    title: 'In Review',
                    color: 'bg-purple-100 text-purple-800',
                    count: tasksByStatus[TaskStatusEnum.IN_REVIEW].length,
                };
            case TaskStatusEnum.DONE:
                return {
                    title: 'Done',
                    color: 'bg-green-100 text-green-800',
                    count: tasksByStatus[TaskStatusEnum.DONE].length,
                };
            default:
                return {
                    title: 'Unknown',
                    color: 'bg-gray-100 text-gray-800',
                    count: 0,
                };
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading tasks...</div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">
            {/* GitHub Controls */}
            {hasGitHubIntegration && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-3">
                        <GitBranch className="h-5 w-5 text-blue-600" />
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                GitHub Issues Integration
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {organization}/{repository} • {githubIssues.length} issues
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Switch
                                id="show-github"
                                checked={showGitHubIssues}
                                onCheckedChange={setShowGitHubIssues}
                            />
                            <Label htmlFor="show-github" className="text-sm cursor-pointer">
                                Show Issues
                            </Label>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                                try {
                                    await syncIssues();
                                    toast({
                                        title: 'Synced',
                                        description: 'GitHub issues updated successfully',
                                        variant: 'success',
                                    });
                                } catch (error) {
                                    toast({
                                        title: 'Error',
                                        description: 'Failed to sync GitHub issues',
                                        variant: 'destructive',
                                    });
                                }
                            }}
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Sync
                        </Button>
                    </div>
                </div>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-6 overflow-x-auto pb-4">
                    {Object.values(TaskStatusEnum).map((status) => {
                        const statusInfo = getStatusInfo(status);
                        const columnTasks = tasksByStatus[status];
                        
                        // Get corresponding GitHub issues for this column
                        let githubColumnIssues: any[] = [];
                        if (showGitHubIssues && hasGitHubIntegration) {
                            if (status === TaskStatusEnum.TODO || status === TaskStatusEnum.BACKLOG) {
                                githubColumnIssues = githubIssuesByStatus.todo || [];
                            } else if (status === TaskStatusEnum.IN_PROGRESS) {
                                githubColumnIssues = githubIssuesByStatus.inProgress || [];
                            } else if (status === TaskStatusEnum.DONE) {
                                githubColumnIssues = githubIssuesByStatus.done || [];
                            }
                        }
                        
                        const totalCount = statusInfo.count + githubColumnIssues.length;

                        return (
                            <div key={status} className="flex-shrink-0 w-80">
                                <KanbanColumn
                                    id={status}
                                    title={statusInfo.title}
                                    count={totalCount}
                                    color={statusInfo.color}
                                >
                                    <SortableContext
                                        items={columnTasks.map((task) => task._id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-3">
                                            {/* Regular Tasks */}
                                            {columnTasks.map((task) => (
                                                <KanbanCard key={task._id} task={task} />
                                            ))}
                                            
                                            {/* GitHub Issues */}
                                            {githubColumnIssues.map((issue) => (
                                                <GitHubIssueCard 
                                                    key={`github-${issue.number}`} 
                                                    issue={issue} 
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </KanbanColumn>
                            </div>
                        );
                    })}
                </div>

                <DragOverlay>
                    {activeTask ? (
                        <KanbanCard task={activeTask} isDragging />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default KanbanBoard;
