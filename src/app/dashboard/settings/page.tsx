'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '../page-header';
import { useUser } from '@/hooks/useUser';
import { updatePassword, updateCurrentUser } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { user, loading } = useUser();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    try {
      await updateCurrentUser({ name });
      toast({ title: 'Profile updated successfully!' });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      await updatePassword(currentPassword, newPassword);
      toast({ title: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      toast({
        title: 'Password update failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account settings and preferences." />
      <div className="space-y-8 max-w-2xl">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled />
            </div>
            <Button onClick={handleProfileUpdate} disabled={loading}>
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Change your password.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button
              onClick={handlePasswordUpdate}
              disabled={loading || !currentPassword || !newPassword}
            >
              Update Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
