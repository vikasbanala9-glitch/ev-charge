import { useEffect, useState } from "react";
import api, { errorMessage, rupees, typeLabel, prettyDateTime, hhmm } from "../api.js";

export default function Admin() {
  const [tab, setTab] = useState("chargers");
  const [stations, setStations] = useState([]);
  const [chargers, setChargers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");

  const reload = async () => {
    try {
      const [s, c, b] = await Promise.all([api.get("/stations"), api.get("/chargers"), api.get("/admin/bookings")]);
      setStations(s.data); setChargers(c.data); setBookings(b.data);
    } catch (e) { setError(errorMessage(e)); }
  };
  useEffect(() => { reload(); }, []);

  const run = async (fn) => {
    setError("");
    try { await fn(); await reload(); } catch (e) { setError(errorMessage(e)); }
  };

  const revenue = bookings.filter((b) => b.status === "CONFIRMED").reduce((t, b) => t + Number(b.totalCost), 0);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Manage network</h1>
          <p className="muted">
            {stations.length} stations · {chargers.length} chargers · {bookings.filter((b) => b.status === "CONFIRMED").length} confirmed bookings · {rupees(revenue)} booked
          </p>
        </div>
      </div>

      <div className="tabs">
        {["chargers", "stations", "bookings"].map((t) => (
          <button key={t} className={tab === t ? "tab on" : "tab"} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {error && <p className="msg error">{error}</p>}

      {tab === "stations" && <StationsTab stations={stations} run={run} />}
      {tab === "chargers" && <ChargersTab stations={stations} chargers={chargers} run={run} />}
      {tab === "bookings" && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Customer</th><th>Station / charger</th><th>When</th><th>Cost</th><th>Status</th><th /></tr></thead>
            <tbody>
              {bookings.length === 0 && <tr><td colSpan="6" className="muted">No bookings yet.</td></tr>}
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.userEmail}</td>
                  <td>{b.stationName} / {b.chargerName}</td>
                  <td>{prettyDateTime(b.startTime)} to {hhmm(b.endTime)}</td>
                  <td>{rupees(b.totalCost)}</td>
                  <td><span className={`tag ${b.status.toLowerCase()}`}>{b.status === "CONFIRMED" ? "Confirmed" : "Cancelled"}</span></td>
                  <td>
                    {b.status === "CONFIRMED" && new Date(b.startTime) > new Date() && (
                      <button className="btn ghost small" onClick={() => run(() => api.put(`/bookings/${b.id}/cancel`))}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function StationsTab({ stations, run }) {
  const empty = { name: "", address: "", city: "" };
  const [f, setF] = useState(empty);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  return (
    <>
      <form className="inline-form" onSubmit={(e) => { e.preventDefault(); run(() => api.post("/admin/stations", f)).then(() => setF(empty)); }}>
        <input placeholder="Station name" value={f.name} onChange={set("name")} required />
        <input placeholder="Address" value={f.address} onChange={set("address")} required />
        <input placeholder="City" value={f.city} onChange={set("city")} required />
        <button className="btn primary">Add station</button>
      </form>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Address</th><th>City</th><th /></tr></thead>
          <tbody>
            {stations.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td><td>{s.address}</td><td>{s.city}</td>
                <td>
                  <button className="btn ghost small" onClick={() => window.confirm(`Delete ${s.name}?`) && run(() => api.delete(`/admin/stations/${s.id}`))}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ChargersTab({ stations, chargers, run }) {
  const empty = { stationId: "", name: "", type: "AC_FAST", powerKw: "", ratePerHour: "" };
  const [f, setF] = useState(empty);
  const [rates, setRates] = useState({}); // chargerId -> edited rate
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const payload = (c, patch = {}) => ({
    stationId: c.station.id, name: c.name, type: c.type,
    powerKw: c.powerKw, ratePerHour: c.ratePerHour, status: c.status, ...patch,
  });

  return (
    <>
      <form className="inline-form" onSubmit={(e) => {
        e.preventDefault();
        run(() => api.post("/admin/chargers", { ...f, stationId: Number(f.stationId), powerKw: Number(f.powerKw), ratePerHour: Number(f.ratePerHour) }))
          .then(() => setF(empty));
      }}>
        <select value={f.stationId} onChange={set("stationId")} required>
          <option value="">Station</option>
          {stations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input placeholder="Name (e.g. A1)" value={f.name} onChange={set("name")} required />
        <select value={f.type} onChange={set("type")}>
          {Object.entries(typeLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input type="number" step="0.1" min="0.1" placeholder="kW" value={f.powerKw} onChange={set("powerKw")} required />
        <input type="number" step="1" min="0" placeholder="₹ per hour" value={f.ratePerHour} onChange={set("ratePerHour")} required />
        <button className="btn primary">Add charger</button>
      </form>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Station</th><th>Charger</th><th>Type</th><th>Rate per hour</th><th>Status</th><th /></tr></thead>
          <tbody>
            {chargers.map((c) => {
              const edited = rates[c.id] !== undefined && Number(rates[c.id]) !== Number(c.ratePerHour);
              return (
                <tr key={c.id}>
                  <td>{c.station.name}</td>
                  <td>{c.name}</td>
                  <td>{typeLabel[c.type]} · {Number(c.powerKw)} kW</td>
                  <td>
                    <span className="rate-edit">
                      ₹<input type="number" min="0" value={rates[c.id] ?? Number(c.ratePerHour)}
                              onChange={(e) => setRates({ ...rates, [c.id]: e.target.value })} />
                      {edited && (
                        <button className="btn small primary" onClick={() =>
                          run(() => api.put(`/admin/chargers/${c.id}`, payload(c, { ratePerHour: Number(rates[c.id]) })))
                            .then(() => setRates((r) => { const n = { ...r }; delete n[c.id]; return n; }))}>
                          Save rate
                        </button>
                      )}
                    </span>
                  </td>
                  <td>
                    <button className={`tag btn-tag ${c.status.toLowerCase()}`} onClick={() =>
                      run(() => api.put(`/admin/chargers/${c.id}`, payload(c, { status: c.status === "ACTIVE" ? "MAINTENANCE" : "ACTIVE" })))}>
                      {c.status === "ACTIVE" ? "Active" : "Maintenance"}
                    </button>
                  </td>
                  <td>
                    <button className="btn ghost small" onClick={() => window.confirm(`Delete charger ${c.name}?`) && run(() => api.delete(`/admin/chargers/${c.id}`))}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
