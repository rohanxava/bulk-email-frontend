// // src/app/dashboard/campaigns/[id]/edit/page.tsx
// import { PageHeader } from '../../../page-header';
// import { NewCampaignClient } from "../../new/new-campaign-client";

// export default function EditCampaignPage({ params }: { params: { id: string } }) {
//   return (
//     <div className="max-w-4xl mx-auto">
//       <PageHeader
//         title="Edit Campaign"
//         description="Modify your campaign details and content."
//       />
//       <NewCampaignClient campaignId={params.id} />
//     </div>
//   );
// }
import { PageHeader } from '../../../page-header';
import { NewCampaignClient } from "../../new/new-campaign-client";

export default function EditCampaignPage({ params }: { params: { id: string } }) {
  console.log("Received campaignId from URL:", params.id);

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Edit Campaign"
        description="Modify your campaign details and content."
      />
      <NewCampaignClient campaignId={params.id} />
    </div>
  );
}
