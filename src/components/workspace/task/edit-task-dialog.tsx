import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import EditTaskForm from "./edit-task-form";
import { TaskType } from "@/types/api.type";

const EditTaskDialog = ({ task, isOpen, onClose }: { task: TaskType; isOpen: boolean; onClose: () => void }) => {
  return (
    <Dialog modal={true} open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-auto my-5 border-0">
        <DialogTitle className="sr-only">Edit Task</DialogTitle>
        <DialogDescription className="sr-only">
          Edit the task details including title, description, priority, status, assignee, and due date.
        </DialogDescription>
        <EditTaskForm task={task} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskDialog;
