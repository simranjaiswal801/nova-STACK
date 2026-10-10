import React, { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Check, FolderOpen, LogIn } from "lucide-react";
import { api } from "../lib/api.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { services } from "../data.js";
import { Button } from "../components.jsx";

function AuthShell({ title, eyebrow, children, footer }) {
  return <section className="auth-page"><div className="auth-orbit"/><div className="auth-card"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p className="auth-intro">Your NovaStack workspace starts here.</p>{children}<div className="auth-footer">{footer}</div></div></section>;
}
export function AuthPage({ mode = "login" }) {
  const registering = mode === "register";
  const { user, loading, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { document.title = `${registering ? "Create account" : "Sign in"} | NovaStack`; }, [registering]);
  if (loading) return <section className="state-page"><div className="state-message">Restoring your session…</div></section>;
  if (user) return <Navigate to="/my-enquiries" replace/>;
  const update = (key, value) => { setValues((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: "" })); setFormError(""); };
  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    const next = {};
    if (registering && values.name.trim().length < 2) next.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "Enter a valid email address.";
    if (registering && (values.password.length < 10 || new TextEncoder().encode(values.password).length > 72 || !/[a-z]/.test(values.password) || !/[A-Z]/.test(values.password) || !/[0-9]/.test(values.password))) next.password = "Use 10+ characters with uppercase, lowercase, and a number (maximum 72 UTF-8 bytes).";
    if (!registering && !values.password) next.password = "Enter your password.";
    if (registering && values.password !== values.confirmPassword) next.confirmPassword = "Passwords do not match.";
    setErrors(next); setFormError("");
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      if (registering) await register({ name: values.name.trim(), email: values.email.trim(), password: values.password });
      else await login({ email: values.email.trim(), password: values.password });
      navigate(location.state?.from || "/my-enquiries", { replace: true });
    } catch (error) { setErrors(error.fieldErrors || {}); setFormError(error.message || "Authentication failed. Please try again."); }
    finally { setBusy(false); }
  };
  const field = (key, label, type = "text", autoComplete = "") => <label className="field" htmlFor={`auth-${key}`} key={key}><span>{label} <i>*</i></span><input id={`auth-${key}`} name={key} type={type} autoComplete={autoComplete} value={values[key]} onChange={(event) => update(key, event.target.value)} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `auth-${key}-error` : undefined}/>{errors[key] && <small id={`auth-${key}-error`} role="alert">{errors[key]}</small>}</label>;
  return (
    <AuthShell
      eyebrow={registering ? "CREATE YOUR ACCOUNT" : "WELCOME BACK"}
      title={registering ? "Join NovaStack." : "Sign in to continue."}
      footer={
        <>
          {registering ? (
            <>
              Already have an account?{" "}
              <Link to="/login">
                Sign in <ArrowRight size={14} />
              </Link>
            </>
          ) : (
            <>
              New to NovaStack?{" "}
              <Link to="/register">
                Create an account <ArrowRight size={12} />
              </Link>
            </>
          )}
          <br />
          <br />
          
          <span>Admin?</span>{" "}
          <Link to="/admin/login">
            Admin sign in <ArrowRight size={12} />
          </Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={submit} noValidate>
        {formError && (
          <div className="form-error" role="alert">
            {formError}
          </div>
        )}
        {registering && field("name", "Full name", "text", "name")}
        {field("email", "Email address", "email", "email")}
        {field(
          "password",
          "Password",
          "password",
          registering ? "new-password" : "current-password",
        )}
        {registering &&
          field(
            "confirmPassword",
            "Confirm password",
            "password",
            "new-password",
          )}
        {registering && (
          <p className="form-privacy">
            Use at least 10 characters with an uppercase letter, a lowercase
            letter, and a number.
          </p>
        )}
        <button type="submit" className="button primary" disabled={busy}>
          {busy ? "Please wait…" : registering ? "Create account" : "Sign in"}
          <ArrowUpRight size={16} />
        </button>
      </form>
    </AuthShell>
  );
}

export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <section className="state-page"><span className="eyebrow">CHECKING YOUR SESSION</span><div className="state-message">Restoring your NovaStack session…</div></section>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }}/>;
  return children;
}

export function MyEnquiries() {
  const { user } = useAuth();
  const [state, setState] = useState({ loading: true, error: "", enquiries: [], pagination: null });
  useEffect(() => { document.title = "My enquiries | NovaStack"; }, []);
  useEffect(() => { let active = true; api.myEnquiries().then((data) => { if (active) setState({ loading: false, error: "", enquiries: data.enquiries, pagination: data.pagination }); }).catch((error) => { if (active) setState({ loading: false, error: error.message, enquiries: [], pagination: null }); }); return () => { active = false; }; }, []);
  return <section className="state-page enquiries-page"><div className="container"><span className="eyebrow">YOUR NOVASTACK WORKSPACE</span><h1>My enquiries<span>.</span></h1><p className="enquiries-welcome">Signed in as {user.name} · {user.email}</p>{state.loading ? <div className="state-message">Loading your enquiries…</div> : state.error ? <div className="state-message error-state" role="alert">{state.error} <button onClick={() => window.location.reload()}>Reload the page</button></div> : state.enquiries.length ? <div className="enquiry-history">{state.enquiries.map((item) => { const service = services.find((entry) => entry.slug === item.serviceSlug); return <article key={item._id}><div><span className="eyebrow">{new Date(item.createdAt).toLocaleDateString()} · {item.status}</span><h2>{item.serviceName}</h2><p>{item.projectDescription}</p></div>{service && <Link to={`/services/${service.slug}`}>View service <ArrowRight size={15}/></Link>}</article>; })}</div> : <div className="empty-enquiries"><FolderOpen size={25}/><h2>No account enquiries yet.</h2><p>Enquiries submitted while signed out are delivered to the NovaStack team but aren’t linked to your personal history. Browse a service and submit while signed in to track it here.</p><Button to="/services">Explore services</Button></div>}</div></section>;
}
