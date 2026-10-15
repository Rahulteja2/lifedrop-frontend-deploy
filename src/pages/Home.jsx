import { useState } from "react";
import { Link } from "react-router-dom";
import { GROUPS, label, canGive, Drop } from "../lib";

export default function Home() {
  const [patient, setPatient] = useState("A_POS");
  const givers = GROUPS.filter((g) => canGive(g, patient));

  return (
    <>
      <section className="hero wrap">
        <div>
          <h1>Every drop has a destination.</h1>
          <p className="lede">
            LifeDrop connects hospitals with blood donors nearby who are compatible,
            healthy and ready to give today.
          </p>
          <div className="cta">
            <Link className="btn" to="/auth?mode=register&role=USER">Donate or request blood</Link>
            <Link className="btn ghost" to="/auth?mode=register&role=HOSPITAL">Register a hospital</Link>
          </div>
        </div>

        <div className="card matcher">
          <h2>Who can give to a patient?</h2>
          <p className="muted">Choose the patient's blood group.</p>
          <div className="drops" role="group" aria-label="Patient blood group">
            {GROUPS.map((g) => (
              <button
                key={g}
                aria-pressed={g === patient}
                aria-label={label(g)}
                className={"dropbtn " + (g === patient ? "is-patient " : "") + (givers.includes(g) && g !== patient ? "is-giver" : "")}
                onClick={() => setPatient(g)}
              >
                <Drop size={64} text={label(g)} />
              </button>
            ))}
          </div>
          <p className="legend"><i className="k patient" /> Patient <i className="k giver" /> Can donate</p>
          <p className="result">
            {label(patient)} patients can receive blood from <strong>{givers.map(label).join(", ")}</strong>.
          </p>
        </div>
      </section>

      <section className="wrap">
        <h2 className="sec">How LifeDrop works</h2>
        <ol className="steps">
          <li><h3>Create an account</h3><p>Anyone can join. Add your blood group, city and last donation date to become a donor, and we track when you can give again.</p></li>
          <li><h3>Search for donors</h3><p>Pick the patient's blood group. Compatible donors appear, with eligible ones first.</p></li>
          <li><h3>Raise a request</h3><p>Anyone, or a hospital, can raise a request and see how many eligible donors can help in their city.</p></li>
        </ol>
      </section>
    </>
  );
}
