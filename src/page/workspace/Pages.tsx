import { PagesList } from '@/components/workspace/page';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, TestTube } from 'lucide-react';
import Breadcrumbs, { useBreadcrumbs } from '@/components/ui/breadcrumbs';

const Pages = () => {
    const { workspaceId } = useParams();
    const { getPagesBreadcrumbs } = useBreadcrumbs();

    return (
        <div className="w-full h-full flex-col space-y-8 pt-3">
            {/* Breadcrumbs */}
            <Breadcrumbs items={getPagesBreadcrumbs()} />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h1 className="text-2xl font-bold">Pages</h1>
                </div>
                <Link to={`/workspace/${workspaceId}/test-editor`}>
                    <Button variant="outline">
                        <TestTube className="h-4 w-4 mr-2" />
                        Test Editor
                    </Button>
                </Link>
            </div>

            <PagesList />
        </div>
    );
};

export default Pages;
