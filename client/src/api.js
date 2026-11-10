import { API_URL } from "./context/AuthContext";

export async function api(path, options) {
  const method = (options && options.method) || "GET";
  const body = options && options.body;
  const token = localStorage.getItem("token");

  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = "Bearer " + token;
  }

  const response = await fetch(API_URL + path, {
    method: method,
    headers: headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message);
  }
  return data;
}
