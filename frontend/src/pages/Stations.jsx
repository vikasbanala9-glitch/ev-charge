import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage, rupees, typeLabel } from "../api.js";

export default function Stations() {
  const [stations, setStations] = useState([]);
  const [chargers, setChargers] = useState([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/stations"), api.get("/chargers")])
      .then(([s, c]) => { setStations(s.data); setChargers(c.data); })
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const shown = stations.filter((s) =>
    `${s.name} ${s.city} ${s.address}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Find a charger</h1>
          <p className="muted">Pick a station, choose an hour, and the charger is yours.</p>
        </div>
        <input className="search" placeholder="Search by name or area" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {error && <p className="msg error">{error}</p>}
      {loading && <p className="muted">Loading stations...</p>}
      {!loading && !error && shown.length === 0 && <p className="muted">No stations match your search.</p>}

      <div className="station-list">
        {shown.map((s) => {
          const cs = chargers.filter((c) => c.station.id === s.id && c.status === "ACTIVE");
          const min = cs.length ? Math.min(...cs.map((c) => Number(c.ratePerHour))) : null;
          const types = [...new Set(cs.map((c) => typeLabel[c.type]))].join(", ");
          return (
            <Link to={`/stations/${s.id}`} className="station-row" key={s.id}>
              <div>
                <h2>{s.name}</h2>
                <p className="muted">{s.address}, {s.city}</p>
              </div>
              <div className="station-meta">
                <span>{cs.length} charger{cs.length === 1 ? "" : "s"} available</span>
                <span className="muted">{types || "Currently unavailable"}</span>
              </div>
              <div className="price">
                {min !== null ? (<><small>from</small><strong>{rupees(min)}</strong><small>per hour</small></>) : "-"}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
