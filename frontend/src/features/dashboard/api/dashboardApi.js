import api from "../../../api/client";

export const getDashboardSummary = async () => {
  const response = await api.get("/reports/summary");
  return response.data;
};
