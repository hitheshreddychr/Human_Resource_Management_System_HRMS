import FeatureWorkspace from "../../../components/FeatureWorkspace";
export default function NotificationsPage() {
  return <FeatureWorkspace title="Notifications" description="View your HRMS notifications." endpoint="/notifications/" columns={[{key:"id",label:"ID"},{key:"title",label:"Title"},{key:"message",label:"Message"},{key:"notification_type",label:"Type"},{key:"is_read",label:"Read"},{key:"created_at",label:"Created At"}]} />;
}
