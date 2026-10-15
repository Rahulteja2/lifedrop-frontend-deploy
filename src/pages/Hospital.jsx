import { useState } from "react";
import { useAuth } from "../auth";
import { GROUPS, label, fmtDate, Drop } from "../lib";

export function Find() {
  const { call } = useAuth();
  const [q, setQ] = useState({ group: "A_POS", city: "", eligibleOnly: false });
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");

  async function search(e) {
    e.preventDefault();
    setErr("");
    try {
      const url = `/api/donors/search?group=${q.group}&city=${encodeURIComponent(q.city)}&eligibleOnly=${q.eligibleOnly}`;
      setRows(await call(url));
    } catch (ex) { setErr(ex.message); }
  }

  return (
    <>
      <form className="card bar" onSubmit={search}>
        <label>Patient blood group
          <select value={q.group} onChange={(e) => setQ({ ...q, group: e.target.value })}>
            {GROUPS.map((g) => <option key={g} value={g}>{label(g)}</option>)}
          </select>
        </label>
        <label>City<input value={q.city} placeholder="Any city" onChange={(e) => setQ({ ...q, city: e.target.value })} /></label>
        <label className="check"><input type="checkbox" checked={q.eligibleOnly} onChange={(e) => setQ({ ...q, eligibleOnly: e.target.checked })} /> Eligible today only</label>
        <button className="btn">Find donors</button>
      </form>
      {err && <p className="error" role="alert">{err}</p>}
      {rows && (
        <div className="card">
          <h2>{rows.length} donor(s) can give to {label(q.group)}</h2>
          {!rows.length && <p className="muted">No donors found. Try another city or remove the filters.</p>}
          {rows.map((d) => (
            <div className="item" key={d.id}>
              <Drop size={42} text={label(d.bloodGroup)} />
              <div className="grow">
                <strong>{d.name}</strong>
                <span className="muted">{d.city}{d.phone && <> · <a href={`tel:${d.phone}`}>{d.phone}</a></>}</span>
              </div>
              <span className={"tag " + (d.eligible ? "ok" : "wait")}>
                {d.eligible ? "Eligible today" : `Eligible ${fmtDate(d.nextEligibleDate)}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export function Request() {
  const { call } = useAuth();
  const [f, setF] = useState({ patientGroup: "A_POS", location: "", units: 1, urgent: false });
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");

  async function send(e) {
    e.preventDefault();
    setErr(""); setRes(null);
    try { setRes(await call("/api/requests", { method: "POST", body: { ...f, units: Number(f.units) } })); }
    catch (ex) { setErr(ex.message); }
  }

  return (
    <>
      <form className="card bar" onSubmit={send}>
        <label>Patient blood group
          <select value={f.patientGroup} onChange={(e) => setF({ ...f, patientGroup: e.target.value })}>
            {GROUPS.map((g) => <option key={g} value={g}>{label(g)}</option>)}
          </select>
        </label>
        <label>City<input required value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></label>
        <label>Units<input type="number" min="1" max="10" value={f.units} onChange={(e) => setF({ ...f, units: e.target.value })} /></label>
        <label className="check"><input type="checkbox" checked={f.urgent} onChange={(e) => setF({ ...f, urgent: e.target.checked })} /> Urgent</label>
        <button className="btn">Raise request</button>
      </form>
      {err && <p className="error" role="alert">{err}</p>}
      {res && (
        <div className="card">
          <h2>Request raised</h2>
          <p><strong>{res.eligibleDonorsInCity}</strong> eligible donor(s) in {res.request.location} and <strong>{res.eligibleDonorsTotal}</strong> in total can give {label(res.request.patientGroup)} blood.</p>
          <p className="muted">Use "Find donors" to see their contact details.</p>
        </div>
      )}
    </>
  );
}

export default function Hospital() {
  const { user } = useAuth();
  const [tab, setTab] = useState("find");
  return (
    <section className="wrap">
      <h1 className="h-md">{user.name}</h1>
      <div className="tabs" role="group" aria-label="Sections">
        <button aria-pressed={tab === "find"} onClick={() => setTab("find")}>Find donors</button>
        <button aria-pressed={tab === "req"} onClick={() => setTab("req")}>Raise a request</button>
      </div>
      {tab === "find" ? <Find /> : <Request />}
    </section>
  );
}
