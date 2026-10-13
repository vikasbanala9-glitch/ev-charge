import { useEffect, useState } from "react";
import api, { errorMessage, rupees, prettyDateTime, hhmm } from "../api.js";

export default function MyBookings() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () =>
    api.get("/bookings/my").then((r) => setRows(r.data)).catch((e) => setError(errorMessage(e))).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    setError("");
    try { await api.put(`/bookings/${id}/cancel`); load(); } catch (e) { setError(errorMessage(e)); }
  };

  const upcoming = (b) => b.status === "CONFIRMED" && new Date(b.startTime) > new Date();

  return (
    <>
      <div className="page-head"><h1>My bookings</h1></div>
      {error && <p className="msg error">{error}</p>}
      {loading && <p className="muted">Loading...</p>}
      {!loading && rows.length === 0 && <p className="muted">You have no bookings yet. Pick a station to reserve your first slot.</p>}
      {rows.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Station</th><th>Charger</th><th>When</th><th>Cost</th><th>Status</th><th /></tr></thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id}>
                  <td>{b.stationName}</td>
                  <td>{b.chargerName}</td>
                  <td>{prettyDateTime(b.startTime)} to {hhmm(b.endTime)}</td>
                  <td>{rupees(b.totalCost)}</td>
                  <td><span className={`tag ${b.status.toLowerCase()}`}>{b.status === "CONFIRMED" ? "Confirmed" : "Cancelled"}</span></td>
                  <td>{upcoming(b) && <button className="btn ghost small" onClick={() => cancel(b.id)}>Cancel</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
