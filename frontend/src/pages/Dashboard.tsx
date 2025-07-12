// pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Users, Link2,  } from 'lucide-react';
import { useAuth } from '@/hooks/AuthContext';
import { api } from '@/lib/api';
import { ResourceCard } from '@/components/ResourceCard';
import { ResourceForm } from '@/components/ResourceForm';
import { MemberList } from '@/components/MemberList';
import type { Circle, User, Resource, CircleEvent } from '../../../shared/types';

export function Dashboard() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [circle, setCircle] = useState<Circle | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddResource, setShowAddResource] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    if (slug) {
      loadDashboardData();
      setupRealtimeUpdates();
    }
  }, [slug, user]);

  const loadDashboardData = async () => {
    if (!slug || !user) return;

    try {
      setIsLoading(true);
      setError(null);

      const [circleData, membersData, resourcesData] = await Promise.all([
        api.getCircle(slug),
        api.getCircleMembers(slug),
        api.getCircleResources(slug)
      ]);

      setCircle(circleData);
      setMembers(membersData);
      setResources(resourcesData);

      // Check if current user is a member of the circle
      const isUserMember = membersData.some(member => member.id === user.id);
      
      // If user has an ID but is not a member, automatically add them
      if (!isUserMember) {
        try {
          await api.joinCircle(slug, user.id);
          // Reload members after joining
          const updatedMembers = await api.getCircleMembers(slug);
          setMembers(updatedMembers);
        } catch (joinErr) {
          console.error('Failed to auto-join circle:', joinErr);
          // Don't throw here - let user continue viewing the circle
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load circle data');
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeUpdates = () => {
    if (!slug) return;

    const eventSource = api.createEventSource(slug);
    
    eventSource.onmessage = (event) => {
      try {
        const circleEvent: CircleEvent = JSON.parse(event.data);
        handleRealtimeEvent(circleEvent);
      } catch (err) {
        console.error('Failed to parse SSE event:', err);
      }
    };

    eventSource.onerror = (error) => {
      // Only log actual errors, not normal disconnections
      if (eventSource.readyState === EventSource.CONNECTING) {
        console.error('SSE connection error:', error);
      }
    };

    return () => {
      eventSource.close();
    };
  };

  const handleRealtimeEvent = (event: CircleEvent) => {
    switch (event.type) {
      case 'resource_created':
      case 'resource_updated':
      case 'resource_deleted':
        // Reload resources
        if (slug) {
          api.getCircleResources(slug).then(setResources).catch(console.error);
        }
        break;
      case 'user_joined':
        // Reload members
        if (slug) {
          api.getCircleMembers(slug).then(setMembers).catch(console.error);
        }
        break;
      case 'claim_created':
      case 'claim_returned':
      case 'claim_updated':
        // Reload resources to get updated claim status
        if (slug) {
          api.getCircleResources(slug).then(setResources).catch(console.error);
        }
        break;
    }
  };

  const handleResourceCreated = (newResource: Resource) => {
    setResources(prev => [newResource, ...prev]);
    setShowAddResource(false);
  };

  const handleResourceUpdated = (updatedResource: Resource) => {
    setResources(prev => prev.map(r => 
      r.id === updatedResource.id ? updatedResource : r
    ));
  };

  const handleResourceDeleted = (resourceId: string) => {
    setResources(prev => prev.filter(r => r.id !== resourceId));
  };

  const copyInviteLink = () => {
    if (circle) {
      const link = `${window.location.origin}/join/${circle.slug}`;
      navigator.clipboard.writeText(link);
      // Could add toast notification here
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto p-4">
          <div className="text-center py-8">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !circle) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto p-4">
          <Alert>
            <AlertDescription>
              {error || 'Circle not found'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{circle.name}</h1>
            {circle.description && (
              <p className="text-muted-foreground mt-1">{circle.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {members.length} members
            </Badge>
            <Button variant="outline" size="sm" onClick={copyInviteLink}>
              <Link2 className="h-4 w-4 mr-1" />
              Invite
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Resources section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Resources</h2>
                <Button onClick={() => setShowAddResource(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Resource
                </Button>
              </div>

              {showAddResource && (
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle>Add New Resource</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResourceForm
                      circleSlug={circle.slug}
                      onSuccess={handleResourceCreated}
                      onCancel={() => setShowAddResource(false)}
                    />
                  </CardContent>
                </Card>
              )}

              {resources.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    <div className="space-y-2">
                      <p>No resources shared yet.</p>
                      <p className="text-sm">Add the first resource to get started!</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      currentUserId={user?.id}
                      onUpdate={handleResourceUpdated}
                      onDelete={handleResourceDeleted}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MemberList members={members} currentUserId={user?.id} />
              </CardContent>
            </Card>

            {/* Circle info */}
            <Card>
              <CardHeader>
                <CardTitle>Circle Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {new Date(circle.created_at).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Resources:</span>{' '}
                  {resources.length}
                </div>
                <div>
                  <span className="font-medium">Members:</span>{' '}
                  {members.length}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}