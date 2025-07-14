import axios from "axios";

const API_URL = "https://real-time-collaborative-to-do-board-qzkn.onrender.com";

export const api = axios.create({
  baseURL: API_URL + "/api",
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}
