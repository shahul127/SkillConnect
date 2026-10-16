import { useEffect, useRef, useState } from "react";
import { Check, CheckCircle2, CircleHelp, X } from "lucide-react";
import { copy } from "./data/translations.js";
import { SKILLS } from "./data/constants.js";
import { api } from "./utils/api.js";
import { AuthPage } from "./pages/gokul/AuthPage.jsx";
import { CustomerHome } from "./pages/santhosh/CustomerHome.jsx";
import { NotificationsPage } from "./pages/santhosh/NotificationsPage.jsx";
import { ProfilePage } from "./pages/santhosh/ProfilePage.jsx";
import { Navbar } from "./pages/santhosh/Navbar.jsx";
import { Catalogue } from "./pages/gokul/Catalogue.jsx";
import { Recommendations } from "./pages/gokul/Recommendations.jsx";
import { WorkerDashboard } from "./pages/gokul/WorkerDashboard.jsx";
import { AssessmentPage } from "./pages/gokul/AssessmentPage.jsx";
import { AssessmentResult } from "./pages/gokul/AssessmentResult.jsx";
import { OrdersPage } from "./pages/gokul/OrdersPage.jsx";

const PAGE_PATHS = {
  login: "/login",
  register: "/register",
  home: "/customer/home",
  catalogue: "/customer/services",
  recommendations: "/customer/recommendations",
  worker: "/worker/dashboard",
  assessment: "/worker/assessment",
  assessmentResult: "/worker/assessment/result",
  orders: "/orders",
  notifications: "/notifications",
  profile: "/profile",
};

function pageFromPath(pathname) {
  const path = pathname.replace(/\/+$/, "") || "/";
  const entry = Object.entries(PAGE_PATHS).find(([, value]) => value === path);
  return entry?.[0] || (path === "/" ? "home" : "notFound");
}

function pathForPage(page, role) {
  if (page === "home") return role === "worker" ? PAGE_PATHS.worker : PAGE_PATHS.home;
  if (page === "catalogue" || page === "recommendations") return role === "customer" ? PAGE_PATHS[page] : PAGE_PATHS.login;
  if (page === "worker" || page === "assessment" || page === "assessmentResult") return role === "worker" ? PAGE_PATHS[page] : PAGE_PATHS.login;
  return PAGE_PATHS[page] || PAGE_PATHS.login;
}

function pageAllowed(page, role) {
  if (["login", "register", "notFound"].includes(page)) return false;
  if (["home", "catalogue", "recommendations"].includes(page)) return role === "customer";
  if (["worker", "assessment", "assessmentResult"].includes(page)) return role === "worker";
  return ["orders", "notifications", "profile"].includes(page);
}

export default function App() {
  const [language, setLanguage] = useState(() => localStorage.getItem("sc_language") === "ta" ? "ta" : "en");
  const t = copy[language] || copy.en;
  const [token, setToken] = useState(localStorage.getItem("sc_token") || "");
  const [user, setUser] = useState(null);
  const [page, setPageState] = useState(() => pageFromPath(window.location.pathname));
  const [authChecking, setAuthChecking] = useState(() => Boolean(localStorage.getItem("sc_token")));
  const setPage = (nextPage, replace = false, roleOverride = null) => {
    setPageState(nextPage);
    const nextPath = pathForPage(nextPage, roleOverride || user?.role);
    if (window.location.pathname !== nextPath) {
      if (replace) window.history.replaceState({}, "", nextPath);
      else window.history.pushState({}, "", nextPath);
    }
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceRequest, setServiceRequest] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [workerStats, setWorkerStats] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({});
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const flash = (message) => { setNotice(message); window.setTimeout(() => setNotice(""), 3500); };
  const run = async (fn) => {
    setError(""); setLoading(true);
    try { return await fn(); }
    catch (e) { setError(e.message || t.error); return null; }
    finally { setLoading(false); }
  };

  useEffect(() => { localStorage.setItem("sc_language", language); }, [language]);

  useEffect(() => {
    api("/services/categories", {}, token || null).then(d => setCategories(d.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setUser(null);
      setProfile(null);
      setAuthChecking(false);
      const currentPage = pageFromPath(window.location.pathname);
      if (!["login", "register"].includes(currentPage)) setPage("login", true);
      return () => { cancelled = true; };
    }

    setAuthChecking(true);
    api("/users/me", {}, token).then(d => {
      if (cancelled) return;
      setProfile(d.user);
      setUser(d.user);
      setProfileForm({
        name: d.user.name || "", email: d.user.email || "", phone: d.user.phone || "",
        latitude: d.user.latitude ?? "", longitude: d.user.longitude ?? "", role: d.user.role || ""
      });
      const requestedPage = pageFromPath(window.location.pathname);
      const routeNeedsMissingContext =
        (requestedPage === "catalogue" && !selectedCategory) ||
        (requestedPage === "recommendations" && !selectedService) ||
        ((requestedPage === "assessment" || requestedPage === "assessmentResult") && !assessment);
      if (!pageAllowed(requestedPage, d.user.role) || routeNeedsMissingContext) {
        setPage(d.user.role === "worker" ? "worker" : "home", true, d.user.role);
      } else {
        setPage(requestedPage, true, d.user.role);
      }
    }).catch(() => {
      if (cancelled) return;
      localStorage.removeItem("sc_token");
      setToken("");
      setUser(null);
      setPage("login", true);
      setError("Your session has expired or could not be verified. Please sign in again.");
    }).finally(() => {
      if (!cancelled) setAuthChecking(false);
    });
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    const onPopState = () => {
      const requestedPage = pageFromPath(window.location.pathname);
      if (!token) {
        setPageState(["login", "register"].includes(requestedPage) ? requestedPage : "login");
        if (!["login", "register"].includes(requestedPage)) window.history.replaceState({}, "", "/login");
        return;
      }
      if (user && !pageAllowed(requestedPage, user.role)) {
        const fallback = user.role === "worker" ? "worker" : "home";
        setPageState(fallback);
        window.history.replaceState({}, "", pathForPage(fallback, user.role));
      } else setPageState(requestedPage === "notFound" ? (user?.role === "worker" ? "worker" : "home") : requestedPage);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [token, user]);

  useEffect(() => {
    if (!user || page !== "orders") return;
    refreshBookings();
  }, [user, page]);

  useEffect(() => {
    if (!user || page !== "notifications") return;
    api("/notifications/").then(d => setNotifications(d.notifications || [])).catch(e => setError(e.message));
  }, [user, page]);

  useEffect(() => {
    if (!user) return;
    const timer = window.setInterval(() => {
      api("/notifications/").then(d => setNotifications(d.notifications || [])).catch(() => {});
      if (page === "orders") {
        const path = user.role === "worker" ? "/bookings/worker" : "/bookings/customer";
        api(path).then(d => setBookings(d.bookings || [])).catch(() => {});
      }
    }, 15000);
    return () => window.clearInterval(timer);
  }, [user, page]);

  useEffect(() => {
    if (!user || user.role !== "worker") return;
    api("/worker/dashboard").then(stats => {
      const saved = localStorage.getItem(`sc_assessment_${user.user_id}`);
      if (saved) {
        try {
          const assessmentInfo = JSON.parse(saved);
          api(`/ai/assessment/result/${assessmentInfo.id}`).then(result => {
            setWorkerStats({ ...stats, assessment_completed: result.status === "completed", skill: assessmentInfo.skill, skill_score: result.overall_score, strongest_domain: result.strongest_domain });
          }).catch(() => setWorkerStats(stats));
        } catch { setWorkerStats(stats); }
      } else setWorkerStats(stats);
    }).catch(() => setWorkerStats(null));
  }, [user]);

  async function refreshBookings() {
    const path = user?.role === "worker" ? "/bookings/worker" : "/bookings/customer";
    const data = await run(() => api(path));
    if (data) setBookings(data.bookings || []);
  }

  async function login(form) {
    const data = await run(() => api("/auth/login", { method: "POST", body: JSON.stringify({ email: form.email, password: form.password }) }, null));
    if (!data) return;
    if (!data.access_token) { setError(data.message || t.loginError); return; }
    localStorage.setItem("sc_token", data.access_token);
    setToken(data.access_token);
    flash(t.signedIn);
  }

  async function register(form) {
    if (form.password !== form.confirm_password) { setError(t.passwordMismatch); return; }
    if (form.latitude === "" || form.longitude === "") { setError(t.locationRequired); return; }
    const payload = {
      name: form.name, email: form.email, phone: form.phone, role: form.role,
      latitude: Number(form.latitude), longitude: Number(form.longitude), password: form.password
    };
    const data = await run(() => api("/auth/register", { method: "POST", body: JSON.stringify(payload) }, null));
    if (!data) return;
    if (data.message && !/successful/i.test(data.message) && !/success/i.test(data.message)) { setError(data.message); return; }
    flash(data.message || t.success);
    setPage("login");
  }

  function logout() {
    localStorage.removeItem("sc_token"); setToken(""); setUser(null); setPage("login");
    setAssessment(null); setCurrentQuestion(null); setAssessmentResult(null);
  }

  async function openCatalogue(category) {
    setSelectedCategory(category); setSelectedService(null); setWorkers([]);
    const data = await run(() => api(`/services/?category_id=${encodeURIComponent(category.category_id)}`));
    if (data) { setServices(data.services || []); setPage("catalogue"); }
  }

  async function searchWorkers(form) {
    if (!selectedService) { setError(t.chooseServiceFirst); return; }
    setServiceRequest(form);
    const query = new URLSearchParams({ service_id: selectedService.service_id });
    if (form.latitude !== "" && form.latitude != null) query.set("latitude", form.latitude);
    if (form.longitude !== "" && form.longitude != null) query.set("longitude", form.longitude);
    const data = await run(() => api(`/recommendations?${query.toString()}`));
    if (data) { setWorkers(data.workers || []); setPage("recommendations"); }
  }

  async function createBooking(worker, form) {
    const data = await run(() => api("/bookings/", {
      method: "POST",
      body: JSON.stringify({
        worker_id: worker.worker_id,
        service_id: selectedService.service_id,
        date: form.date,
        time: form.time,
        address: form.address,
        problem_type: form.problem_type,
        problem_details: form.problem_details || null
      })
    }));
    if (data) {
      flash(data.message || t.bookingSent);
      setPage("orders");
      refreshBookings();
    }
  }

  async function updateBooking(booking, action, accepted) {
    let path = `/bookings/${booking.booking_id}/${action}`;
    let options = { method: "POST" };
    if (action === "respond") options.body = JSON.stringify({ accepted });
    const data = await run(() => api(path, options));
    if (data) { flash(data.message || t.success); await refreshBookings(); }
  }

  async function markPayment(booking, payment_method, transaction_reference) {
    const data = await run(() => api("/payments", {
      method: "POST",
      body: JSON.stringify({ booking_id: booking.booking_id, payment_method, transaction_reference: transaction_reference || null })
    }));
    if (data) { flash(data.message || t.success); await refreshBookings(); }
  }

  async function submitReview(booking, rating, review) {
    const data = await run(() => api("/reviews", {
      method: "POST", body: JSON.stringify({ booking_id: booking.booking_id, rating: Number(rating), review })
    }));
    if (data) { flash(data.message || t.success); await refreshBookings(); }
    return data;
  }

  async function startAssessment(skill) {
    setAssessmentResult(null); setAnswer("");
    const data = await run(() => api("/ai/assessment/start", {
      method: "POST", body: JSON.stringify({ user_id: profile?.user_id, skill })
    }));
    if (!data) return;
    if (data.status === "error") { setError(data.message); return; }
    setAssessment({ id: data.assessment_id, skill });
    localStorage.setItem(`sc_assessment_${profile?.user_id}`, JSON.stringify({ id: data.assessment_id, skill }));
    const q = data.question;
    setCurrentQuestion({ question_id: q._id, question: q.question, domain: q.domain, level: q.level });
    setPage("assessment");
  }

  async function submitAnswer() {
    if (!assessment || !currentQuestion || !answer.trim()) { setError(t.required); return; }
    const evaluated = await run(() => api("/ai/assessment/evaluate", {
      method: "POST",
      body: JSON.stringify({ assessment_id: assessment.id, question_id: currentQuestion.question_id, answer: answer.trim() })
    }));
    if (!evaluated) return;
    setAnswer("");
    const next = await run(() => api("/ai/assessment/next-question", {
      method: "POST", body: JSON.stringify({ assessment_id: assessment.id })
    }));
    if (!next) return;
    if (next.message === "Assessment completed" || next.overall_score !== undefined) {
      const result = await run(() => api(`/ai/assessment/result/${assessment.id}`));
      setAssessmentResult(result || next);
      setWorkerStats(old => ({ ...(old || {}), assessment_completed: true, skill: assessment.skill, skill_score: (result || next).overall_score, strongest_domain: (result || next).strongest_domain }));
      setCurrentQuestion(null);
      setPage("assessmentResult");
      return;
    }
    const questionId = next.question_id || next.question?._id;
    const questionText = typeof next.question === "string" ? next.question : next.question?.question;
    if (!questionId || !questionText) { setError(t.noQuestion); return; }
    setCurrentQuestion({ question_id: questionId, question: questionText, domain: next.domain, level: next.level });
  }

  function speakQuestion() {
    if (!currentQuestion?.question || !("speechSynthesis" in window)) {
      setError("Read aloud is not supported in this browser."); return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQuestion.question);
    const tamilScript = /[\u0B80-\u0BFF]/.test(currentQuestion.question);
    utterance.lang = tamilScript ? "ta-IN" : "en-IN";
    window.speechSynthesis.speak(utterance);
  }

  async function toggleRecording() {
    if (recording) {
      recorderRef.current?.stop();
      setRecording(false);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError("Audio recording is not supported in this browser. Try Chrome on HTTPS or localhost."); return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        if (recordingTimerRef.current) window.clearTimeout(recordingTimerRef.current);
        recordingTimerRef.current = null;
        stream.getTracks().forEach(track => track.stop());
        const mime = recorder.mimeType || "audio/webm";
        const audioBlob = new Blob(chunksRef.current, { type: mime });
        const form = new FormData();
        if (!audioBlob.size) { setError("No audio was recorded. Please try again."); return; }
        form.append("file", audioBlob, "answer.webm");
        setTranscribing(true);
        try {
          const result = await api("/ai/assessment/speech/transcribe", { method: "POST", body: form });
          if (result.text) { setAnswer(old => old ? `${old} ${result.text}` : result.text); flash(t.transcriptReady); }
          else setError("No speech was detected. Please try again or type your answer.");
        } catch (e) { setError(e.message || "Audio transcription failed. You can type your answer instead."); }
        finally { setTranscribing(false); }
      };
      recorder.start();
      recordingTimerRef.current = window.setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
          setRecording(false);
          flash("Recording stopped after 60 seconds. Transcribing your answer…");
        }
      }, 60000);
      setRecording(true);
    } catch {
      setError("Microphone permission was denied or no microphone was found.");
    }
  }

  async function markNotificationRead(item) {
    const result = await run(() => api(`/notifications/${item.notification_id}/read`, { method: "PATCH" }));
    if (result) setNotifications(items => items.map(n => n.notification_id === item.notification_id ? { ...n, read: true } : n));
  }

  async function saveProfile(e) {
    e.preventDefault();
    const payload = {
      name: profileForm.name, email: profileForm.email, phone: profileForm.phone,
      latitude: Number(profileForm.latitude), longitude: Number(profileForm.longitude)
    };
    const data = await run(() => api("/users/me", { method: "PATCH", body: JSON.stringify(payload) }));
    if (data) { const emailChanged = user?.email !== data.user.email; setProfile(data.user); setUser(data.user); flash(t.updateSuccess); if (emailChanged) { localStorage.removeItem("sc_token"); setToken(""); setPage("login"); } else { setPage(user.role === "worker" ? "worker" : "home"); } }
  }

  async function useLocation(setForm) {
    if (!navigator.geolocation) { setError("Location is not available in this browser."); return; }
    navigator.geolocation.getCurrentPosition(
      position => setForm(old => ({ ...old, latitude: position.coords.latitude.toFixed(6), longitude: position.coords.longitude.toFixed(6) })),
      () => setError("Location permission was not granted. You can enter coordinates manually.")
    );
  }

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="app-shell">
      {page !== "home" && <Navbar
        t={t} user={user} page={page} setPage={setPage}
        language={language} setLanguage={setLanguage}
        menuOpen={menuOpen} setMenuOpen={setMenuOpen}
        unread={unread} onLogout={logout}
      />}

      <main className="main-content">
        {error && <div className="alert alert-error"><CircleHelp size={18} /><span>{error}</span><button onClick={() => setError("")}><X size={16} /></button></div>}
        {notice && <div className="alert alert-success"><CheckCircle2 size={18} /><span>{notice}</span></div>}
        {loading && <div className="loading-line"><span />{t.loading}</div>}

        {authChecking && <div className="loading-line"><span />Checking your session…</div>}
        {!authChecking && !user && page !== "register" && page !== "login" && <AuthPage t={t} mode="login" onLogin={login} onSwitch={() => { setError(""); setPage("register"); }} onLocation={useLocation} />}
        {!authChecking && !user && page === "login" && <AuthPage t={t} mode="login" onLogin={login} onSwitch={() => { setError(""); setPage("register"); }} onLocation={useLocation} />}
        {!authChecking && !user && page === "register" && <AuthPage t={t} mode="register" onRegister={register} onSwitch={() => { setError(""); setPage("login"); }} onLocation={useLocation} />}

        {!authChecking && user?.role === "customer" && page === "home" && <CustomerHome t={t} categories={categories} onSelect={openCatalogue} />}
        {!authChecking && user?.role === "customer" && page === "catalogue" && <Catalogue t={t} language={language} category={selectedCategory} services={services} selected={selectedService} setSelected={setSelectedService} onBack={() => setPage("home")} onFind={searchWorkers} onLocation={useLocation} user={user} />}
        {!authChecking && user?.role === "customer" && page === "recommendations" && <Recommendations t={t} language={language} workers={workers} service={selectedService} requestDetails={serviceRequest} onBack={() => setPage("catalogue")} onBook={createBooking} profile={profile} />}
        {!authChecking && user?.role === "worker" && page === "worker" && <WorkerDashboard t={t} stats={workerStats} profile={profile} onStart={startAssessment} onOrders={() => setPage("orders")} />}
        {!authChecking && user && page === "orders" && <OrdersPage t={t} role={user.role} bookings={bookings} onRefresh={refreshBookings} onRespond={updateBooking} onCancel={updateBooking} onComplete={updateBooking} onPayment={markPayment} onReview={submitReview} />}
        {!authChecking && user && page === "notifications" && <NotificationsPage t={t} notifications={notifications} onRead={markNotificationRead} />}
        {!authChecking && user && page === "profile" && <ProfilePage t={t} profileForm={profileForm} setProfileForm={setProfileForm} onSave={saveProfile} onLocation={useLocation} />}
        {!authChecking && user?.role === "worker" && page === "assessment" && <AssessmentPage t={t} skill={assessment?.skill} question={currentQuestion} answer={answer} setAnswer={setAnswer} onSubmit={submitAnswer} onRead={speakQuestion} recording={recording} transcribing={transcribing} onRecord={toggleRecording} />}
        {!authChecking && user?.role === "worker" && page === "assessmentResult" && <AssessmentResult t={t} result={assessmentResult} onHome={() => setPage("worker")} />}
      </main>

      <footer className="footer"><span>© {new Date().getFullYear()} Skill Connect</span><span>{language === "en" ? "Local services, connected simply." : "உள்ளூர் சேவைகள், எளிதாக இணைக்கப்படுகின்றன."}</span></footer>
    </div>
  );
}

