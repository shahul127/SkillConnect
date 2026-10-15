import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/auth",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function registerUser(userData) {
  const response = await API.post("/register", userData);
  return response.data;
}

export async function loginUser(loginData) {
  const response = await API.post("/login", loginData);
  return response.data;
}