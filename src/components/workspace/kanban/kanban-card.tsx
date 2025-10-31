import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, Calendar, Pencil, Copy, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/resuable/confirm-dialog';
import { TaskType } from '@/types/api.type';
import { TaskPriorityEnum } from '@/constant';
import { deleteTaskMutationFn, createTaskMutationFn } from '@/lib/api';
import useWorkspaceId from '@/hooks/use-workspace-id';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import EditTaskDialog from '../task/edit-task-dialog';

interface KanbanCardProps {
    task: TaskType;
    isDragging?: boolean;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ task, isDragging = false }) => {
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);

    const queryClient = useQueryClient();
    const workspaceId = useWorkspaceId();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({
        id: task._id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    // Delete mutation
    const { mutate: deleteTask, isPending: isDeleting } = useMutation({
        mutationFn: deleteTaskMutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-tasks', workspaceId] });
            toast({
                title: 'Success',
                description: 'Task deleted successfully',
                variant: 'success',
            });
            setOpenDeleteDialog(false);
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    // Duplicate mutation
    const { mutate: duplicateTask, isPending: isDuplicatingTask } = useMutation({
        mutationFn: createTaskMutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-tasks', workspaceId] });
            toast({
                title: 'Success',
                description: 'Task duplicated successfully',
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

    const handleDelete = () => {
        deleteTask({ workspaceId, taskId: task._id });
    };

    const handleDuplicate = () => {
        if (!task.project?._id) return;

        duplicateTask({
            workspaceId,
            projectId: task.project._id,
            data: {
                title: `${task.title} (Copy)`,
                description: task.description || '',
                priority: task.priority,
                status: task.status,
                assignedTo: task.assignedTo?._id || '',
                dueDate: task.dueDate || '',
            },
        });
    };

    const getPriorityColor = (priority: typeof TaskPriorityEnum[keyof typeof TaskPriorityEnum]) => {
        switch (priority) {
            case TaskPriorityEnum.HIGH:
                return 'bg-red-100 text-red-800 border-red-200';
            case TaskPriorityEnum.MEDIUM:
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case TaskPriorityEnum.LOW:
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getAssigneeInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
            >
                <Card
                    ref={setNodeRef}
                    style={style}
                    {...attributes}
                    {...listeners}
                    className={cn(
                        'cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md touch-none',
                        (isDragging || isSortableDragging) && 'opacity-50 shadow-lg scale-105'
                    )}
                >
                <CardContent className="p-4">
                    <div className="space-y-3">
                        {/* Task Title */}
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-sm leading-tight line-clamp-2">
                                {task.title}
                            </h3>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <MoreHorizontal className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setOpenEditDialog(true)}>
                                        <Pencil className="h-3 w-3 mr-2" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleDuplicate} disabled={isDuplicatingTask}>
                                        <Copy className="h-3 w-3 mr-2" />
                                        Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => setOpenDeleteDialog(true)}
                                    >
                                        <Trash2 className="h-3 w-3 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Task Description */}
                        {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                                {task.description}
                            </p>
                        )}

                        {/* Task Code */}
                        <div className="text-xs text-muted-foreground font-mono">
                            {task.taskCode}
                        </div>

                        {/* Priority Badge */}
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className={cn('text-xs', getPriorityColor(task.priority))}
                            >
                                {task.priority}
                            </Badge>
                        </div>

                        {/* Footer with Assignee and Due Date */}
                        <div className="flex items-center justify-between pt-2 border-t">
                            {/* Assignee */}
                            {task.assignedTo && (
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={task.assignedTo.profilePicture || undefined} />
                                        <AvatarFallback className="text-xs">
                                            {getAssigneeInitials(task.assignedTo.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-muted-foreground">
                                        {task.assignedTo.name}
                                    </span>
                                </div>
                            )}

                            {/* Due Date */}
                            {task.dueDate && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
            </motion.div>

            {/* Edit Task Dialog */}
            <EditTaskDialog
                task={task}
                isOpen={openEditDialog}
                onClose={() => setOpenEditDialog(false)}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={openDeleteDialog}
                isLoading={isDeleting}
                onClose={() => setOpenDeleteDialog(false)}
                onConfirm={handleDelete}
                title="Delete Task"
                description={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </>
    );
};

export default KanbanCard;
