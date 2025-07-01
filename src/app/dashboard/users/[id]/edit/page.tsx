
import { getUserById, getUsers } from '@/services/api';
import { PageHeader } from '../../../page-header';
import { EditUserClient } from './edit-user-client';
import { notFound } from 'next/navigation';

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const user = await getUserById(params.id);

  if (!user) {
    notFound();
  }

  // Simulate getting the current logged-in user.
  // In a real app, this would come from an authentication context.
  // For this mock, we'll take the first user, who is the Super Admin.
  const allUsers = await getUsers();
  const currentUser = allUsers[0]; 

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Edit User"
        description="Update user details and permissions."
      />
      <EditUserClient user={user} currentUserRole={currentUser.role} />
    </div>
  );
}
