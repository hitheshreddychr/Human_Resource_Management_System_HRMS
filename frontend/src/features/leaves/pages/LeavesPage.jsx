import FeatureWorkspace from "../../../components/FeatureWorkspace";
export default function LeavesPage() {
  return <FeatureWorkspace title="Leave Management" description="Review leave requests and track leave status." endpoint="/leaves/" columns={[{key:"id",label:"Request ID"},{key:"employee_id",label:"Employee ID"},{key:"leave_type",label:"Leave Type"},{key:"start_date",label:"Start Date"},{key:"end_date",label:"End Date"},{key:"total_days",label:"Days"},{key:"status",label:"Status"},{key:"reason",label:"Reason"}]} />;
}
