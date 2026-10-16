import { Check, ArrowLeft, ArrowRight, MapPin, Search, Wrench } from "lucide-react";
import { useState } from "react";
import Field from "../../components/Field.jsx";
import { serviceText, categoryLabel } from "../../utils/serviceText.js";

export function Catalogue({ t, language, category, services, selected, setSelected, onBack, onFind, onLocation, user }) {
  const [form, setForm] = useState({ problem_type: "", problem_details: "", address: "", date: "", time: "", latitude: user?.latitude ?? "", longitude: user?.longitude ?? "" });
  const set = (key, value) => setForm(old => ({ ...old, [key]: value }));
  const [showForm, setShowForm] = useState(false);
  return <section className="page-wrap">
    <button className="back-link" onClick={onBack}><ArrowLeft size={17} />{t.back}</button>
    <div className="page-title"><span className="eyebrow">{categoryLabel(category?.category_id, t)}</span><h1>{t.catalogue}</h1><p>{t.chooseService}</p></div>
    <div className="service-list">
      {services.map(service => <button key={service.service_id} className={`service-row ${selected?.service_id === service.service_id ? "selected" : ""}`} onClick={() => { setSelected(service); setShowForm(true); }}>
        <span className="service-symbol"><Wrench size={20} /></span><span className="service-info"><b>{serviceText(service, language, "name")}</b><small>{serviceText(service, language, "description")}</small><small>{serviceText(service, language, "problem_options")?.slice(0, 3).join(" · ")}</small></span>
        <span className="service-price"><b>₹{service.price}</b><small>{t.fixedPrice}</small></span><span className="select-circle">{selected?.service_id === service.service_id ? <Check size={16} /> : <ArrowRight size={16} />}</span>
      </button>)}
    </div>
    {showForm && selected && <form className="panel form-panel" onSubmit={e => { e.preventDefault(); onFind(form); }}>
      <div className="panel-heading"><div><span className="eyebrow">{t.requestDetails}</span><h2>{serviceText(selected, language, "name")}</h2><p>{t.serviceDetails}</p></div><div className="price-pill">₹{selected.price}</div></div>
      <label className="field"><span>{t.problem}</span><select value={form.problem_type} onChange={e => set("problem_type", e.target.value)} required><option value="">— {t.problem} —</option>{(selected.problem_options || []).map(option => <option key={option} value={option}>{language === "ta" ? (serviceText(selected, language, "problem_options") || [])[selected.problem_options.indexOf(option)] || option : option}</option>)}</select></label>
      <label className="field"><span>{t.details}</span><textarea rows="3" maxLength="1000" value={form.problem_details} onChange={e => set("problem_details", e.target.value)} placeholder={t.details} /></label>
      <label className="field"><span>{t.address}</span><textarea rows="2" minLength="5" required value={form.address} onChange={e => set("address", e.target.value)} placeholder={t.address} /></label>
      <div className="two-fields"><Field label={t.date} type="date" value={form.date} onChange={v => set("date", v)} required min={new Date().toISOString().slice(0, 10)} /><Field label={t.time} type="time" value={form.time} onChange={v => set("time", v)} required /></div>
      <div className="two-fields"><Field label={t.latitude} type="number" step="any" value={form.latitude} onChange={v => set("latitude", v)} required /><Field label={t.longitude} type="number" step="any" value={form.longitude} onChange={v => set("longitude", v)} required /></div>
      <button type="button" className="text-button location-button" onClick={() => onLocation(setForm)}><MapPin size={16} />{t.getLocation}</button>
      <button className="button button-primary button-full" type="submit"><Search size={18} />{t.findWorkers}<ArrowRight size={17} /></button>
    </form>}
  </section>;
}

