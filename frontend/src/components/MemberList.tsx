import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Crown } from 'lucide-react';
import type { User as UserType } from '../../../shared/types';

interface MemberListProps {
    members: UserType[];
    currentUserId?: string;
}

export function MemberList({ members, currentUserId }: MemberListProps) {
    // Sort members: current user first, then by join date
    const sortedMembers = [...members].sort((a, b) => {
        if (a.id === currentUserId) return -1;
        if (b.id === currentUserId) return 1;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    const formatLastActive = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return date.toLocaleDateString();
    };

    const getInitials = (name: string): string => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (members.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-4">
                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No members yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {sortedMembers.map((member, index) => (
                <div key={member.id}>
                    <div className="flex items-center space-x-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                            {getInitials(member.name)}
                        </div>

                        {/* Member Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate">
                                    {member.name}
                                </span>
                                {member.id === currentUserId && (
                                    <Badge variant="secondary" className="text-xs">
                                        You
                                    </Badge>
                                )}
                                {index === 0 && member.id !== currentUserId && (
                                    <Crown className="h-3 w-3 text-yellow-500" aria-label="Circle Creator" />
                                )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Active {formatLastActive(member.last_active.toString())}
                            </div>
                        </div>
                    </div>

                    {index < sortedMembers.length - 1 && (
                        <Separator className="mt-3" />
                    )}
                </div>
            ))}
        </div>
    );
}