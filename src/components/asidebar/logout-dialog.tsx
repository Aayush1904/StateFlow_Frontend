import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";

const LogoutDialog = (props: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { isOpen, setIsOpen } = props;
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  // Extract logout logic to ensure it always runs
  const performLogout = useCallback(() => {
    // Clear all authentication data from localStorage FIRST
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    
    // Clear all query cache to prevent stale data
    queryClient.clear();
    
    // Reset auth query specifically to ensure it doesn't run
    queryClient.resetQueries({ queryKey: ["authUser"] });
    
    // Set auth query data to undefined/null explicitly
    queryClient.setQueryData(["authUser"], undefined);
    
    // Small delay to ensure state is cleared before navigation
    setTimeout(() => {
      navigate("/", { replace: true });
      setIsOpen(false);
    }, 100);
  }, [queryClient, navigate]);

  const { mutate, isPending } = useMutation({
    mutationFn: logoutMutationFn,
    onSuccess: () => {
      performLogout();
    },
    onError: (error) => {
      // Even if API call fails, perform local logout
      performLogout();
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle logout action
  const handleLogout = useCallback(() => {
    if (isPending) return;
    mutate();
  }, [isPending, mutate]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to log out?</DialogTitle>
            <DialogDescription>
              This will end your current session and you will need to log in
              again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button disabled={isPending} type="button" onClick={handleLogout}>
              {isPending && <Loader className="animate-spin" />}
              Sign out
            </Button>
            <Button type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LogoutDialog;
