import { Loader } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { BASE_ROUTE } from "@/routes/common/routePaths";
import useAuth from "@/hooks/api/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invitedUserJoinWorkspaceMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const InviteUser = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const param = useParams();
  let inviteCode = param.inviteCode as string;

  // Debug logging
  console.log('InviteUser - inviteCode:', inviteCode);
  console.log('InviteUser - param:', param);

  // Validate and clean the invite code
  if (inviteCode && inviteCode.includes('http')) {
    console.error('Invalid invite code - contains URL:', inviteCode);
    // Extract just the invite code from the URL if it's malformed
    const match = inviteCode.match(/\/invite\/workspace\/([^\/]+)\/join/);
    if (match) {
      inviteCode = match[1];
      console.log('Extracted invite code:', inviteCode);
    }
  }

  // Additional validation
  if (!inviteCode || inviteCode.length < 6) {
    console.error('Invalid invite code:', inviteCode);
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Invalid Invite Link</h1>
          <p className="text-gray-600 mt-2">The invite link appears to be malformed.</p>
        </div>
      </div>
    );
  }

  const { data: authData, isPending } = useAuth();
  const user = authData?.user;

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: invitedUserJoinWorkspaceMutationFn,
  });

  const returnUrl = encodeURIComponent(
    `${BASE_ROUTE.INVITE_URL.replace(":inviteCode", inviteCode)}`
  );

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    mutate(inviteCode, {
      onSuccess: (data) => {
        queryClient.resetQueries({
          queryKey: ["userWorkspaces"],
        });
        navigate(`/workspace/${data.workspaceId}`);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <Logo />
          Stateflow
        </Link>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">
                Hey there! You're invited to join a Stateflow Workspace!
              </CardTitle>
              <CardDescription>
                Looks like you need to be logged into your Stateflow account to
                join this Workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPending ? (
                <Loader className="!w-11 !h-11 animate-spin place-self-center flex" />
              ) : (
                <div>
                  {user ? (
                    <div className="flex items-center justify-center my-3">
                      <form onSubmit={handleSubmit}>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="!bg-green-500 !text-white text-[23px] !h-auto"
                        >
                          {isLoading && (
                            <Loader className="!w-6 !h-6 animate-spin" />
                          )}
                          Join the Workspace
                        </Button>
                      </form>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row items-center gap-2">
                      <Link
                        className="flex-1 w-full text-base"
                        to={`/sign-up?returnUrl=${returnUrl}`}
                      >
                        <Button className="w-full">Signup</Button>
                      </Link>
                      <Link
                        className="flex-1 w-full text-base"
                        to={`/?returnUrl=${returnUrl}`}
                      >
                        <Button variant="secondary" className="w-full border">
                          Login
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InviteUser;
