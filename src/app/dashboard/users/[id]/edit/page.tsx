
import { getUserById } from '@/services/api';
import { PageHeader } from '../../../page-header';
import { EditUserClient } from './edit-user-client';
import { notFound } from 'next/navigation';

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const user = await getUserById(params.id);

  if (!user) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Edit User"
        description="Update user details and permissions."
      />
      <EditUserClient user={user} />
    </div>
  );
}
