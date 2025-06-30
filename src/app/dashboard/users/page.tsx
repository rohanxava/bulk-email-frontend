import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageHeader } from '../page-header';

const users = [
  { name: 'Sanchit Kakkar', email: 'sanchit@xava.com', role: 'Super Admin', status: 'Active' },
  { name: 'Jane Doe', email: 'jane@agencyone.com', role: 'User', status: 'Active' },
  { name: 'John Smith', email: 'john@agencytwo.com', role: 'User', status: 'Disabled' },
  { name: 'Emily White', email: 'emily@agencyone.com', role: 'User', status: 'Active' },
];

const roleVariant = {
  'Super Admin': 'default',
  'User': 'secondary',
};

const statusVariant = {
  'Active': 'accent',
  'Disabled': 'destructive',
};


export default function UsersPage() {
  return (
    <div>
      <PageHeader
        title="User Management"
        description="Manage platform users and their roles (Super Admin view)."
      >
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New User
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>A list of all users on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                         <AvatarImage src={`https://placehold.co/40x40.png?text=${user.name.charAt(0)}`} data-ai-hint="user avatar" />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleVariant[user.role as keyof typeof roleVariant] || 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge style={{ backgroundColor: `hsl(var(--${user.status === 'Active' ? 'accent' : 'destructive'}))` }} className="text-white">
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
