import { useState } from "react";
import "./Register.css";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "customer",
    latitude: "",
    longitude: "",
  });

  const [locationStatus, setLocationStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser.");
      return;
    }

    setLocationStatus("Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setFormData((prev) => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        }));

        setLocationStatus("Location detected successfully.");
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationStatus(
              "Location permission was denied. Please allow location access."
            );
            break;

          case error.POSITION_UNAVAILABLE:
            setLocationStatus("Location information is unavailable.");
            break;

          case error.TIMEOUT:
            setLocationStatus("Location request timed out.");
            break;

          default:
            setLocationStatus("Unable to detect your location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };
  const validateForm = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      alert("Please fill in all required fields.");
      return false;
    }

    if (formData.name.length < 3) {
      alert("Name must contain at least 3 characters.");
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(formData.email)) {
      alert("Please enter a valid email address.");
      return false;
    }

    const phonePattern = /^[6-9]\d{9}$/;

    if (!phonePattern.test(formData.phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return false;
    }

    if (formData.password.length < 8) {
      alert("Password must contain at least 8 characters.");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return false;
    }

    if (!formData.latitude || !formData.longitude) {
      alert("Please detect your current location.");
      return false;
    }

    return true;
  };

  // Submit registration
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log("Registration Data:", formData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Registration successful!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "customer",
        latitude: "",
        longitude: "",
      });

      setLocationStatus("");
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">

        {/* Header */}
        <div className="register-header">
          <h1>SkillConnect</h1>

          <h2>Create Your Account</h2>

          <p>
            Connect with trusted skilled professionals
            and get services easily.
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>

          {/* Name */}
          <div className="form-group">
            <label htmlFor="name">
              Full Name <span>*</span>
            </label>

            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">
              Email Address <span>*</span>
            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="phone">
              Phone Number <span>*</span>
            </label>

            <input
              id="phone"
              type="tel"
              name="phone"
              placeholder="Enter 10-digit phone number"
              maxLength="10"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          {/* Role */}
          <div className="form-group">
            <label htmlFor="role">
              Register As <span>*</span>
            </label>

            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="customer">
                Customer
              </option>

              <option value="provider">
                Service Provider/worker
              </option>
            </select>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">
              Password <span>*</span>
            </label>

            <input
              id="password"
              type="password"
              name="password"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={handleChange}
            />

            {formData.password && (
              <div className="password-strength">
                {formData.password.length < 8
                  ? "Weak password"
                  : formData.password.length < 12
                  ? "Medium password"
                  : "Strong password"}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirm Password <span>*</span>
            </label>

            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          {/* Location Section */}
          <div className="location-section">

            <div className="location-header">
              <div>
                <h3>Service Location</h3>

                <p>
                  Your location helps us find nearby service
                  providers.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="location-button"
              onClick={getCurrentLocation}
            >
              📍 Use My Current Location
            </button>

            {locationStatus && (
              <p
                className={
                  formData.latitude
                    ? "location-success"
                    : "location-status"
                }
              >
                {locationStatus}
              </p>
            )}

            {formData.latitude && formData.longitude && (
              <div className="coordinates">

                <div>
                  <span>Latitude</span>
                  <strong>{formData.latitude}</strong>
                </div>

                <div>
                  <span>Longitude</span>
                  <strong>{formData.longitude}</strong>
                </div>

              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        {/* Login */}
        <div className="login-section">
          <p>
            Already have an account?
            <button
              type="button"
              className="login-link"
              onClick={() => {
                console.log("Navigate to Login");
              }}
            >
              Login
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Register;