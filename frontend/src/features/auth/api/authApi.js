import api from "../../../api/client";

export const loginUser = async (email, password) => {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);

  const response = await api.post("/auth/login", form, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post("/auth/users", userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};
