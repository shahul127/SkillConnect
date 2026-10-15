import { useEffect, useState } from "react";
import "./Payments.css";

const API_URL = "http://127.0.0.1:8000/api/payments/";

export default function Payments() {
  const [form, setForm] = useState({
    worker_name: "Worker 1 — Plumber",
    booking_id: "101",
    amount: "800",
    method: "UPI",
    notes: "good",
  });

  const [payments, setPayments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadPayments() {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Could not load payments");
      }

      const data = await response.json();
      setPayments(data.payments || []);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadPayments();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Payment assignment failed");
      }

      setMessage(data.message);
      await loadPayments();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="payment-page">
      <section className="payment-card">
        <h1>SkillConnect</h1>
        <h2>Assign Worker Payment</h2>
        <p className="subtitle">
          Manage service payments in one place.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="worker_name">Worker</label>
          <input
            id="worker_name"
            name="worker_name"
            value={form.worker_name}
            onChange={handleChange}
            required
          />

          <label htmlFor="booking_id">Booking ID</label>
          <input
            id="booking_id"
            name="booking_id"
            value={form.booking_id}
            onChange={handleChange}
            required
          />

          <label htmlFor="amount">Amount (₹)</label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0.01"
            max="1000000"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
            required
          />

          <label htmlFor="method">Payment Method</label>
          <select
            id="method"
            name="method"
            value={form.method}
            onChange={handleChange}
          >
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cash">Cash</option>
          </select>

          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows="3"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Assign Payment"}
          </button>
        </form>

        {message && (
          <p className="payment-message" role="status">
            {message}
          </p>
        )}
      </section>

      <section className="payment-list">
        <div className="list-heading">
          <h2>Payment History</h2>
          <button type="button" onClick={loadPayments}>
            Refresh
          </button>
        </div>

        {payments.length === 0 ? (
          <p>No payments assigned yet.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Booking</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.payment_id}>
                    <td>{payment.worker_name}</td>
                    <td>{payment.booking_id}</td>
                    <td>
                      ₹{Number(payment.amount).toLocaleString("en-IN")}
                    </td>
                    <td>{payment.method}</td>
                    <td>
                      <span className="pending-status">
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}