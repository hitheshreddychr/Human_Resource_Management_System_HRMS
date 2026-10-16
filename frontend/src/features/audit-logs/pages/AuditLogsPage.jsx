import FeatureWorkspace from "../../../components/FeatureWorkspace";
export default function AuditLogsPage() {
  return <FeatureWorkspace title="Audit Logs" description="Review recorded HRMS administrative actions." endpoint="/audit-logs/" columns={[{key:"id",label:"ID"},{key:"user_id",label:"User ID"},{key:"action",label:"Action"},{key:"entity_type",label:"Entity"},{key:"entity_id",label:"Entity ID"},{key:"details",label:"Details"},{key:"created_at",label:"Timestamp"}]} />;
}
