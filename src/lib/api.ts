import * as axios from "axios";

const api = axios.create({
  baseURL: "https://horse-racing-api.patohru.qzz.io/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
