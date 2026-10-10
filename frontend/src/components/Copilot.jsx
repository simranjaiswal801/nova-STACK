import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { faqs as generalFaqs } from "../data.js";
import { useServices } from "../services/ServicesContext.jsx";

const stopWords = new Set(["a", "an", "and", "are", "can", "do", "for", "how", "i", "in", "is", "it", "me", "my", "of", "on", "or", "the", "to", "what", "with", "you", "your"]);
const words = (value) => String(value).toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter((word) => word.length > 2 && !stopWords.has(word));

function answerFor(question, services) {
  const query = question.toLowerCase();
  const tokens = words(question);
  const aliases = { "web-development": ["website", "web site", "landing page"], "mobile-app-development": ["mobile app", "android app", "ios app"], "ui-ux-design": ["interface design", "user experience", "wireframe", "prototype"], "backend-api-development": ["backend", "api"], "ecommerce-solutions": ["ecommerce", "e-commerce", "online store", "shopping site"], "seo-optimization": ["search ranking", "search engine"] };
  const selected = services.find((service) => query.includes(service.title.toLowerCase()) || query.includes(service.slug.replaceAll("-", " ")) || (aliases[service.slug] || []).some((alias) => query.includes(alias)));
  if (selected) return { text: `${selected.title}: ${selected.text} Deliverables include ${selected.deliverables.slice(0, 3).join(", ")}.`, link: `/services/${selected.slug}`, label: `Explore ${selected.title}` };

  if (/\b(contact|enquir|project|talk|reach|email)\b/.test(query)) return { text: "Use our contact page or submit a project enquiry from any service page. Successful submissions are saved to the NovaStack database; email notifications are not configured.", link: "/contact", label: "Open contact page" };
  if (/\b(login|log in|sign in|account|register|password|history|my enquir)\b/.test(query)) return { text: "Sign in or create a user account to review enquiries submitted while signed in. Guest enquiries reach the NovaStack team but are not linked to a personal history.", link: "/login", label: "Sign in" };
  if (/\b(process|workflow|steps|start|begin)\b/.test(query)) return { text: "Projects begin with a discussion of goals, users, constraints, and desired outcomes. We then agree the scope, plan the work, build and review it, and prepare a handover.", link: "/about", label: "See how we work" };
  if (/\b(price|pricing|cost|budget|quote)\b/.test(query)) return { text: "Project pricing depends on the agreed scope, requirements, and timeline. There is no fixed price list on the site; share your goals and we can discuss a suitable scope.", link: "/contact", label: "Discuss your project" };

  const knowledge = [
    ...services.flatMap((service) => (service.faqs || []).map(([questionText, answerText]) => ({ question: questionText, answer: answerText, service }))),
    ...generalFaqs.map(([questionText, answerText]) => ({ question: questionText, answer: answerText, service: null })),
  ];
  let best = null;
  let bestScore = 0;
  for (const item of knowledge) {
    const haystack = words(`${item.question} ${item.answer} ${item.service?.title || ""} ${item.service?.tags?.join(" ") || ""}`);
    const score = tokens.reduce((sum, token) => sum + (haystack.includes(token) ? 1 : 0), 0);
    if (score > bestScore) { best = item; bestScore = score; }
  }
  if (best && bestScore >= Math.min(2, Math.max(1, tokens.length))) return { text: best.answer, ...(best.service ? { link: `/services/${best.service.slug}`, label: `Explore ${best.service.title}` } : {}) };
  return { text: "I can help with NovaStack services, project enquiries, how we work, pricing expectations, and account questions. Try asking about a service or choose a suggestion below." };
}

export default function Copilot() {
  const services = useServices();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([{ role: "assistant", text: "Hi, I’m the NovaStack Copilot. Ask me about our services, project process, or how to get in touch." }]);
  const endRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    endRef.current?.scrollIntoView({ block: "nearest" });
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, messages]);

  const ask = (value = draft) => {
    const question = value.trim();
    if (!question) return;
    const answer = answerFor(question, services);
    setMessages((current) => [...current, { role: "user", text: question }, { role: "assistant", ...answer }]);
    setDraft("");
  };

  return <aside className="copilot-widget" aria-label="NovaStack help">
    {open && <section className="copilot-panel" id="novastack-copilot-panel" aria-label="NovaStack Copilot chat">
      <header className="copilot-header"><span className="copilot-avatar"><Bot size={20}/></span><div><strong>NovaStack Copilot</strong><small><i/> Available for website help</small></div><button type="button" className="copilot-close" onClick={() => setOpen(false)} aria-label="Close Copilot"><X size={18}/></button></header>
      <div className="copilot-messages" aria-live="polite">
        {messages.map((message, index) => <div className={`copilot-message ${message.role}`} key={`${message.role}-${index}`}><span>{message.text}</span>{message.link && <Link to={message.link} onClick={() => setOpen(false)}>{message.label}<ArrowUpRight size={14}/></Link>}</div>)}
        {messages.length === 1 && <div className="copilot-suggestions"><button type="button" onClick={() => ask("Which service is right for a website?")}>Find a service</button><button type="button" onClick={() => ask("How do I submit a project enquiry?")}>Submit an enquiry</button><button type="button" onClick={() => ask("How does your project process work?")}>Project process</button></div>}
        <div ref={endRef}/>
      </div>
      <form className="copilot-compose" onSubmit={(event) => { event.preventDefault(); ask(); }}><label className="sr-only" htmlFor="copilot-question">Ask NovaStack Copilot</label><input id="copilot-question" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask about NovaStack…" maxLength={400}/><button type="submit" disabled={!draft.trim()} aria-label="Send question"><Send size={17}/></button></form>
      <p className="copilot-disclaimer"><Sparkles size={12}/> Local help preview · No AI provider is connected yet.</p>
    </section>}
    <button type="button" className={`copilot-launcher ${open ? "active" : ""}`} onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="novastack-copilot-panel" aria-label={open ? "Close NovaStack Copilot" : "Open NovaStack Copilot"}>{open ? <X size={20}/> : <><MessageCircle size={20}/><span>Ask Copilot</span></>}</button>
  </aside>;
}
