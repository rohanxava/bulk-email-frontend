
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface EditUserClientProps {
  user: User;
  currentUserRole: User['role'];
}

export function EditUserClient({ user, currentUserRole }: EditUserClientProps) {
  const [fullName, setFullName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [role, setRole] = React.useState(user.role);
  const [status, setStatus] = React.useState(user.status);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);
  const { toast } = useToast();

  const handleUpdateUser = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, you would send this data to your backend API
    console.log({
      id: user.id,
      fullName,
      email,
      role,
      status
    });

    setIsSaving(false);
    toast({
      title: 'User Updated',
      description: `${fullName}'s details have been saved.`,
    });
  };
  
  const handleResetPassword = async () => {
    setIsResetting(true);
    // In a real app, you'd trigger a password reset flow (e.g., via email)
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsResetting(false);
     toast({
      title: 'Password Reset Sent',
      description: `A password reset link has been sent to ${email}.`,
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>
            Update the user's information and role.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input 
                id="full-name" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSaving}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={(value) => setRole(value as User['role'])} disabled={isSaving}>
                      <SelectTrigger id="role">
                          <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="User">User</SelectItem>
                          <SelectItem value="Super Admin">Super Admin</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(value) => setStatus(value as User['status'])} disabled={isSaving}>
                      <SelectTrigger id="status">
                          <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Disabled">Disabled</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
          </div>
          <Button onClick={handleUpdateUser} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {currentUserRole === 'Super Admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Manage the user's password.
            </CardDescription>
          </CardHeader>
          <CardContent>
              <Button variant="outline" onClick={handleResetPassword} disabled={isResetting}>
                  {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Password Reset Email
              </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
