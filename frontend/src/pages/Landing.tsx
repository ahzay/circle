// pages/Landing.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Plus, Link2 } from 'lucide-react';
import { useAuth } from '@/hooks/AuthContext';
import { api } from '@/lib/api';
import type { Circle, User } from '../../../shared/types';

export function Landing() {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const { ensureUser, selectUser, hasUser } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [circle, setCircle] = useState<Circle | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  
  // Form states
  const [userName, setUserName] = useState('');
  const [circleName, setCircleName] = useState('');
  const [circleDescription, setCircleDescription] = useState('');

  useEffect(() => {
    if (slug) {
      loadCircleInfo();
    }
  }, [slug]);

  const loadCircleInfo = async () => {
    if (!slug) return;
    
    try {
      setIsLoading(true);
      const [circleData, membersData] = await Promise.all([
        api.getCircle(slug),
        api.getCircleMembers(slug)
      ]);
      
      setCircle(circleData);
      setMembers(membersData);
      setError(null);

      // If user already has an ID, automatically navigate to dashboard
      // The dashboard will handle auto-joining if they're not a member
      if (hasUser()) {
        navigate(`/circle/${circleData.slug}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load circle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCircle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !circleName.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      // Ensure we have a user
      await ensureUser(userName);

      // Create circle
      const newCircle = await api.createCircle({
        name: circleName,
        description: circleDescription || undefined,
      });

      // Navigate to the new circle
      navigate(`/circle/${newCircle.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create circle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinAsNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !circle) return;

    try {
      setIsLoading(true);
      setError(null);

      const user = await ensureUser(userName);
      await api.joinCircle(circle.slug, user.id);
      
      navigate(`/circle/${circle.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join circle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinAsExistingUser = async (userId: string) => {
    if (!circle) return;

    try {
      setIsLoading(true);
      setError(null);

      await selectUser(userId);
      // User is already a member, just navigate
      navigate(`/circle/${circle.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join circle');
    } finally {
      setIsLoading(false);
    }
  };

  const copyInviteLink = () => {
    if (circle) {
      const link = `${window.location.origin}/join/${circle.slug}`;
      navigator.clipboard.writeText(link);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Circle</h1>
          <p className="text-muted-foreground">Share resources with your trusted circle</p>
        </div>

        {error && (
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Joining existing circle */}
        {circle ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Join "{circle.name}"
              </CardTitle>
              {circle.description && (
                <p className="text-sm text-muted-foreground">{circle.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {members.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Are you one of these members?</Label>
                  <div className="mt-2 space-y-2">
                    {members.map((member) => (
                      <Button
                        key={member.id}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleJoinAsExistingUser(member.id)}
                        disabled={isLoading}
                      >
                        {member.name}
                      </Button>
                    ))}
                  </div>
                  <Separator className="my-4" />
                </div>
              )}

              <form onSubmit={handleJoinAsNewUser} className="space-y-4">
                <div>
                  <Label htmlFor="userName">
                    {members.length > 0 ? "I'm a new member:" : "Your name:"}
                  </Label>
                  <Input
                    id="userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  <Users className="mr-2 h-4 w-4" />
                  Join Circle
                </Button>
              </form>

              <Button 
                onClick={copyInviteLink}
                variant="outline" 
                className="w-full"
              >
                <Link2 className="mr-2 h-4 w-4" />
                Copy Invite Link
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Creating new circle */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Circle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCircle} className="space-y-4">
                <div>
                  <Label htmlFor="userName">Your name:</Label>
                  <Input
                    id="userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="circleName">Circle name:</Label>
                  <Input
                    id="circleName"
                    value={circleName}
                    onChange={(e) => setCircleName(e.target.value)}
                    placeholder="e.g., Neighborhood Tools"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="circleDescription">Description (optional):</Label>
                  <Textarea
                    id="circleDescription"
                    value={circleDescription}
                    onChange={(e) => setCircleDescription(e.target.value)}
                    placeholder="What will you share in this circle?"
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Circle
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}