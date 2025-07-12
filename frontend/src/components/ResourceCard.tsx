// components/ResourceCard.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Clock, 
  MoreVertical, 
  Edit, 
  Trash2, 
  CheckCircle,
  User
} from 'lucide-react';
import { ClaimModal } from '@/components/ClaimModal';
import { api } from '@/lib/api';
import type { Resource, Claim } from '../../../shared/types';

interface ResourceCardProps {
  resource: Resource;
  currentUserId?: string;
  onUpdate: (resource: Resource) => void;
  onDelete: (resourceId: string) => void;
}

export function ResourceCard({ 
  resource, 
  currentUserId, 
  onDelete 
}: ResourceCardProps) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);

  useEffect(() => {
    loadClaims();
  }, [resource.id]);

  const loadClaims = async () => {
    try {
      const claimsData = await api.getResourceClaims(resource.id);
      setClaims(claimsData);
    } catch (err) {
      console.error('Failed to load claims:', err);
    }
  };

  const getCurrentClaim = (): Claim | null => {
    const now = new Date();
    return claims.find(claim => {
      const start = new Date(claim.start_time);
      const end = new Date(claim.end_time);
      return claim.status === 'active' && start <= now && now <= end;
    }) || null;
  };

  const getUserClaims = (): Claim[] => {
    if (!currentUserId) return [];
    return claims.filter(claim => 
      claim.user_id === currentUserId && claim.status === 'active'
    );
  };

  const handleDeleteResource = async () => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      setIsLoading(true);
      await api.deleteResource(resource.id);
      onDelete(resource.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete resource');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnResource = async (claimId: string) => {
    try {
      setIsLoading(true);
      await api.returnClaim(claimId);
      await loadClaims(); // Reload to see updated status
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to return resource');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimCreated = () => {
    setShowClaimModal(false);
    loadClaims(); // Reload claims to see the new one
  };

  const currentClaim = getCurrentClaim();
  const userClaims = getUserClaims();
  const isOwnResource = resource.created_by === currentUserId;
  const canClaim = !currentClaim && currentUserId;

  return (
    <Card className={currentClaim ? 'border-orange-200 bg-orange-50/50' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{resource.name}</CardTitle>
            {resource.category && (
              <Badge variant="outline" className="mt-1">
                {resource.category}
              </Badge>
            )}
          </div>
          
          {isOwnResource && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDeleteResource}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {resource.description && (
          <p className="text-sm text-muted-foreground">{resource.description}</p>
        )}

        {error && (
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Current claim status */}
        {currentClaim ? (
          <div className="p-3 rounded-lg bg-orange-100 border border-orange-200">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-orange-600" />
              <span className="font-medium">Currently claimed</span>
            </div>
            <div className="mt-1 text-xs text-orange-700 space-y-1">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Until {new Date(currentClaim.end_time).toLocaleString()}
              </div>
              {currentClaim.notes && (
                <div className="italic">"{currentClaim.notes}"</div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Available</span>
            </div>
          </div>
        )}

        {/* User's active claims */}
        {userClaims.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Your claims:</div>
            {userClaims.map((claim) => (
              <div 
                key={claim.id} 
                className="p-2 rounded bg-blue-50 border border-blue-200"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(claim.start_time).toLocaleDateString()} - {new Date(claim.end_time).toLocaleDateString()}
                    </div>
                    {claim.is_recurring && (
                      <div className="text-xs text-blue-600 mt-1">
                        Recurring {claim.recurring_pattern}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReturnResource(claim.id)}
                    disabled={isLoading}
                  >
                    Return
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          {canClaim && (
            <Button 
              onClick={() => setShowClaimModal(true)}
              disabled={isLoading}
              className="flex-1"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Claim Resource
            </Button>
          )}
          
          {currentClaim && currentClaim.user_id === currentUserId && (
            <Button
              variant="outline"
              onClick={() => handleReturnResource(currentClaim.id)}
              disabled={isLoading}
              className="flex-1"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Return Early
            </Button>
          )}
        </div>

        {/* Claim Modal */}
        {showClaimModal && (
          <ClaimModal
            resource={resource}
            existingClaims={claims}
            isOpen={showClaimModal}
            onClose={() => setShowClaimModal(false)}
            onSuccess={handleClaimCreated}
          />
        )}
      </CardContent>
    </Card>
  );
}