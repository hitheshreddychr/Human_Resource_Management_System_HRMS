
import api from "../../../api/client";

export const getSalarySlips = async () =>
  (await api.get("/salary-slips/")).data;

export const generateSalarySlip = async (payrollId) =>
  (await api.post(`/salary-slips/generate/${payrollId}`)).data;

export const downloadSalarySlip = async (id) => {
  const response = await api.get(`/salary-slips/${id}/download`, {
    responseType: "blob",
  });

  const blobUrl = URL.createObjectURL(
    new Blob([response.data], { type: "application/pdf" })
  );

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = `salary_slip_${id}.pdf`;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
};
