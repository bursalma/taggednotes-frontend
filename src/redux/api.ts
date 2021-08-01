import axios from "axios";

export const http = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL,
  timeout: 20000,
  headers: { "content-type": "application/json" },
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
  postSection: (data: any) => http.post("api/section/", data),
  deleteSection: (id: number) => http.delete(`api/section/${id}/`),
  putSection: (data: any) => http.put(`api/section/${data.id}/`, data),
  fetchNotes: (sectionId: number) => http.get(`api/note/${sectionId}/`),
  postNote: (data: any) => http.post("api/note/all", data),
  deleteNote: (id: number) => http.delete(`api/note/all/${id}/`),
  putNote: (data: any) => http.put(`api/note/all/${data.id}/`, data),
  fetchTags: (sectionId: number) => http.get(`api/tag/${sectionId}/`),
  postTag: (data: any) => http.post("api/tag/all", data),
  deleteTag: (id: number) => http.delete(`api/tag/all/${id}/`),
  putTag: (data: any) => http.put(`api/tag/all/${data.id}/`, data),
};

export default Api;
