import api from "../../../api/client";

export const getAdminSummary = async () => (await api.get("/reports/summary")).data;
