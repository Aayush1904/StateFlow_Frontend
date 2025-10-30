import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
    id: string;
    title: string;
    count: number;
    color: string;
    children: React.ReactNode;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
    id,
    title,
    count,
    color,
    children,
}) => {
    const { isOver, setNodeRef } = useDroppable({
        id,
    });

    return (
        <Card className="h-fit">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {title}
                        </CardTitle>
                        <Badge variant="secondary" className={cn('text-xs', color)}>
                            {count}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent
                ref={setNodeRef}
                className={cn(
                    'min-h-[400px] transition-colors duration-200',
                    isOver && 'bg-muted/50'
                )}
            >
                {children}
            </CardContent>
        </Card>
    );
};

export default KanbanColumn;
