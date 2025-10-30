import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, GitBranch, Clock } from 'lucide-react';
import { format } from 'date-fns';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { GitHubIssue } from '@/lib/api';

interface GitHubIssueCardProps {
  issue: GitHubIssue;
  isDragging?: boolean;
}

const GitHubIssueCard: React.FC<GitHubIssueCardProps> = ({ issue, isDragging = false }) => {
  const getStateColor = (state: string) => {
    switch (state) {
      case 'open':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLabelColor = (color: string) => {
    // Convert GitHub hex color to Tailwind-compatible style
    return {
      backgroundColor: `#${color}`,
      color: isLightColor(color) ? '#000000' : '#FFFFFF',
    };
  };

  const isLightColor = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <Card
        className={cn(
          'transition-all duration-200 hover:shadow-md relative',
          isDragging && 'opacity-50 shadow-lg scale-105',
          'border-l-4 border-l-blue-500' // GitHub blue accent
        )}
      >
        <CardContent className="p-4">
          {/* GitHub Badge */}
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <GitBranch className="h-3 w-3 mr-1" />
              GitHub
            </Badge>
          </div>

          <div className="space-y-3 pr-20">
            {/* Issue Number & Title */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-muted-foreground">
                  #{issue.number}
                </span>
                <Badge
                  variant="outline"
                  className={cn('text-xs', getStateColor(issue.state))}
                >
                  {issue.state}
                </Badge>
              </div>
              <a
                href={issue.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-sm leading-tight line-clamp-2 hover:text-primary transition-colors flex items-start gap-1"
              >
                {issue.title}
                <ExternalLink className="h-3 w-3 flex-shrink-0 mt-0.5 opacity-50" />
              </a>
            </div>

            {/* Issue Body */}
            {issue.body && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {issue.body}
              </p>
            )}

            {/* Labels */}
            {issue.labels && issue.labels.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {issue.labels.slice(0, 3).map((label, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs px-2 py-0"
                    style={getLabelColor(label.color)}
                  >
                    {label.name}
                  </Badge>
                ))}
                {issue.labels.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-0">
                    +{issue.labels.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Footer with Assignee and Created Date */}
            <div className="flex items-center justify-between pt-2 border-t">
              {/* Assignee */}
              {issue.assignee && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={issue.assignee.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {issue.assignee.login.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {issue.assignee.login}
                  </span>
                </div>
              )}

              {/* Created Date */}
              {issue.created_at && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                  <Clock className="h-3 w-3" />
                  <span>{format(new Date(issue.created_at), 'MMM d')}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GitHubIssueCard;

