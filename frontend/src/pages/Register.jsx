import { useState } from "react";
import { registerUser, loginUser } from "../services/authService";
import "./Register.css";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  role: "customer",
  latitude: "",
  longitude: "",
};

export default function Register() {
  const [isLogin, setIsLogin] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const getLocation = () => {
    setLocationStatus("");

    if (!navigator.geolocation) {
      setLocationStatus("Your browser does not support GPS location.");
      return;
    }

    setLocationStatus("Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((previous) => ({
          ...previous,
          latitude: String(position.coords.latitude),
          longitude: String(position.coords.longitude),
        }));

        setLocationStatus("Location captured successfully.");
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus("Please allow location permission in your browser.");
        } else {
          setLocationStatus("Unable to detect location. Please try again.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const validateRegistration = () => {
    if (form.name.trim().length < 3) {
      return "Name must contain at least 3 characters.";
    }

    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      return "Enter a valid 10-digit Indian mobile number.";
    }

    if (form.password.length < 8 || form.password.length > 32) {
      return "Password must contain between 8 and 32 characters.";
    }

    if (form.password !== form.confirmPassword) {
      return "Passwords do not match.";
    }

    if (form.latitude === "" || form.longitude === "") {
      return "Please capture your location before registering.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setMessageType("");

    if (!isLogin) {
      const validationError = validateRegistration();

      if (validationError) {
        setMessage(validationError);
        setMessageType("error");
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const result = await loginUser({
          email: form.email.trim(),
          password: form.password,
        });

        if (!result.access_token) {
          setMessage(result.message || "Login failed.");
          setMessageType("error");
          return;
        }

        localStorage.setItem("access_token", result.access_token);

        setMessage(result.message || "Login successful!");
        setMessageType("success");
      } else {
        const userData = {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
          role: form.role,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
        };

        const result = await registerUser(userData);

        if (
          result.message?.toLowerCase().includes("already registered")
        ) {
          setMessage(result.message);
          setMessageType("error");
        } else {
          setMessage(result.message || "Registration successful!");
          setMessageType("success");
          setIsLogin(true);
          setForm((previous) => ({
            ...previous,
            password: "",
            confirmPassword: "",
          }));
        }
      }
    } catch (error) {
      const detail = error.response?.data?.detail;
      const serverMessage = error.response?.data?.message;

      if (Array.isArray(detail)) {
        setMessage(detail.map((item) => item.msg).join(", "));
      } else {
        setMessage(
          typeof detail === "string"
            ? detail
            : serverMessage ||
                "Request failed. Check the backend and try again."
        );
      }

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin((previous) => !previous);
    setMessage("");
    setMessageType("");
    setLocationStatus("");
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-icon">SC</div>

        <h1>SkillConnect</h1>

        <p className="subtitle">
          Find the right skills. Connect with the right people.
        </p>

        <div className="mode-switch">
          <button
            type="button"
            className={!isLogin ? "mode-active" : ""}
            onClick={() => {
              setIsLogin(false);
              setMessage("");
            }}
          >
            Register
          </button>

          <button
            type="button"
            className={isLogin ? "mode-active" : ""}
            onClick={() => {
              setIsLogin(true);
              setMessage("");
            }}
          >
            Login
          </button>
        </div>

        <h2>{isLogin ? "Welcome back!" : "Create your account"}</h2>

        <p className="form-description">
          {isLogin
            ? "Enter your account details to continue."
            : "Join SkillConnect as a customer or skilled worker."}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  minLength={3}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Mobile number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Register as</label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="customer">Customer</option>
                  <option value="worker">Skilled Worker</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={isLogin ? undefined : 8}
              maxLength={isLogin ? undefined : 32}
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="password-hint">
                Use 8–32 characters. Avoid passwords longer than the
                backend's supported limit.
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="location-box">
                <div>
                  <strong>Location</strong>
                  <p>Required to register your account.</p>
                </div>

                <button
                  type="button"
                  className="location-button"
                  onClick={getLocation}
                >
                  Get GPS
                </button>
              </div>

              {locationStatus && (
                <p className="location-status">{locationStatus}</p>
              )}

              {form.latitude !== "" && form.longitude !== "" && (
                <p className="coordinates">
                  Latitude: {form.latitude}
                  <br />
                  Longitude: {form.longitude}
                </p>
              )}
            </>
          )}

          {message && (
            <div
              className={`message ${
                messageType === "success" ? "success" : "error"
              }`}
              role="status"
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Login to SkillConnect"
              : "Create Account"}
          </button>
        </form>

        <p className="switch-text">
          {isLogin ? "Don't have an account?" : "Already registered?"}
          <button type="button" onClick={switchMode}>
            {isLogin ? "Create account" : "Login"}
          </button>
        </p>

        <p className="footer-text">
          SkillConnect · Connecting people through skills
        </p>
      </section>
    </main>
  );
}