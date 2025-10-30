import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { invitedUserJoinWorkspaceMutationFn } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Loader } from 'lucide-react';

interface JoinWorkspaceDialogProps {
    children?: React.ReactNode;
}

const JoinWorkspaceDialog: React.FC<JoinWorkspaceDialogProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inviteCode, setInviteCode] = useState('');
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { mutate: joinWorkspace, isPending } = useMutation({
        mutationFn: invitedUserJoinWorkspaceMutationFn,
        onSuccess: (data) => {
            toast({
                title: 'Success!',
                description: 'You have successfully joined the workspace.',
            });

            // Refresh workspace list
            queryClient.invalidateQueries({ queryKey: ['userWorkspaces'] });

            // Navigate to the new workspace
            navigate(`/workspace/${data.workspaceId}`);

            // Close dialog and reset form
            setIsOpen(false);
            setInviteCode('');
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to join workspace',
                variant: 'destructive',
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteCode.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter an invite code',
                variant: 'destructive',
            });
            return;
        }
        joinWorkspace(inviteCode.trim());
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        Join Workspace
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Join a Workspace</DialogTitle>
                    <DialogDescription>
                        Enter the invite code provided by the workspace owner to join their workspace.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="inviteCode" className="text-right">
                                Invite Code
                            </Label>
                            <Input
                                id="inviteCode"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                placeholder="Enter invite code..."
                                className="col-span-3"
                                disabled={isPending}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                                    Joining...
                                </>
                            ) : (
                                'Join Workspace'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default JoinWorkspaceDialog;
