import { Activity, ClipboardList, CreditCard, Play, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { SKILLS } from "../../data/constants.js";

export function WorkerDashboard({ t, stats, profile, onStart, onOrders }) {
  const [skill, setSkill] = useState(SKILLS.includes(stats?.skill) ? stats.skill : "Plumber");
  useEffect(() => { if (SKILLS.includes(stats?.skill)) setSkill(stats.skill); }, [stats?.skill]);
  return <section className="page-wrap">
    <div className="welcome-banner worker-banner"><div><span className="eyebrow">{t.workerHome}</span><h1>{t.dashboard}, {profile?.name?.split(" ")[0] || "there"}.</h1><p>{t.assessmentIntro}</p></div><div className="banner-art"><ClipboardList size={40} /><span>✳</span></div></div>
    <div className="stats-grid">
      <Stat icon={Activity} label={t.score} value={stats?.skill_score != null ? `${Math.round(stats.skill_score)}%` : "—"} />
      <Stat icon={ClipboardList} label={t.completedOrders} value={stats?.completed_orders ?? 0} />
      <Stat icon={CreditCard} label={t.totalEarnings} value={`₹${stats?.total_earnings ?? 0}`} />
    </div>
    <div className="dashboard-columns">
      <section className="panel assessment-panel"><span className="eyebrow">{t.assessment}</span><h2>{stats?.assessment_completed ? t.assessmentDone : t.takeAssessment}</h2><p>{stats?.strongest_domain ? `${t.strongest}: ${stats.strongest_domain}` : t.assessmentIntro}</p>
        <label className="field"><span>{t.skill}</span><select value={skill} onChange={e => setSkill(e.target.value)}>{SKILLS.map(s => <option key={s}>{s}</option>)}</select></label>
        <button className="button button-primary button-full" onClick={() => onStart(skill)}><Play size={17} />{t.takeAssessment}</button>
      </section>
      <section className="panel orders-preview"><span className="eyebrow">{t.orders}</span><h2>{t.newRequest}</h2><p>{t.notificationsText}</p><button className="button button-secondary button-full" onClick={onOrders}><ClipboardList size={17} />{t.openOrders}<ArrowRight size={17} /></button></section>
    </div>
  </section>;
}


function Stat({ icon: Icon, label, value }) {
  return <div className="stat-card"><span className="stat-icon"><Icon size={19} /></span><span className="stat-label">{label}</span><strong>{value}</strong></div>;
}
