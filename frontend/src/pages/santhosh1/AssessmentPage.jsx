import { Volume2, MicOff, Mic, Check, ArrowRight } from "lucide-react";

export function AssessmentPage({ t, skill, question, answer, setAnswer, onSubmit, onRead, recording, transcribing, onRecord }) {
  return <section className="page-wrap narrow-wrap">
    <div className="page-title"><span className="eyebrow">{skill || t.assessment}</span><h1>{t.assessment}</h1><p>{t.assessmentIntro}</p></div>
    {!question ? <div className="empty-state"><h3>{t.noQuestion}</h3></div> : <div className="panel question-panel">
      <div className="question-meta"><span className="question-number">{t.questionNumber}</span><span className="level-tag">{question.level || "Practical"}</span></div>
      <h2>{question.question}</h2><p>{t.questionHelp}</p>
      <div className="question-actions"><button type="button" className="button button-secondary" onClick={onRead}><Volume2 size={17} />{t.readAloud}</button><span className="domain-tag">{question.domain}</span></div>
      <label className="field answer-field"><span>{t.answer}</span><textarea value={answer} onChange={e => setAnswer(e.target.value)} rows="6" placeholder={t.answer} /></label>
      <div className="record-row"><button type="button" className={`button ${recording ? "button-danger" : "button-secondary"}`} onClick={onRecord} disabled={transcribing}>{recording ? <><MicOff size={17} />{t.stopRecording}</> : <><Mic size={17} />{t.record}</>}</button><span className="helper-text">{transcribing ? t.transcribing : t.recordingHelp}</span></div>
      {recording && <div className="recording-indicator"><span className="recording-dot" />Recording your answer…</div>}
      <button className="button button-primary button-full submit-answer" onClick={onSubmit} disabled={!answer.trim() || recording || transcribing}><Check size={17} />{t.submitAnswer}<ArrowRight size={17} /></button>
    </div>}
  </section>;
}

