
import api from "../../../api/client";

export const getReportSummary = async () =>
  (await api.get("/reports/summary")).data;

export const exportEmployeesCsv = async () => {
  const response = await api.get("/reports/employees.csv", {
    responseType: "blob",
  });

  const blobUrl = URL.createObjectURL(
    new Blob([response.data], { type: "text/csv;charset=utf-8;" })
  );

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = "hrms_employees.csv";
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
};
