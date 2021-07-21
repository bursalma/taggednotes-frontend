import axios from "axios";

export const http = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL,
  timeout: 10000,
  headers: {
    "content-type": "application/json",
  },
});

const Api = {
  register: (data: any) => http.post("auth/register/", data),
  login: (data: any) => http.post("auth/login/", data),
  logout: () => http.post("auth/logout/"),
  fetchHealth: () => http.get("api/health/"),
  fetchSections: () => http.get("api/section/"),
  fetchTags: (sectionId: number) => http.get(`api/tag/${sectionId}/`),
  fetchNotes: (sectionId: number) => http.get(`api/note/${sectionId}/`),
  postSection: (sectionName: string) =>
    http.post("api/section/", { name: sectionName, rank: 0 }),
  deleteSection: (sectionId: number) => http.delete(`api/section/${sectionId}/`),
  putSection: (sectionId: number, sectionName: string) =>
    http.put(`api/section/${sectionId}/`, { name: sectionName }),
};

export default Api;
