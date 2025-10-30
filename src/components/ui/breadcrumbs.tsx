import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Home, FileText, Folder, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ReactNode;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
    const { workspaceId } = useParams();

    return (
        <nav className={cn('flex items-center space-x-1 text-sm text-muted-foreground', className)}>
            {/* Workspace Home */}
            <Link
                to={`/workspace/${workspaceId}`}
                className="flex items-center hover:text-foreground transition-colors"
            >
                <Home className="h-4 w-4 mr-1" />
                <span>Workspace</span>
            </Link>

            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <ChevronRight className="h-4 w-4" />
                    {item.href ? (
                        <Link
                            to={item.href}
                            className="flex items-center hover:text-foreground transition-colors"
                        >
                            {item.icon && <span className="mr-1">{item.icon}</span>}
                            <span>{item.label}</span>
                        </Link>
                    ) : (
                        <span className="flex items-center text-foreground">
                            {item.icon && <span className="mr-1">{item.icon}</span>}
                            <span>{item.label}</span>
                        </span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

// Hook to generate breadcrumbs for different pages
export const useBreadcrumbs = () => {
    const { workspaceId, projectId, pageId } = useParams();

    const getPagesBreadcrumbs = (): BreadcrumbItem[] => [
        {
            label: 'Pages',
            href: `/workspace/${workspaceId}/pages`,
            icon: <FileText className="h-4 w-4" />,
        },
    ];

    const getPageBreadcrumbs = (pageTitle?: string): BreadcrumbItem[] => [
        {
            label: 'Pages',
            href: `/workspace/${workspaceId}/pages`,
            icon: <FileText className="h-4 w-4" />,
        },
        {
            label: pageTitle || 'Page',
            icon: <FileText className="h-4 w-4" />,
        },
    ];

    const getNewPageBreadcrumbs = (): BreadcrumbItem[] => [
        {
            label: 'Pages',
            href: `/workspace/${workspaceId}/pages`,
            icon: <FileText className="h-4 w-4" />,
        },
        {
            label: 'New Page',
            icon: <FileText className="h-4 w-4" />,
        },
    ];

    const getProjectBreadcrumbs = (projectName?: string): BreadcrumbItem[] => [
        {
            label: 'Projects',
            href: `/workspace/${workspaceId}`,
            icon: <Folder className="h-4 w-4" />,
        },
        {
            label: projectName || 'Project',
            icon: <Folder className="h-4 w-4" />,
        },
    ];

    const getTasksBreadcrumbs = (): BreadcrumbItem[] => [
        {
            label: 'Tasks',
            href: `/workspace/${workspaceId}/tasks`,
            icon: <FileText className="h-4 w-4" />,
        },
    ];

    const getIntegrationsBreadcrumbs = (): BreadcrumbItem[] => [
        {
            label: 'Integrations',
            href: `/workspace/${workspaceId}/integrations`,
            icon: <Settings className="h-4 w-4" />,
        },
    ];

    return {
        getPagesBreadcrumbs,
        getPageBreadcrumbs,
        getNewPageBreadcrumbs,
        getProjectBreadcrumbs,
        getTasksBreadcrumbs,
        getIntegrationsBreadcrumbs,
    };
};

export default Breadcrumbs;
