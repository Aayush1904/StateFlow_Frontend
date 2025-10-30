import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import CreateProjectForm from "@/components/workspace/project/create-project-form";
import useCreateProjectDialog from "@/hooks/use-create-project-dialog";

const CreateProjectDialog = () => {
  const { open, onClose } = useCreateProjectDialog();
  return (
    <div>
      <Dialog modal={true} open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg border-0">
          <DialogTitle className="sr-only">Create New Project</DialogTitle>
          <DialogDescription className="sr-only">
            Create a new project to organize your tasks and collaborate with your team.
          </DialogDescription>
          <CreateProjectForm {...{ onClose }} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateProjectDialog;
