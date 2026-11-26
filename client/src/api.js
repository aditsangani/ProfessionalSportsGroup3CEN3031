import { API_URL } from "./context/AuthContext";

export async function api(path, options) {
  const settings = options || {};
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = "Bearer " + token;
  }

  const request = {
    method: settings.method || "GET",
    headers: headers,
  };

  if (settings.body !== undefined) {
    request.body = JSON.stringify(settings.body);
  }

  let response;

  try {
    response = await fetch(API_URL + path, request);
  } catch (err) {
    throw new Error("Cannot connect to the server. Make sure the backend is running.");
  }

  let data = null;

  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    let message = "Request failed (" + response.status + ")";

    if (data && data.message) {
      message = data.message;
    }

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}
