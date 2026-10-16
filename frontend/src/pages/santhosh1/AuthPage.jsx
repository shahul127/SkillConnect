import { ShieldCheck, Users, MapPin, LogIn, Plus, ArrowRight } from "lucide-react";
import { useState } from "react";
import Field from "../../components/Field.jsx";

export function AuthPage({ t, mode, onLogin, onRegister, onSwitch, onLocation }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm_password: "", role: "customer", latitude: "", longitude: "" });
  const [showPassword, setShowPassword] = useState(false);
  const set = (key, value) => setForm(old => ({ ...old, [key]: value }));
  const [busy, setBusy] = useState(false);
  const submit = async e => {
    e.preventDefault(); setBusy(true);
    try { await (mode === "login" ? onLogin(form) : onRegister(form)); }
    finally { setBusy(false); }
  };
  return <section className="auth-layout">
    <div className="auth-story">
      <span className="eyebrow"><ShieldCheck size={15} /> {t.brand}</span>
      <h1>{mode === "login" ? t.welcome : t.register}<span className="accent-dot">.</span></h1>
      <p>{t.welcomeText}</p>
      <div className="story-points">
        <div><span className="story-icon"><Users size={18} /></span><span><b>{t.customer} & {t.worker}</b><small>{t.tagline}</small></span></div>
        <div><span className="story-icon"><MapPin size={18} /></span><span><b>{t.recommended}</b><small>{t.recommendationText}</small></span></div>
      </div>
      <div className="story-scribble">Local people. Real skills. Better work.</div>
    </div>
    <form className="auth-card" onSubmit={submit}>
      <div className="card-heading"><span className="eyebrow">{mode === "login" ? "GOOD TO SEE YOU" : "LET'S GET STARTED"}</span><h2>{mode === "login" ? t.login : t.createAccount}</h2></div>
      {mode === "register" && <>
        <Field label={t.name} value={form.name} onChange={v => set("name", v)} required autoComplete="name" />
        <Field label={t.phone} value={form.phone} onChange={v => set("phone", v)} required inputMode="numeric" maxLength={10} placeholder="9876543210" />
        <label className="field"><span>{t.role}</span><select value={form.role} onChange={e => set("role", e.target.value)}><option value="customer">{t.customer}</option><option value="worker">{t.worker}</option></select></label>
      </>}
      <Field label={t.email} type="email" value={form.email} onChange={v => set("email", v)} required autoComplete="email" />
      <label className="field"><span>{t.password}</span><div className="password-wrap"><input type={showPassword ? "text" : "password"} value={form.password} onChange={e => set("password", e.target.value)} required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button></div></label>
      {mode === "register" && <>
        <Field label={t.confirmPassword} type="password" value={form.confirm_password} onChange={v => set("confirm_password", v)} required minLength={8} autoComplete="new-password" />
        <div className="location-fields">
          <Field label={t.latitude} value={form.latitude} onChange={v => set("latitude", v)} type="number" step="any" required />
          <Field label={t.longitude} value={form.longitude} onChange={v => set("longitude", v)} type="number" step="any" required />
        </div>
        <button type="button" className="text-button location-button" onClick={() => onLocation(setForm)}><MapPin size={16} />{t.getLocation}</button>
      </>}
      <button className="button button-primary button-full" disabled={busy} type="submit">{mode === "login" ? <><LogIn size={17} />{t.login}</> : <><Plus size={17} />{t.createAccount}</>}<ArrowRight size={17} /></button>
      <p className="auth-switch">{mode === "login" ? t.noAccount : t.haveAccount} <button type="button" onClick={onSwitch}>{mode === "login" ? t.register : t.login}</button></p>
      <p className="form-footnote">By continuing, you agree to use Skill Connect respectfully.</p>
    </form>
  </section>;
}
