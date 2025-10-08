// src/lib/getUserId.js (client)
export function getUserId() {
  if (typeof window === "undefined") return null;
  let id = localStorage.getItem("userId");
  if (!id) {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      id = crypto.randomUUID();
    } else {
      id = "u_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }
    localStorage.setItem("userId", id);
  }
  return id;
}
