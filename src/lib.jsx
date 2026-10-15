const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function api(path, { method = "GET", body, token } = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Check that the backend is running on port 8080.");
  }
  if (!res.ok) {
    let msg = `Something went wrong (error ${res.status}). Please try again.`;
    try { const j = await res.json(); if (j.message) msg = j.message; } catch { /* no body */ }
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

export const GROUPS = ["O_NEG", "O_POS", "A_NEG", "A_POS", "B_NEG", "B_POS", "AB_NEG", "AB_POS"];
export const label = (g) => g.replace("_POS", "+").replace("_NEG", "-");
export const HOME = { USER: "/dashboard", HOSPITAL: "/hospital", ADMIN: "/admin" };
export const GAP = 90;

const parts = (g) => ({ abo: g.split("_")[0], pos: g.endsWith("POS") });
export function canGive(donor, patient) {
  const d = parts(donor), p = parts(patient);
  return (d.abo === "O" || p.abo === "AB" || d.abo === p.abo) && (!d.pos || p.pos);
}
export const daysSince = (date) => Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
export const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export function Drop({ size = 24, text }) {
  return (
    <svg className="drop" width={size} viewBox="0 0 60 76" aria-hidden={text ? undefined : true}>
      <path d="M30 2C30 2 6 32 6 50a24 24 0 0 0 48 0C54 32 30 2 30 2Z" />
      {text && <text x="30" y="55" textAnchor="middle">{text}</text>}
    </svg>
  );
}
