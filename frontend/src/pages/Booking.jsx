
import { useState } from "react";

const API_URL = "http://127.0.0.1:8000/bookings";

export default function Booking() {
  const [form, setForm] = useState({
    worker_id: "",
    service_id: "plumbing_basic",
    date: "",
    time: "",
    address: "",
    problem_type: "Repair",
    problem_details: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login before booking a service.");
      return;
    }

    if (!/^[a-f\d]{24}$/i.test(form.worker_id.trim())) {
      setError("Enter a valid 24-character Worker ID.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          worker_id: form.worker_id.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail || "Booking failed.")
        );
      }

      setMessage(
        `Booking created successfully! Booking ID: ${data.booking_id || "Created"}`
      );

      setForm((previous) => ({
        ...previous,
        date: "",
        time: "",
        address: "",
        problem_details: "",
      }));
    } catch (err) {
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1>Book a Service</h1>
        <p style={styles.subtitle}>
          Choose a service and tell us what help you need.
        </p>

        {message && (
          <p role="status" style={styles.success}>
            {message}
          </p>
        )}

        {error && (
          <p role="alert" style={styles.error}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Worker ID</label>
          <input
            style={styles.input}
            name="worker_id"
            value={form.worker_id}
            onChange={handleChange}
            placeholder="Enter worker's MongoDB ID"
            required
          />

          <label style={styles.label}>Service</label>
          <select
            style={styles.input}
            name="service_id"
            value={form.service_id}
            onChange={handleChange}
            required
          >
            <option value="plumbing_basic">
              Basic Plumbing — ₹500
            </option>
            <option value="electrical_basic">
              Basic Electrical Repair — ₹600
            </option>
            <option value="carpentry_basic">
              Basic Carpentry — ₹700
            </option>
            <option value="cleaning_basic">
              Basic Home Cleaning — ₹800
            </option>
            <option value="painting_basic">
              Basic Painting — ₹1000
            </option>
          </select>

          <label style={styles.label}>Preferred Date</label>
          <input
            style={styles.input}
            type="date"
            name="date"
            min={new Date().toISOString().split("T")[0]}
            value={form.date}
            onChange={handleChange}
            required
          />

          <label style={styles.label}>Preferred Time</label>
          <input
            style={styles.input}
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            required
          />

          <label style={styles.label}>Service Address</label>
          <textarea
            style={styles.input}
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Enter the address where service is needed"
            required
          />

          <label style={styles.label}>Problem Type</label>
          <select
            style={styles.input}
            name="problem_type"
            value={form.problem_type}
            onChange={handleChange}
          >
            <option value="Repair">Repair</option>
            <option value="Installation">Installation</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Other">Other</option>
          </select>

          <label style={styles.label}>Problem Details</label>
          <textarea
            style={styles.input}
            name="problem_details"
            value={form.problem_details}
            onChange={handleChange}
            placeholder="Describe the issue"
            required
          />

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading ? "Submitting..." : "Confirm Booking"}
          </button>
        </form>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px 16px",
    background: "#f4f6fb",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    maxWidth: "560px",
    margin: "0 auto",
    padding: "28px",
    background: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  subtitle: {
    color: "#64748b",
    marginBottom: "24px",
  },
  label: {
    display: "block",
    marginTop: "16px",
    marginBottom: "6px",
    fontWeight: "600",
  },
  input: {
    boxSizing: "border-box",
    display: "block",
    width: "100%",
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "15px",
    background: "#ffffff",
  },
  button: {
    width: "100%",
    marginTop: "24px",
    padding: "13px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
  success: {
    padding: "12px",
    background: "#dcfce7",
    color: "#166534",
    borderRadius: "8px",
    overflowWrap: "anywhere",
  },
  error: {
    padding: "12px",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: "8px",
    overflowWrap: "anywhere",
  },
};
