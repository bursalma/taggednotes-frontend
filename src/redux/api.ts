import axios from "axios";

export const http = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL,
  timeout: 20000,
  headers: {
    "content-type": "application/json",
  },
});

const Api = {
  register: (data: any) => http.post("auth/register/", data),
  login: (data: any) => http.post("auth/login/", data),
  logout: () => http.post("auth/logout/"),
  verify: (token: string) => http.post("auth/token/verify/", { token: token }),
  refresh: (refresh: string) =>
    http.post("auth/token/refresh/", { refresh: refresh }),
  fetchUser: () => http.get("auth/user/"),
  fetchHealth: () => http.get("api/health/"),
  fetchSections: () => http.get("api/section/"),
  fetchTags: (sectionId: number) => http.get(`api/tag/${sectionId}/`),
  fetchNotes: (sectionId: number) => http.get(`api/note/${sectionId}/`),
  postSection: (data: any) => http.post("api/section/", data),
  deleteSection: (id: number) => http.delete(`api/section/${id}/`),
  putSection: (data: any) => http.put(`api/section/${data.id}/`, data),
};

export default Api;
