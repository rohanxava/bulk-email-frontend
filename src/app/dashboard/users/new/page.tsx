
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '../../page-header';
import { useToast } from '@/hooks/use-toast';

export default function NewUserPage() {
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState('');
  const { toast } = useToast();

  const handleSendInvitation = () => {
    if (!fullName || !email || !role) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out all fields.',
        variant: 'destructive',
      });
      return;
    }
    // TODO: Implement actual user creation logic
    toast({
      title: 'Invitation Sent',
      description: `An invitation has been sent to ${email}.`,
    });
    // Clear form
    setFullName('');
    setEmail('');
    setRole('');
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
          <div className="space-y-2">
            <Label htmlFor="full-name">Full Name</Label>
            <Input 
              id="full-name" 
              placeholder="e.g., Jane Doe" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
             <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="super-admin">Super Admin</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSendInvitation}>Send Invitation</Button>
        </CardContent>
      </Card>
    </div>
  );
}
