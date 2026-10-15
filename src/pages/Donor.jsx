import { useEffect, useState } from "react";
import { useAuth } from "../auth";
import { GROUPS, GAP, label, canGive, daysSince, fmtDate, Drop } from "../lib";

function Ring({ profile }) {
  const days = profile.lastDonationDate ? daysSince(profile.lastDonationDate) : GAP;
  const ready = days >= GAP;
  const r = 54, c = 2 * Math.PI * r;
  return (
    <div className="ring">
      <svg viewBox="0 0 140 140" width="160" role="img" aria-label={ready ? "Ready to donate" : `${GAP - days} days until you can donate`}>
        <circle cx="70" cy="70" r={r} className="track" />
        <circle cx="70" cy="70" r={r} className="fill" strokeDasharray={c}
                strokeDashoffset={c * (1 - Math.min(days / GAP, 1))} transform="rotate(-90 70 70)" />
        <text x="70" y="68" textAnchor="middle" className="big">{ready ? "Ready" : GAP - days}</text>
        <text x="70" y="90" textAnchor="middle" className="small">{ready ? "to donate" : "days to go"}</text>
      </svg>
      <p>{ready ? "You can donate today." : `You can donate again on ${fmtDate(profile.nextEligibleDate)}.`}</p>
    </div>
  );
}

export default function Donor() {
  const { user, call } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reqs, setReqs] = useState([]);
  const [form, setForm] = useState({ name: user.name, bloodGroup: "O_POS", city: "", phone: "", lastDonationDate: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const p = await call("/api/donors/me");
        setProfile(p);
        setForm({ name: p.name, bloodGroup: p.bloodGroup, city: p.city, phone: p.phone || "", lastDonationDate: p.lastDonationDate || "" });
      } catch (e) { if (e.status !== 404) setErr(e.message); }
      try { setReqs(await call("/api/requests")); } catch { /* shown empty */ }
    })();
  }, []); // eslint-disable-line

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function save(e) {
    e.preventDefault();
    setMsg(""); setErr("");
    try {
      const body = { ...form, phone: form.phone || null, lastDonationDate: form.lastDonationDate || null };
      setProfile(await call("/api/donors/me", { method: "PUT", body }));
      setMsg("Profile saved.");
    } catch (ex) { setErr(ex.message); }
  }

  const helpful = profile ? reqs.filter((r) => canGive(profile.bloodGroup, r.patientGroup)) : [];

  return (
    <div>
      <div className="two">
        <div className="card">
          <h2>Your donor profile</h2>
          <form onSubmit={save}>
            <label>Name<input required value={form.name} onChange={set("name")} /></label>
            <div className="grid2">
              <label>Blood group
                <select value={form.bloodGroup} onChange={set("bloodGroup")}>
                  {GROUPS.map((g) => <option key={g} value={g}>{label(g)}</option>)}
                </select>
              </label>
              <label>City<input required value={form.city} onChange={set("city")} /></label>
              <label>Phone<input value={form.phone} onChange={set("phone")} inputMode="tel" /></label>
              <label>Last donation<input type="date" value={form.lastDonationDate} onChange={set("lastDonationDate")} /></label>
            </div>
            {err && <p className="error" role="alert">{err}</p>}
            {msg && <p className="okmsg" role="status">{msg}</p>}
            <button className="btn">Save profile</button>
          </form>
        </div>

        <div className="card center">
          <h2>Your next donation</h2>
          {profile ? <Ring profile={profile} /> : <p className="muted">Save your profile to see when you can donate.</p>}
        </div>
      </div>

      <div className="card">
        <h2>Requests you can help with</h2>
        {!profile && <p className="muted">Save your profile to see matching requests.</p>}
        {profile && !helpful.length && <p className="muted">No open requests match your blood group right now.</p>}
        {helpful.map((r) => (
          <div className="item" key={r.id}>
            <Drop size={38} text={label(r.patientGroup)} />
            <div className="grow"><strong>{r.location}</strong><span className="muted">{r.units} unit(s) · {new Date(r.createdAt).toLocaleString()}</span></div>
            {r.urgent && <span className="tag urgent">Urgent</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
