import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { KanbanBoard } from "@/components/workspace/kanban";
import CreateTaskDialog from "@/components/workspace/task/create-task-dialog";
import TaskTable from "@/components/workspace/task/task-table";

export default function Tasks() {
  const [activeTab, setActiveTab] = useState("kanban");

  return (
    <div className="w-full h-full flex-col space-y-8 pt-3">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">All Tasks</h2>
          <p className="text-muted-foreground">
            Here&apos;s the list of tasks for this workspace!
          </p>
        </div>
        <CreateTaskDialog />
      </div>

      {/* Task Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
          <TabsTrigger value="table">Task Table</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <KanbanBoard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="table" className="mt-6">
          <TaskTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
