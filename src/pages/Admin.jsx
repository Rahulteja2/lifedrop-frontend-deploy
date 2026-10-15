import { useEffect, useState } from "react";
import { useAuth } from "../auth";
import { label } from "../lib";

export default function Admin() {
  const { call } = useAuth();
  const [users, setUsers] = useState([]);
  const [reqs, setReqs] = useState([]);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setUsers(await call("/api/admin/users"));
      setReqs(await call("/api/requests"));
    } catch (e) { setErr(e.message); }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line

  async function remove(u) {
    if (!window.confirm(`Delete ${u.name} (${u.email})?`)) return;
    try { await call(`/api/admin/users/${u.id}`, { method: "DELETE" }); load(); }
    catch (e) { setErr(e.message); }
  }

  const count = (r) => users.filter((u) => u.role === r).length;

  return (
    <section className="wrap">
      <h1 className="h-md">Admin</h1>
      <div className="stats">
        <div className="card"><b>{count("USER")}</b><span>Users</span></div>
        <div className="card"><b>{count("HOSPITAL")}</b><span>Hospitals</span></div>
        <div className="card"><b>{reqs.length}</b><span>Open requests</span></div>
      </div>
      {err && <p className="error" role="alert">{err}</p>}

      <div className="card scroll">
        <h2>Users</h2>
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
                <td>{u.role !== "ADMIN" && <button className="link danger" onClick={() => remove(u)}>Delete</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Open blood requests</h2>
        {!reqs.length && <p className="muted">No open requests.</p>}
        {reqs.map((r) => (
          <div className="item" key={r.id}>
            <strong className="grow">{label(r.patientGroup)} · {r.units} unit(s) · {r.location}</strong>
            {r.urgent && <span className="tag urgent">Urgent</span>}
          </div>
        ))}
      </div>
    </section>
  );
}
