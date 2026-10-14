import api from "../../../api/client";

export const getEmployees = async () => (await api.get("/employees/")).data;
export const getEmployee = async (id) => (await api.get(`/employees/${id}`)).data;
export const createEmployee = async (data) => (await api.post("/employees/", data)).data;
export const updateEmployee = async (id, data) => (await api.patch(`/employees/${id}`, data)).data;
export const deactivateEmployee = async (id) => (await api.patch(`/employees/${id}/deactivate`)).data;
