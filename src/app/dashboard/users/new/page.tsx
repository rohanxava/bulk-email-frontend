'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '../../page-header';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { register as registerUser } from '@/services/user';
import { useUser } from '@/hooks/useUser'; // ✅ Correctly import the useUser hook

export default function NewUserPage() {
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [canCreateProject, setCanCreateProject] = React.useState(true);
  const { toast } = useToast();

  const { user, loading } = useUser(); // ✅ Use the user hook to get current logged-in user
  const adminId = user?._id;

  const handleSendInvitation = async () => {
    if (!adminId) {
      toast({
        title: 'Not authorized',
        description: 'You must be logged in to create users.',
        variant: 'destructive',
      });
      return;
    }

    if (!fullName || !email || !role || !password) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out all fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      const res = await registerUser({
        name: fullName,
        email,
        role,
        password,
        createdBy: adminId,
        canCreateProject, // ✅ Include this in your backend
      });

      toast({
        title: 'User Created',
        description: res.message || `An account for ${email} has been created successfully.`,
      });

      setFullName('');
      setEmail('');
      setRole('');
      setPassword('');
    } catch (error: any) {
      toast({
        title: 'Error Creating User',
        description: error?.response?.data?.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Invite New User"
        description="Add a new user to your team and assign them a role."
      />
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            Enter the user's details below to send an invitation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                placeholder="e.g., Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isSending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSending}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSending}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  disabled={isSending}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole} disabled={isSending}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Project Access</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="canCreateProject"
                    value="true"
                    checked={canCreateProject === true}
                    onChange={() => setCanCreateProject(true)}
                    disabled={isSending}
                  />
                  <span className="text-sm font-medium">User can create project</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="canCreateProject"
                    value="false"
                    checked={canCreateProject === false}
                    onChange={() => setCanCreateProject(false)}
                    disabled={isSending}
                  />
                  <span className="text-sm font-medium">User cannot create project</span>
                </label>
              </div>
            </div>


          </div>


          <Button onClick={handleSendInvitation} disabled={isSending} className="w-full sm:w-auto">
            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Send Invitation
          </Button>


        </CardContent>
      </Card>
    </div>
  );
}
