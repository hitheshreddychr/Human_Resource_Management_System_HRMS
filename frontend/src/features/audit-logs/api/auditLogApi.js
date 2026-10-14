import api from "../../../api/client";

export const getAuditLogs = async () => (await api.get("/audit-logs/")).data;
