import api from "../../../api/client";

export const getLeaves = async () => (await api.get("/leaves/")).data;
export const getMyLeaves = async () => (await api.get("/leaves/my-requests")).data;
export const applyForLeave = async (data) => (await api.post("/leaves/", data)).data;
export const reviewLeave = async (id, data) => (await api.patch(`/leaves/${id}/review`, data)).data;
