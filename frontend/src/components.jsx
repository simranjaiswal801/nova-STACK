import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Asterisk,
  Braces,
  Check,
  Code2,
  Layers3,
  Menu,
  Moon,
  Palette,
  Sun,
  X,
  Zap,
  Globe2,
  Server,
  Sparkles,
  Smartphone,
  Megaphone,
  Search,
  Cloud,
  Wrench,
  ShoppingBag,
  ChartNoAxesCombined,
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "./lib/api.js";
import { useAuth } from "./auth/AuthContext.jsx";
import { useServices } from "./services/ServicesContext.jsx";

const icons = {
  web: Globe2,
  design: Palette,
  code: Code2,
  stack: Layers3,
  server: Server,
  spark: Sparkles,
  mobile: Smartphone,
  megaphone: Megaphone,
  search: Search,
  cloud: Cloud,
  wrench: Wrench,
  store: ShoppingBag,
  chart: ChartNoAxesCombined,
};
export function Logo({ light = false }) {
  return (
    <Link
      className={`brand ${light ? "brand-light" : ""}`}
      to="/"
      aria-label="NovaStack home"
    >
      <span className="brand-mark">
        <Asterisk size={25} strokeWidth={2.3} />
      </span>
      <span className="brand-copy">
        <span className="brand-name"><span className="brand-nova">nova</span><span className="brand-divider">/</span><span className="brand-strong">STACK</span></span>
        <small>Digital Solutions & Technology</small>
      </span>
    </Link>
  );
}
export function Button({ to, children, variant = "primary", ...props }) {
  return to ? (
    <Link className={`button ${variant}`} to={to} {...props}>
      {children}
      <ArrowUpRight size={16} />
    </Link>
  ) : (
    <button className={`button ${variant}`} {...props}>
      {children}
    </button>
  );
}
export function SectionHeading({ eyebrow, title, text, light = false }) {
  return (
    <div className={`section-heading ${light ? "on-dark" : ""}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}
export function ServiceCard({ item, index }) {
  const Icon = icons[item.icon] || Code2;
  return (
    <motion.article
      className="service-card"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ delay: index * 0.055, duration: 0.45 }}
    >
      <div className="service-top">
        <span>{item.n}</span>
        <Icon size={21} strokeWidth={1.7} />
      </div>
      <h3>{item.title}</h3>
      <p>{item.text}</p>
      <div className="tag-row">
        {item.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <Link
      to={`/services/${item.slug}`}
        className="card-link"
        aria-label={`Explore ${item.title}`}
      >
        View details <ArrowRight size={15} />
      </Link>
    </motion.article>
  );
}
export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(
    () => localStorage.getItem("novastack-theme") || "light",
  );
  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("novastack-theme", next);
  };
  return (
    <header className="navbar">
      <div className="nav-inner">
        <Logo />
        <nav
          className={open ? "nav-links open" : "nav-links"}
          aria-label="Main navigation"
        >
          {[
            ["/", "Home"],
            ["/about", "About"],
            ["/services", "Services"],
            ["/contact", "Contact"],
          ].map(([to, label]) => (
            <NavLink
              key={to}
              end={to === "/"}
              to={to}
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-actions">
          <button
            className="icon-button theme-button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <Link className="nav-cta" to="/contact">
            Let’s talk <ArrowUpRight size={15} />
          </Link>
          {user?.role === "admin" && <Link className="nav-signin" to="/admin/dashboard">Admin</Link>}
          {user ? <><Link className="nav-user" to="/my-enquiries">{user.name.split(" ")[0]} <span>My enquiries</span></Link><button className="nav-signout" onClick={() => logout().catch(() => {})}>Sign out</button></> : <Link className="nav-signin" to="/login">Sign in</Link>}
          <button
            className="icon-button menu-button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div>
          <Logo light />
          <p className="footer-tagline">
            Build Better.
            <br />
            Scale Smarter.
          </p>
        </div>
        <div className="footer-nav">
          <span className="eyebrow">Explore</span>
          <Link to="/about">About us</Link>
          <Link to="/services">Services</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="footer-nav">
          <span className="eyebrow">Get in touch</span>
          <p>Have a thoughtful idea in mind?</p>
          <Link className="footer-mail" to="/contact">
            Start a conversation <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="footer-note">
          Digital Solutions
          <br />& Technology
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} NovaStack</span>
        <span>Built with intention.</span>
        <Link to="/contact">Project enquiry</Link>
      </div>
    </footer>
  );
}
export function FAQ({ items }) {
  const [active, setActive] = useState(0);
  return (
    <div className="faq-list">
      {items.map(([q, a], i) => (
        <div className={`faq-item ${active === i ? "active" : ""}`} key={q}>
          <button
            aria-expanded={active === i}
            onClick={() => setActive(active === i ? -1 : i)}
          >
            <span>{q}</span>
            <span className="faq-plus">{active === i ? "−" : "+"}</span>
          </button>
          {active === i && <p>{a}</p>}
        </div>
      ))}
    </div>
  );
}
export function EnquiryForm({ initialService = "", initialServiceSlug = "", mode = "contact", compact = false }) {
  const services = useServices();
  const { user } = useAuth();
  const initialSlug = initialServiceSlug || services.find((item) => item.title === initialService)?.slug || "";
  const [values, setValues] = useState({ name: "", email: "", subject: "", service: initialSlug, message: "", budget: "", timeline: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [formError, setFormError] = useState("");
  const update = (key, value) => { setValues((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: "" })); setFormError(""); if (status !== "loading") setStatus("idle"); };
  const errorKey = (key) => key === "fullName" ? "name" : key === "projectDescription" ? "message" : key === "serviceSlug" ? "service" : key;
  const inputField = (key, label, { required = false, type = "text", autoComplete, placeholder } = {}) => <label className="field" htmlFor={`enquiry-${key}`} key={key}><span>{label}{required && <i> *</i>}</span><input id={`enquiry-${key}`} name={key} type={type} autoComplete={autoComplete} placeholder={placeholder} value={values[key]} onChange={(event) => update(key, event.target.value)} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `enquiry-${key}-error` : undefined}/>{errors[key] && <small id={`enquiry-${key}-error`} role="alert">{errors[key]}</small>}</label>;
  const submit = async (event) => {
    event.preventDefault();
    if (status === "loading") return;
    const next = {};
    if (!values.name.trim() || values.name.trim().length < 2) next.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "Enter a valid email address.";
    if (mode === "contact" && !values.subject.trim()) next.subject = "Add a subject.";
    if (values.message.trim().length < 12) next.message = "Please add at least 12 characters.";
    if (Object.keys(next).length) { setErrors(next); return; }
    setStatus("loading"); setFormError("");
    try {
      if (mode === "enquiry") {
        await api.createEnquiry({ fullName: values.name.trim(), email: values.email.trim(), serviceSlug: values.service || initialServiceSlug, projectDescription: values.message.trim(), budgetRange: values.budget, preferredTimeline: values.timeline });
      } else {
        await api.createContact({ name: values.name.trim(), email: values.email.trim(), subject: values.subject.trim(), message: values.message.trim(), serviceSlug: values.service, budgetRange: values.budget, preferredTimeline: values.timeline });
      }
      setStatus("success");
    } catch (error) {
      const mapped = Object.fromEntries(Object.entries(error.fieldErrors || {}).map(([key, message]) => [errorKey(key), message]));
      setErrors((current) => ({ ...current, ...mapped }));
      setFormError(error.message || "Submission failed. Please try again.");
      setStatus("error");
    }
  };
  return <form className={`contact-form enquiry-form ${compact ? "compact" : ""}`} onSubmit={submit} noValidate>
    {status === "success" && <div className="form-success" role="status"><Check size={18}/><span>{mode === "enquiry" ? user ? "Your project enquiry has been saved and linked to your account. You can view it in My Enquiries." : "Your project enquiry has been saved for the NovaStack team. Because you submitted as a guest, it is not linked to a personal My Enquiries history." : "Your contact message has been saved. It has not been emailed; notification delivery is outside this phase."}</span></div>}
    {status === "error" && formError && <div className="form-error" role="alert">{formError} Your entries are still here; please correct any marked fields and retry.</div>}
    <div className="form-row">{inputField("name", "Full name", { required: true, autoComplete: "name", placeholder: "Your name" })}{inputField("email", "Email address", { required: true, type: "email", autoComplete: "email", placeholder: "you@example.com" })}</div>
    <div className="form-row">{mode === "contact" && inputField("subject", "Subject", { required: true, placeholder: "What would you like to discuss?" })}<label className="field" htmlFor="enquiry-service"><span>{mode === "enquiry" ? "Selected service" : "Service of interest"}</span><select id="enquiry-service" value={values.service} onChange={(event) => update("service", event.target.value)} aria-invalid={!!errors.service} aria-describedby={errors.service ? "enquiry-service-error" : undefined}><option value="">{mode === "enquiry" ? "Choose a service" : "No specific service"}</option>{services.map((service) => <option key={service.slug} value={service.slug}>{service.title}</option>)}</select>{errors.service && <small id="enquiry-service-error" role="alert">{errors.service}</small>}</label></div>
    <label className="field" htmlFor="enquiry-message"><span>{mode === "enquiry" ? "Project description" : "Your message"} <i>*</i></span><textarea id="enquiry-message" rows={compact ? 4 : 5} value={values.message} onChange={(event) => update("message", event.target.value)} placeholder="Goals, requirements, or questions…" aria-invalid={!!errors.message} aria-describedby={errors.message ? "enquiry-message-error" : undefined}/>{errors.message && <small id="enquiry-message-error" role="alert">{errors.message}</small>}</label>
    <div className="form-row"><label className="field" htmlFor="enquiry-budget"><span>Budget range <i>(optional)</i></span><select id="enquiry-budget" value={values.budget} onChange={(event) => update("budget", event.target.value)}><option value="">Select a range</option><option>Under $1,000</option><option>$1,000–$5,000</option><option>$5,000–$15,000</option><option>$15,000+</option><option>Still exploring</option></select></label><label className="field" htmlFor="enquiry-timeline"><span>Preferred timeline <i>(optional)</i></span><select id="enquiry-timeline" value={values.timeline} onChange={(event) => update("timeline", event.target.value)}><option value="">Select a timeline</option><option>As soon as practical</option><option>Within 1–2 months</option><option>Within 3–6 months</option><option>Flexible</option></select></label></div>
    <p className="form-privacy">Required fields are marked with *. {mode === "enquiry" && !user ? <>Sign in before submitting if you want this enquiry to appear in <Link to="/login">My Enquiries</Link>. Guest enquiries still reach the NovaStack team.</> : "Submissions are saved only after the API confirms success."}</p><button className="button primary" type="submit" disabled={status === "loading" || status === "success"}>{status === "loading" ? "Saving securely…" : status === "success" ? "Saved successfully" : mode === "enquiry" ? "Submit project enquiry" : "Send contact message"}<ArrowUpRight size={16}/></button>
  </form>;
}
export function ScrollTop() {
  const [show, setShow] = useState(false);
  if (typeof window !== "undefined" && !window.__novastackScroll) {
    window.__novastackScroll = true;
    window.addEventListener(
      "scroll",
      () => {
        document.documentElement.classList.toggle(
          "scrolled",
          window.scrollY > 500,
        );
      },
      { passive: true },
    );
  }
  return (
    <button
      className="scroll-top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
    >
      <ArrowDownRight size={18} />
    </button>
  );
}
