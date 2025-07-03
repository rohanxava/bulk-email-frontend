import { PageHeader } from '../../../page-header';
import { EditUserClient } from './edit-user-client';

export default function EditUserPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Edit User"
        description="Update user details and permissions."
      />
      <EditUserClient userId={params.id} />
    </div>
  );
}
