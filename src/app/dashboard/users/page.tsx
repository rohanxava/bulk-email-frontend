'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageHeader } from '../page-header';
import { getUsers, deleteUser, getCurrentUser, pingUser } from '@/services/api';
import { formatDistanceToNow } from 'date-fns';


const roleVariant = {
  'super_admin': 'default',
  'user': 'secondary',
} as const;

export default function UsersPage() {
  const [users, setUsers] = React.useState([]);
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [confirmDeleteUserId, setConfirmDeleteUserId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadAll = async () => {
    try {
      const [fetchedUsers, fetchedCurrentUser] = await Promise.all([
        getUsers(),
        getCurrentUser()
      ]);

      setCurrentUser(fetchedCurrentUser);

      const filteredUsers = fetchedUsers.filter(
        (user: any) => user.createdBy === fetchedCurrentUser._id
      );

      setUsers(filteredUsers);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      setUsers(users.filter((user: any) => user._id !== id));
      setConfirmDeleteUserId(null);
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    const sendPing = async () => {
      await pingUser(); // Use service here
    };

    sendPing(); // Immediate ping

    const interval = setInterval(sendPing, 10000); // Every 10 sec

    window.addEventListener('mousemove', sendPing);
    window.addEventListener('click', sendPing);
    window.addEventListener('keydown', sendPing);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', sendPing);
      window.removeEventListener('click', sendPing);
      window.removeEventListener('keydown', sendPing);
    };
  }, []);


  return (
    <div>
      <PageHeader title="User Management" description="Manage users (Super Admin only)">
        <Button asChild>
          <Link href="/dashboard/users/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New User
          </Link>
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>All users created by you.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5}>Loading...</TableCell>
                </TableRow>
              ) : users.length > 0 ? (
                users.map((user: any) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://placehold.co/40x40.png?text=${user.name?.charAt(0)}`} />
                          <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleVariant[user.role] || 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {Date.now() - new Date(user.lastActive).getTime() < 30000 ? (
                        <Badge className="bg-green-500 text-white">Active Now</Badge>
                      ) : (
                        <Badge className="bg-yellow-400 text-black">Inactive</Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      {formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="flex gap-2 items-center">
                      {confirmDeleteUserId === user._id ? (
                        <>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(user._id)}>
                            Confirm
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setConfirmDeleteUserId(null)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/users/${user._id}/edit`}>Edit</Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setConfirmDeleteUserId(user._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
