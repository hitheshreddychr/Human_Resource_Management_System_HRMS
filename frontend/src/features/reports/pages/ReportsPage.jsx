import FeatureWorkspace from "../../../components/FeatureWorkspace";
export default function ReportsPage() {
  return <FeatureWorkspace title="Reports" description="Review employee reporting data." endpoint="/employees/" columns={[{key:"id",label:"ID"},{key:"employee_code",label:"Employee Code"},{key:"first_name",label:"First Name"},{key:"last_name",label:"Last Name"},{key:"department",label:"Department"},{key:"designation",label:"Designation"},{key:"joining_date",label:"Joining Date"}]} />;
}
