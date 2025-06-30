
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '../../page-header';

export default function NewUserPage() {
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
            <Input id="full-name" placeholder="e.g., Jane Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="e.g., jane@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
             <Select>
                <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="super-admin">Super Admin</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <Button>Send Invitation</Button>
        </CardContent>
      </Card>
    </div>
  );
}
