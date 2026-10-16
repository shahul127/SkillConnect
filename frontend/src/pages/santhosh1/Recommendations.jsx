import { ArrowLeft, Users, Activity, MapPin, Star, CalendarDays, CheckCircle2, X } from "lucide-react";
import { useState } from "react";
import Field from "../../components/Field.jsx";
import { serviceText } from "../../utils/serviceText.js";

export function Recommendations({ t, language, workers, service, requestDetails, onBack, onBook, profile }) {
  const [bookingWorker, setBookingWorker] = useState(null);
  const [form, setForm] = useState({ date: "", time: "", address: "", problem_type: "", problem_details: "" });
  const set = (key, value) => setForm(old => ({ ...old, [key]: value }));
  return <section className="page-wrap">
    <button className="back-link" onClick={onBack}><ArrowLeft size={17} />{t.back}</button>
    <div className="page-title"><span className="eyebrow">{serviceText(service, language, "name")}</span><h1>{t.recommended}</h1><p>{t.recommendationText}</p></div>
    {workers.length === 0 ? <div className="empty-state"><span className="empty-icon"><Users size={28} /></span><h3>{t.noWorkers}</h3><p>Workers appear here after their assessment result has been saved and linked to their account.</p></div> :
      <div className="worker-grid">{workers.map((worker, i) => <article className="worker-card" key={worker.worker_id}>
        <div className="worker-card-top"><span className="avatar">{(worker.name || "W").slice(0, 1).toUpperCase()}</span><span className="match-label">{i === 0 ? "Best match" : "Recommended"}</span></div>
        <h3>{worker.name || "Skill Connect worker"}</h3><p className="worker-skill">{worker.skill}</p>
        <div className="worker-stats"><span><Activity size={16} /><b>{Math.round(worker.skill_score || 0)}%</b><small>{t.score}</small></span><span><MapPin size={16} /><b>{worker.distance_km ?? "—"} km</b><small>{t.distance}</small></span><span><Star size={16} /><b>{worker.rating || "—"}</b><small>{worker.review_count ? `${worker.review_count} reviews` : t.noRating}</small></span></div>
        <div className="worker-card-bottom"><span className="price-text">₹{service?.price}</span><button className="button button-primary" onClick={() => { setBookingWorker(worker); setForm({ date: requestDetails?.date || "", time: requestDetails?.time || "", address: requestDetails?.address || "", problem_type: requestDetails?.problem_type || "", problem_details: requestDetails?.problem_details || "" }); }}><CalendarDays size={16} />{t.book}</button></div>
      </article>)}</div>}
    {bookingWorker && <div className="modal-backdrop" onClick={() => setBookingWorker(null)}><form className="modal-card" onClick={e => e.stopPropagation()} onSubmit={e => { e.preventDefault(); onBook(bookingWorker, form); setBookingWorker(null); }}>
      <button type="button" className="modal-close" onClick={() => setBookingWorker(null)}><X size={18} /></button><span className="eyebrow">{t.newRequest}</span><h2>{t.book}</h2><p>{bookingWorker.name} · {serviceText(service, language, "name")}</p>
      <div className="two-fields"><Field label={t.date} type="date" value={form.date} onChange={v => set("date", v)} min={new Date().toISOString().slice(0, 10)} required /><Field label={t.time} type="time" value={form.time} onChange={v => set("time", v)} required /></div>
      <label className="field"><span>{t.address}</span><textarea value={form.address} onChange={e => set("address", e.target.value)} required minLength={5} rows="3" /></label>
      <div className="confirm-price"><span>{t.price}</span><b>₹{service?.price}</b></div>
      <button className="button button-primary button-full" type="submit"><CheckCircle2 size={18} />{t.book}</button>
    </form></div>}
  </section>;
}

