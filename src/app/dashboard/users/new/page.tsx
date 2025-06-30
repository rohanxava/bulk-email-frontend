
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '../../page-header';
import { useToast } from '@/hooks/use-toast';
import { sendInvitationEmail } from '@/ai/flows/send-invitation-email';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function NewUserPage() {
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const { toast } = useToast();

  const handleSendInvitation = async () => {
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
      const result = await sendInvitationEmail({
        name: fullName,
        email,
        role,
        password,
      });

      if (result.success) {
        toast({
          title: 'Invitation Sent',
          description: `An invitation with login credentials has been sent to ${email}.`,
        });
        // Clear form on success
        setFullName('');
        setEmail('');
        setRole('');
        setPassword('');
      } else {
        toast({
          title: 'Error Sending Invitation',
          description: result.error || 'An unknown error occurred.',
          variant: 'destructive',
        });
      }
    } catch (error) {
       console.error('Failed to send invitation:', error);
       toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please check the console.',
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
              onChange={(e) => setEmail(e.g.t.value)}
              disabled={isSending}
            />
          </div>
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
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="Super Admin">Super Admin</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSendInvitation} disabled={isSending}>
            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Send Invitation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
