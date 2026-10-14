import api from "../../../api/client";

export const checkIn = async () => (await api.post("/attendance/check-in")).data;
export const checkOut = async () => (await api.post("/attendance/check-out")).data;
export const getMyAttendance = async () => (await api.get("/attendance/my-history")).data;
export const getAllAttendance = async () => (await api.get("/attendance/")).data;
