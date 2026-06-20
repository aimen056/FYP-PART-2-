import React, { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const ParticleCanvas = lazy(() => import("../components/ui/ParticleCanvas"));

const AQI_LEVELS = [
  { label: "Good", color: "#00E400", range: "0–50" },
  { label: "Moderate", color: "#FFFF00", range: "51–100" },
  { label: "Unhealthy (Sensitive)", color: "#FF7E00", range: "101–150" },
  { label: "Unhealthy", color: "#FF0000", range: "151–200" },
  { label: "Very Unhealthy", color: "#8F3F97", range: "201–300" },
  { label: "Hazardous", color: "#7E0023", range: "301+" },
];

const panelVariants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, x: -24, transition: { duration: 0.2 } },
};

const inputVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.3 } }),
};

function FloatingInput({ label, type = "text", error, index = 0, ...rest }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <motion.div custom={index} variants={inputVariants} initial="hidden" animate="visible" className="relative">
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <input
          type={isPassword && show ? "text" : type}
          className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition ${
            error ? "border-red-400 focus:ring-red-400" : "border-slate-200 dark:border-slate-600"
          }`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
          >
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </motion.div>
  );
}

function LoginForm({ onSwitch, onForgot }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      const json = await res.json();
      if (res.ok) {
        login(json.user, json.token);
        const isAdmin = json.user.email === import.meta.env.VITE_ADMIN_EMAIL;
        navigate(isAdmin ? "/dashboard" : "/userdashboard");
      } else {
        setServerError(json.error || "Login failed.");
      }
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
      <FloatingInput
        label="Email"
        type="email"
        index={0}
        placeholder="you@gmail.com"
        error={errors.email?.message}
        {...register("email", { required: "Email is required" })}
      />
      <FloatingInput
        label="Password"
        type="password"
        index={1}
        placeholder="••••••••"
        error={errors.password?.message}
        {...register("password", { required: "Password is required" })}
      />
      <div className="flex justify-between items-center text-xs">
        <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
          <input type="checkbox" className="rounded" {...register("rememberMe")} />
          Remember me
        </label>
        <button type="button" onClick={onForgot} className="text-sky-600 hover:underline">
          Forgot password?
        </button>
      </div>
      {serverError && <p className="text-xs text-red-500 text-center">{serverError}</p>}
      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="mt-2 w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold disabled:opacity-60 transition"
      >
        {isSubmitting ? "Signing in…" : "Sign In"}
      </motion.button>
      <p className="text-center text-xs text-slate-500">
        No account?{" "}
        <button type="button" onClick={onSwitch} className="text-sky-600 hover:underline font-medium">
          Create one
        </button>
      </p>
    </form>
  );
}

const REGISTER_STEPS = ["Account", "Profile", "Preferences"];

function RegisterForm({ onSwitch }) {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { country: "Pakistan", city: "Rawalpindi", wantsAlerts: false },
  });
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const password = watch("password");

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          contact: data.contact || "",
          dob: data.dob || "",
          country: data.country || "",
          city: data.city || "",
          wantsAlerts: data.wantsAlerts || false,
          ...(data.wantsAlerts && { diseases: data.diseases || [] }),
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setServerError(json.error || "Registration failed.");
      }
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 py-8"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Account created!</h3>
        <p className="text-sm text-slate-500 text-center">Redirecting to login…</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
      {/* Progress indicator */}
      <div className="flex gap-2 mb-2">
        {REGISTER_STEPS.map((s, i) => (
          <div key={s} className="flex-1 flex flex-col items-center gap-1">
            <div className={`h-1.5 w-full rounded-full transition-colors ${i <= step ? "bg-sky-500" : "bg-slate-200 dark:bg-slate-700"}`} />
            <span className={`text-[10px] font-medium ${i === step ? "text-sky-600" : "text-slate-400"}`}>{s}</span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step0" variants={panelVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-3">
            <FloatingInput label="Full Name" index={0} placeholder="Aimen Ahmed"
              error={errors.name?.message}
              {...register("name", { required: "Name is required" })} />
            <FloatingInput label="Email" type="email" index={1} placeholder="you@gmail.com"
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^[a-zA-Z0-9._%+-]+@gmail\.com$/, message: "Must be a Gmail address" }
              })} />
            <FloatingInput label="Password" type="password" index={2} placeholder="Min 8 characters"
              error={errors.password?.message}
              {...register("password", { required: "Password is required", minLength: { value: 8, message: "Min 8 characters" } })} />
            <FloatingInput label="Confirm Password" type="password" index={3} placeholder="Repeat password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword", { validate: (v) => v === password || "Passwords don't match" })} />
            <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => setStep(1)}
              className="mt-2 w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition">
              Next →
            </motion.button>
          </motion.div>
        )}
        {step === 1 && (
          <motion.div key="step1" variants={panelVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <FloatingInput label="Contact" index={0} placeholder="+92 300 0000000" {...register("contact")} />
              <FloatingInput label="Date of Birth" type="date" index={1} {...register("dob")} />
              <FloatingInput label="City" index={2} placeholder="Rawalpindi" {...register("city")} />
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Country</label>
                <select className="w-full rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  {...register("country")}>
                  <option value="Pakistan">Pakistan</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={() => setStep(0)} className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-600 dark:text-slate-300">
                ← Back
              </button>
              <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setStep(2)}
                className="flex-1 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition">
                Next →
              </motion.button>
            </div>
          </motion.div>
        )}
        {step === 2 && (
          <motion.div key="step2" variants={panelVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              <input type="checkbox" className="rounded" {...register("wantsAlerts")} />
              Receive air quality alerts
            </label>
            {watch("wantsAlerts") && (
              <div className="flex flex-col gap-2 pl-3 border-l-2 border-sky-200">
                <p className="text-xs text-slate-500">Select applicable conditions:</p>
                {["Respiratory Diseases", "Cardiovascular Conditions", "Chronic Illnesses"].map((d) => (
                  <label key={d} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input type="checkbox" value={d} className="rounded" {...register("diseases")} />
                    {d}
                  </label>
                ))}
              </div>
            )}
            {serverError && <p className="text-xs text-red-500 text-center">{serverError}</p>}
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-600 dark:text-slate-300">
                ← Back
              </button>
              <motion.button type="submit" disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60 transition">
                {isSubmitting ? "Creating…" : "Create Account"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-center text-xs text-slate-500">
        Already have an account?{" "}
        <button type="button" onClick={onSwitch} className="text-sky-600 hover:underline font-medium">
          Sign in
        </button>
      </p>
    </form>
  );
}

function ForgotForm({ onBack }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (data) => {
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      if (res.ok) setSent(true);
      else { const j = await res.json(); setError(j.error || "Failed."); }
    } catch { setError("Network error."); }
  };

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">Reset link sent! Check your inbox.</p>
        <button onClick={onBack} className="text-xs text-sky-600 hover:underline">Back to login</button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Reset Password</h3>
        <p className="text-xs text-slate-500">Enter your email and we'll send a reset link.</p>
      </div>
      <FloatingInput label="Email" type="email" index={0} placeholder="you@gmail.com"
        {...register("email", { required: "Email is required" })} />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <motion.button type="submit" disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold disabled:opacity-60 transition">
        {isSubmitting ? "Sending…" : "Send Reset Link"}
      </motion.button>
      <button type="button" onClick={onBack} className="text-center text-xs text-sky-600 hover:underline">
        ← Back to login
      </button>
    </form>
  );
}

const LoginPage = () => {
  const [view, setView] = useState("login");

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* LEFT PANEL */}
      <div className="relative md:w-1/2 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex flex-col justify-center items-center p-8 md:p-12 overflow-hidden min-h-[220px] md:min-h-screen">
        <Suspense fallback={null}>
          <ParticleCanvas />
        </Suspense>

        <div className="relative z-10 flex flex-col items-center text-center gap-6 max-w-xs w-full">
          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              AIR<span className="text-sky-400">GUARD</span>
            </span>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-sky-200/80 text-sm leading-relaxed">
            Real-time Air Quality Intelligence<br className="hidden md:block" /> for Rawalpindi & Islamabad
          </motion.p>

          {/* Pulsing AQI rings */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
            className="relative w-28 h-28 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-sky-400/20 animate-ping" style={{ animationDuration: "2s" }} />
            <div className="absolute inset-2 rounded-full border border-sky-400/15 animate-ping" style={{ animationDuration: "2.8s", animationDelay: "0.3s" }} />
            <div className="w-20 h-20 rounded-full bg-sky-500/20 backdrop-blur border border-sky-400/30 flex items-center justify-center">
              <span className="text-sky-300 font-bold text-base" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>AQI</span>
            </div>
          </motion.div>

          {/* AQI scale */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="w-full flex flex-col gap-1.5">
            {AQI_LEVELS.map((lvl) => (
              <div key={lvl.label} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: lvl.color }} />
                <span className="text-sky-200/70 flex-1 text-left">{lvl.label}</span>
                <span className="text-sky-300/50">{lvl.range}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12 bg-white dark:bg-slate-900 min-h-screen">
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {view === "login" && (
              <motion.div key="login" variants={panelVariants} initial="initial" animate="animate" exit="exit">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Welcome back
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Sign in to your AirGuard account</p>
                </div>
                <LoginForm onSwitch={() => setView("register")} onForgot={() => setView("forgot")} />
              </motion.div>
            )}
            {view === "register" && (
              <motion.div key="register" variants={panelVariants} initial="initial" animate="animate" exit="exit">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Create account
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Join AirGuard — monitor the air you breathe</p>
                </div>
                <RegisterForm onSwitch={() => setView("login")} />
              </motion.div>
            )}
            {view === "forgot" && (
              <motion.div key="forgot" variants={panelVariants} initial="initial" animate="animate" exit="exit">
                <ForgotForm onBack={() => setView("login")} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
