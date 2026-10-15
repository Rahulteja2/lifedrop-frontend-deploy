import { useState } from "react";
import { useAuth } from "../auth";
import Donor from "./Donor";
import { Find, Request } from "./Hospital";

export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("donate");
  return (
    <section className="wrap">
      <h1 className="h-md">Hello, {user.name}</h1>
      <div className="tabs" role="group" aria-label="Sections">
        <button aria-pressed={tab === "donate"} onClick={() => setTab("donate")}>Donate blood</button>
        <button aria-pressed={tab === "find"} onClick={() => setTab("find")}>Find donors</button>
        <button aria-pressed={tab === "req"} onClick={() => setTab("req")}>Request blood</button>
      </div>
      {tab === "donate" && <Donor />}
      {tab === "find" && <Find />}
      {tab === "req" && <Request />}
    </section>
  );
}
