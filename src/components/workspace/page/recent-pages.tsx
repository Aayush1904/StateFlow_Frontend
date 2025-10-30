import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Calendar, Eye, EyeOff, FileText, Plus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPagesByWorkspaceQueryFn } from "@/lib/api";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { format } from "date-fns";

const RecentPages: React.FC = () => {
    const workspaceId = useWorkspaceId();

    const { data, isLoading } = useQuery({
        queryKey: ["pages", workspaceId],
        queryFn: () => getPagesByWorkspaceQueryFn({ workspaceId }),
    });

    const pages = (data?.pages || [])
        .slice() // copy
        .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Recent Pages
                </CardTitle>
                <Link to={`/workspace/${workspaceId}/pages/new`}>
                    <Button size="sm" variant="outline">
                        <Plus className="h-3 w-3 mr-1" />
                        New Page
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="text-sm text-muted-foreground py-6">Loading pages...</div>
                ) : pages.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-6">No pages yet. Create your first page.</div>
                ) : (
                    <div className="flex flex-col divide-y">
                        {pages.map((page: any) => (
                            <div key={page._id} className="py-3 flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <Link
                                        to={`/workspace/${workspaceId}/pages/${page._id}`}
                                        className="font-medium text-sm line-clamp-1 hover:text-primary"
                                    >
                                        {page.title}
                                    </Link>
                                    <div className="mt-1 text-xs text-muted-foreground flex items-center gap-3">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(page.updatedAt), "MMM d, yyyy")}
                                        </span>
                                        <span className="hidden sm:inline">•</span>
                                        <span>by {page.updatedBy?.name || "Unknown"}</span>
                                    </div>
                                </div>
                                <Badge variant={page.isPublished ? "default" : "secondary"} className="whitespace-nowrap">
                                    {page.isPublished ? (
                                        <span className="flex items-center gap-1">
                                            <Eye className="h-3 w-3" /> Published
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1">
                                            <EyeOff className="h-3 w-3" /> Draft
                                        </span>
                                    )}
                                </Badge>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default RecentPages;
