import api from "../../../api/client";

export const getPayroll = async () => (await api.get("/payroll/")).data;
export const generatePayroll = async (data) => (await api.post("/payroll/", data)).data;
