import { Activity, ClipboardList, CalendarDays, MapPin, UserRound, CircleHelp, Check, X, CheckCircle2, CreditCard, Star } from "lucide-react";
import { useState } from "react";
import Field from "../../components/Field.jsx";

export function OrdersPage({ t, role, bookings, onRefresh, onRespond, onCancel, onComplete, onPayment, onReview }) {
  const [paymentFor, setPaymentFor] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [transaction, setTransaction] = useState("");
  const [reviewFor, setReviewFor] = useState(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [reviewedIds, setReviewedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sc_reviewed") || "[]"); }
    catch { return []; }
  });
  const labelStatus = status => t[status] || status;
  return <section className="page-wrap">
    <div className="page-title title-with-action"><div><span className="eyebrow">{role === "worker" ? t.workerHome : t.customerHome}</span><h1>{t.ordersTitle}</h1><p>{t.notificationsText}</p></div><button className="button button-secondary" onClick={onRefresh}><Activity size={16} />Refresh</button></div>
    {!bookings.length ? <div className="empty-state"><span className="empty-icon"><ClipboardList size={27} /></span><h3>{t.noOrders}</h3></div> : <div className="orders-list">
      {bookings.map(booking => <article className="order-card" key={booking.booking_id}>
        <div className="order-head"><div><span className="eyebrow">{booking.category_id || booking.skill || t.service}</span><h3>{booking.service_name || booking.service || t.service}</h3></div><span className={`status-pill status-${booking.status}`}>{labelStatus(booking.status)}</span></div>
        <div className="order-details">
          <span><CalendarDays size={16} />{booking.date} · {booking.time}</span>
          <span><MapPin size={16} />{booking.address}</span>
          {role === "customer" && booking.worker_name && <span><UserRound size={16} />{booking.worker_name}{booking.worker_phone ? ` · ${booking.worker_phone}` : ""}</span>}
          {role === "worker" && booking.customer_name && <span><UserRound size={16} />{booking.customer_name}{booking.customer_phone ? ` · ${booking.customer_phone}` : ""}</span>}
          {booking.problem_type && <span><CircleHelp size={16} />{booking.problem_type}</span>}
        </div>
        <div className="order-foot"><div><small>{t.price}</small><strong>₹{booking.price}</strong><small>{booking.payment_status === "paid" ? t.paid : t.unpaid}</small></div>
          <div className="order-actions">
            {role === "worker" && booking.status === "pending" && <><button className="button button-primary" onClick={() => onRespond(booking, "respond", true)}><Check size={15} />{t.accept}</button><button className="button button-secondary" onClick={() => onRespond(booking, "respond", false)}><X size={15} />{t.reject}</button></>}
            {role === "worker" && booking.status === "accepted" && <button className="button button-primary" onClick={() => onComplete(booking, "complete")}><CheckCircle2 size={15} />{t.markComplete}</button>}
            {role === "customer" && ["pending", "accepted"].includes(booking.status) && <button className="button button-secondary" onClick={() => onCancel(booking, "cancel")}><X size={15} />{t.cancel}</button>}
            {role === "customer" && booking.status === "completed" && booking.payment_status !== "paid" && <button className="button button-primary" onClick={() => { setPaymentFor(booking); setTransaction(""); }}><CreditCard size={15} />{t.payNow}</button>}
            {role === "customer" && booking.status === "completed" && booking.payment_status === "paid" && !booking.review_submitted && !reviewedIds.includes(booking.booking_id) && <button className="button button-secondary" onClick={() => { setReviewFor(booking); setRating(5); setReview(""); }}><Star size={15} />{t.reviewTitle}</button>}
          </div>
        </div>
        {paymentFor?.booking_id === booking.booking_id && <form className="inline-form" onSubmit={e => { e.preventDefault(); onPayment(booking, paymentMethod, transaction); setPaymentFor(null); }}>
          <h4>{t.payNow} · ₹{booking.price}</h4><p>{t.paymentNote}</p>
          <label className="field"><span>{t.paymentMethod}</span><select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}><option>Cash</option><option>UPI</option><option>Bank transfer</option><option>Other</option></select></label>
          <Field label={t.transactionRef} value={transaction} onChange={setTransaction} />
          <div className="inline-actions"><button type="button" className="button button-secondary" onClick={() => setPaymentFor(null)}>{t.cancelEdit}</button><button className="button button-primary" type="submit">{t.savePayment}</button></div>
        </form>}
        {reviewFor?.booking_id === booking.booking_id && <form className="inline-form" onSubmit={e => { e.preventDefault(); Promise.resolve(onReview(booking, rating, review)).then(ok => { if (ok) { const ids = [...reviewedIds, booking.booking_id]; setReviewedIds(ids); localStorage.setItem("sc_reviewed", JSON.stringify(ids)); } }); setReviewFor(null); }}>
          <h4>{t.reviewTitle}</h4><label className="field"><span>{t.ratingLabel}</span><select value={rating} onChange={e => setRating(e.target.value)}>{[5,4,3,2,1].map(n => <option key={n} value={n}>{n} / 5</option>)}</select></label>
          <label className="field"><span>{t.reviewText}</span><textarea value={review} onChange={e => setReview(e.target.value)} minLength="2" maxLength="1000" rows="3" required /></label>
          <div className="inline-actions"><button type="button" className="button button-secondary" onClick={() => setReviewFor(null)}>{t.cancelEdit}</button><button className="button button-primary" type="submit">{t.submitReview}</button></div>
        </form>}
      </article>)}
    </div>}
  </section>;
}

