import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsResponseType } from "@/types/api.type";

type ProjectTimelineProps = {
  analytics?: AnalyticsResponseType["analytics"];
  isLoading: boolean;
};

const ProjectTimeline = ({ analytics, isLoading }: ProjectTimelineProps) => {
  const timeline = analytics?.timeline ?? [];

  if (isLoading) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!timeline.length) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add due dates to tasks to visualize progress on the timeline.
          </p>
        </CardContent>
      </Card>
    );
  }

  const startTimes = timeline.map((item) => new Date(item.startDate).getTime());
  const endTimes = timeline.map((item) => new Date(item.endDate).getTime());
  const minStart = Math.min(...startTimes);
  const maxEnd = Math.max(...endTimes, minStart + 1);
  const range = maxEnd - minStart || 1;

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {timeline.map((item) => {
          const start = new Date(item.startDate);
          const end = new Date(item.endDate);
          const rawLeft = ((start.getTime() - minStart) / range) * 100;
          const normalizedLeft = Math.min(100, Math.max(0, rawLeft));
          const rawWidth = Math.max(4, ((end.getTime() - start.getTime()) / range) * 100);
          const normalizedWidth = Math.min(100 - normalizedLeft, rawWidth);

          return (
            <div key={item.taskId} className="space-y-2">
              <div className="flex items-start justify-between gap-4 text-sm">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {start.toLocaleDateString()} – {end.toLocaleDateString()} · {item.durationDays} day{item.durationDays === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {item.assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={item.assignee.avatar ?? undefined} alt={item.assignee.name} />
                        <AvatarFallback>
                          {(item.assignee.name || "NA").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {item.assignee.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Unassigned</span>
                  )}
                  <span className="text-xs font-medium text-primary">
                    {Math.round(item.progress * 100)}%
                  </span>
                </div>
              </div>
              <div className="relative h-3 rounded-full bg-muted">
                <div
                  className="absolute h-3 rounded-full bg-primary/80"
                  style={{ left: `${normalizedLeft}%`, width: `${normalizedWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ProjectTimeline;

