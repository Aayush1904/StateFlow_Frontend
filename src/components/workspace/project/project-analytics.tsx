import AnalyticsCard from "../common/analytics-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TaskTrendChart from "./task-trend-chart";
import type { AnalyticsResponseType } from "@/types/api.type";

type ProjectAnalyticsProps = {
  analytics?: AnalyticsResponseType["analytics"];
  isLoading: boolean;
};

const ProjectAnalytics = ({ analytics, isLoading }: ProjectAnalyticsProps) => {
  const overview = analytics?.overview;
  const statusBreakdown = analytics?.statusBreakdown ?? [];
  const taskTrends = analytics?.taskTrends ?? [];
  const mostActiveUsers = analytics?.mostActiveUsers ?? [];

  const completionRate = overview?.completionRate ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AnalyticsCard
          isLoading={isLoading}
          title="Total Task"
          value={overview?.totalTasks ?? 0}
        />
        <AnalyticsCard
          isLoading={isLoading}
          title="Completed Task"
          value={overview?.completedTasks ?? 0}
        />
        <AnalyticsCard
          isLoading={isLoading}
          title="Overdue Task"
          value={overview?.overdueTasks ?? 0}
        />
        <Card className="shadow-none">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold">{completionRate}%</div>
            )}
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(100, Math.max(0, completionRate))}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Percentage of tasks marked as done within this project.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-none">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Task Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : taskTrends.length ? (
              <TaskTrendChart data={taskTrends} />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                Not enough data to display trends yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Most Active Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : mostActiveUsers.length ? (
              <div className="space-y-3">
                {mostActiveUsers.map((user) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between rounded-lg border bg-card px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                        <AvatarFallback>
                          {(user.name || "NA").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.taskCount} task{user.taskCount === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No assignees yet. Assign tasks to team members to see activity here.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : statusBreakdown.length ? (
            <div className="space-y-3">
              {statusBreakdown.map((item) => {
                const percent = overview?.totalTasks
                  ? Math.round((item.count / overview.totalTasks) * 100)
                  : 0;
                return (
                  <div key={item.status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {item.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-muted-foreground">
                        {item.count} ({percent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary/70"
                        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No tasks found for this project yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectAnalytics;
