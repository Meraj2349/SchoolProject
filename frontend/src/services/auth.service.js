import httpClient from "@/lib/httpClient";
import Cookies from "js-cookie";

export const authService = {
  login: async (credentials) => {
    const { data } = await httpClient.post("/admin/login", credentials);
    if (data.token) {
      Cookies.set("token", data.token, { expires: 7 });
    }
    return data;
  },

  logout: async () => {
    try {
      await httpClient.post("/admin/logout");
    } finally {
      Cookies.remove("token");
    }
  },

  register: async (credentials) => {
    const { data } = await httpClient.post("/admin/createAdmin", credentials);
    return data;
  },

  updateEmailPassword: async (data) =>
    httpClient.put("/admin/updateEmailPassword", data).then((r) => r.data),
};
