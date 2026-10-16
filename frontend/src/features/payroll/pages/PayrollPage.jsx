import FeatureWorkspace from "../../../components/FeatureWorkspace";
export default function PayrollPage() {
  return <FeatureWorkspace title="Payroll" description="Review payroll records and salary processing." endpoint="/payroll/" columns={[{key:"id",label:"Payroll ID"},{key:"employee_id",label:"Employee ID"},{key:"month",label:"Month"},{key:"year",label:"Year"},{key:"basic_salary",label:"Basic Salary"},{key:"gross_salary",label:"Gross Salary"},{key:"net_salary",label:"Net Salary"},{key:"status",label:"Status"}]} />;
}
