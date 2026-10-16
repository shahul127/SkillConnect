import { CheckCircle2, Star, ArrowRight } from "lucide-react";

export function AssessmentResult({ t, result, onHome }) {
  const scores = result?.domain_scores || result?.domain_averages || {};
  return <section className="page-wrap narrow-wrap">
    <div className="result-hero"><span className="result-check"><CheckCircle2 size={31} /></span><span className="eyebrow">{t.assessment}</span><h1>{t.assessmentDone}</h1><p>{t.scoreNote}</p><div className="overall-score">{Math.round(result?.overall_score || 0)}<small>/100</small></div><span className="score-caption">{t.overall}</span></div>
    <div className="panel result-panel"><h2>{t.domainScores}</h2><div className="domain-score-list">{Object.entries(scores).map(([domain, score]) => <div className="domain-score" key={domain}><div><span>{domain}</span><b>{Math.round(score)}%</b></div><div className="score-track"><span style={{ width: `${Math.max(0, Math.min(100, Number(score) || 0))}%` }} /></div></div>)}</div>
      <div className="strongest-box"><span className="strongest-icon"><Star size={18} /></span><div><small>{t.strongest}</small><b>{result?.strongest_domain || "—"}</b></div></div>
      <button className="button button-primary button-full" onClick={onHome}>{t.workerHome}<ArrowRight size={17} /></button>
    </div>
  </section>;
}

