import axios from "axios";

const http = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL,
  timeout: 5000,
  headers: {
    "content-type": "application/json",
    //   'app-id': 'GET-THE-SECRET-KEY'
  },
});

const Api = {
  fetchHealth: () => http.get("health"),
  fetchSections: () => http.get("section"),
  fetchTags: (sectionId: number) => http.get(`tag/${sectionId}`),
  fetchNotes: (sectionId: number) => http.get(`note/${sectionId}`),
  postSection: (name: string) => http.post("section/", {name: name, rank: 1})
};

export default Api;
