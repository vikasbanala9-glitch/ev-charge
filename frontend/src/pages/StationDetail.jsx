import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api, { errorMessage, rupees, typeLabel, localDate, hhmm, prettyDateTime } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function StationDetail() {
  const { id } = useParams();
  const [station, setStation] = useState(null);
  const [chargers, setChargers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get(`/stations/${id}`), api.get(`/stations/${id}/chargers`)])
      .then(([s, c]) => { setStation(s.data); setChargers(c.data); })
      .catch((e) => setError(errorMessage(e)));
  }, [id]);

  if (error) return <p className="msg error">{error}</p>;
  if (!station) return <p className="muted">Loading...</p>;

  return (
    <>
      <Link to="/" className="back">Back to stations</Link>
      <div className="page-head">
        <div>
          <h1>{station.name}</h1>
          <p className="muted">{station.address}, {station.city}</p>
        </div>
      </div>
      {chargers.length === 0 && <p className="muted">This station has no chargers yet.</p>}
      {chargers.map((c) => <ChargerPanel key={c.id} charger={c} />)}
    </>
  );
}

function ChargerPanel({ charger }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState(localDate());
  const [slots, setSlots] = useState([]);
  const [start, setStart] = useState(null); // index of first selected slot
  const [hours, setHours] = useState(1);
  const [msg, setMsg] = useState(null); // {type, text}
  const [busy, setBusy] = useState(false);
  const active = charger.status === "ACTIVE";

  const loadSlots = () =>
    api.get(`/chargers/${charger.id}/slots`, { params: { date } })
      .then((r) => setSlots(r.data))
      .catch((e) => setMsg({ type: "error", text: errorMessage(e) }));

  useEffect(() => {
    setStart(null);
    if (active) loadSlots();
    // eslint-disable-next-line
  }, [date, charger.id]);

  const selected = start === null ? [] : slots.slice(start, start + hours);
  const valid = selected.length === hours && selected.every((s) => s.available);
  const total = Number(charger.ratePerHour) * hours;

  const pick = (i) => {
    if (!slots[i].available) return;
    setStart(i);
    setMsg(null);
  };

  const book = async () => {
    if (!user) return navigate("/login");
    setBusy(true);
    setMsg(null);
    try {
      const { data } = await api.post("/bookings", {
        chargerId: charger.id,
        startTime: slots[start].start,
        hours,
      });
      setMsg({ type: "ok", text: `Booked ${prettyDateTime(data.startTime)} to ${hhmm(data.endTime)}. Total ${rupees(data.totalCost)}.` });
      setStart(null);
      loadSlots();
    } catch (e) {
      setMsg({ type: "error", text: errorMessage(e) });
      loadSlots();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="charger">
      <div className="charger-head">
        <div>
          <h2>Charger {charger.name}</h2>
          <p className="muted">{typeLabel[charger.type]} · {Number(charger.powerKw)} kW</p>
        </div>
        <div className="price">
          <strong>{rupees(charger.ratePerHour)}</strong><small>per hour</small>
        </div>
      </div>

      {!active ? (
        <p className="msg warn">This charger is under maintenance and cannot be booked right now.</p>
      ) : (
        <>
          <div className="controls">
            <label>Date
              <input type="date" value={date} min={localDate()} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label>Duration
              <select value={hours} onChange={(e) => setHours(Number(e.target.value))}>
                {[1, 2, 3, 4, 6, 8].map((h) => <option key={h} value={h}>{h} hour{h > 1 ? "s" : ""}</option>)}
              </select>
            </label>
          </div>

          <div className="slots" role="group" aria-label="Hourly slots">
            {slots.map((s, i) => {
              const inSel = start !== null && i >= start && i < start + hours;
              const cls = !s.available ? "slot taken" : inSel ? "slot chosen" : "slot free";
              return (
                <button key={s.start} className={cls} disabled={!s.available} onClick={() => pick(i)}
                        aria-pressed={inSel} title={s.available ? "Available" : "Unavailable"}>
                  {hhmm(s.start)}
                </button>
              );
            })}
          </div>
          <p className="legend">
            <span className="dot free" /> Free <span className="dot chosen" /> Your pick <span className="dot taken" /> Booked or past
          </p>

          {start !== null && !valid && (
            <p className="msg warn">Some hours in that range are unavailable. Choose a shorter duration or another start time.</p>
          )}

          <div className="book-bar">
            <div>
              {valid ? (
                <>
                  <strong>{hhmm(slots[start].start)} to {hhmm(slots[start + hours - 1].end)}</strong>
                  <span className="muted"> · {hours} h × {rupees(charger.ratePerHour)} = </span>
                  <strong className="total">{rupees(total)}</strong>
                </>
              ) : (
                <span className="muted">Select a start time to see your total.</span>
              )}
            </div>
            <button className="btn primary" disabled={!valid || busy} onClick={book}>
              {busy ? "Booking..." : user ? "Confirm booking" : "Log in to book"}
            </button>
          </div>
          {msg && <p className={`msg ${msg.type}`}>{msg.text}</p>}
        </>
      )}
    </section>
  );
}
