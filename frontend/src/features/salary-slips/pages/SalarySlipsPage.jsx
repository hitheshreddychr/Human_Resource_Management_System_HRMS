import FeatureWorkspace from "../../../components/FeatureWorkspace";
export default function SalarySlipsPage() {
  return <FeatureWorkspace title="Salary Slips" description="View generated salary slip records." endpoint="/salary-slips/" columns={[{key:"id",label:"Slip ID"},{key:"employee_id",label:"Employee ID"},{key:"payroll_id",label:"Payroll ID"},{key:"file_name",label:"File"},{key:"created_at",label:"Created At"}]} />;
}
