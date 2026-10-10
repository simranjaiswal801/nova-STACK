import React, { useEffect, useState } from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Command,
  Compass,
  Layers2,
  MoveUpRight,
  Quote,
  Sparkles,
  Target,
  Workflow,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { services, projects, faqs, serviceGroups } from "./data.js";
import {
  Navbar,
  Footer,
  Button,
  SectionHeading,
  ServiceCard,
  FAQ,
  ScrollTop,
  EnquiryForm,
} from "./components.jsx";
import ServiceDetails from "./ServiceDetails.jsx";
import Copilot from "./components/Copilot.jsx";
import { AuthPage, RequireAuth, MyEnquiries } from "./pages/AuthPages.jsx";
import { ServicesProvider, useServices } from "./services/ServicesContext.jsx";
import { AdminLogin, AdminRegister, AdminGuard, AdminOverview, AdminEnquiries, AdminServices, AdminUsers, AdminMessages, AdminSettings } from "./pages/AdminPages.jsx";

function PageMeta({ title, description }) {
  useEffect(() => {
    document.title = `${title} | NovaStack`;
    const d = document.querySelector('meta[name="description"]');
    if (d) d.content = description;
  }, [title, description]);
  return null;
}
function Frame({ children }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  if (isAdmin) return <AnimatePresence mode="wait"><motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>{children}</motion.div></AnimatePresence>;
  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
      <ScrollTop />
      <Copilot />
    </>
  );
}
function HeroVisual() {
  return (
    <div className="hero-visual" aria-label="Abstract orbital illustration">
      <div className="visual-orbit orbit-a" />
      <div className="visual-orbit orbit-b" />
      <div className="visual-orbit orbit-c" />
      <div className="visual-center">
        <div className="center-grid" />
        <Command size={42} strokeWidth={1.2} />
        <span>
          Thoughtfully
          <br />
          engineered
        </span>
      </div>
      <div className="orbit-node node-a">
        <Code2Mark />
      </div>
      <div className="orbit-node node-b">
        <Layers2 size={19} />
      </div>
      <div className="orbit-node node-c">
        <Sparkles size={18} />
      </div>
      <div className="visual-caption">
        IDEAS → IMPACT <span>01—06</span>
      </div>
    </div>
  );
}
function Code2Mark() {
  return <span className="code-mark">&lt;/&gt;</span>;
}
function ProjectCard({ project, index }) {
  return (
    <article className={`project-card art-${project.art}`}>
      <div className="project-art">
        <div className="art-window">
          <div className="art-bar">
            <i />
            <i />
            <i />
            <span>
              {index === 0
                ? "orbit.app"
                : index === 1
                  ? "northstar.co"
                  : "formandfield"}
            </span>
          </div>
          <div className="art-content">
            <div className="art-sidebar" />
            <div className="art-main">
              <span className="art-kicker">{project.category}</span>
              <b>{project.name}</b>
              <div className="art-lines">
                <i />
                <i />
                <i />
              </div>
              <div className="art-chart" />
            </div>
          </div>
        </div>
        <span className="project-number">0{index + 1}</span>
      </div>
      <div className="project-copy">
        <div>
          <span className="eyebrow">
            {project.type} · {project.category}
          </span>
          <h3>{project.name}</h3>
          <p>{project.description}</p>
        </div>
        <span className="project-arrow">
          <ArrowUpRight size={18} />
        </span>
      </div>
    </article>
  );
}
function Home() {
  const services = useServices();
  return (
    <>
      <PageMeta
        title="Build Better. Scale Smarter."
        description="NovaStack builds thoughtful digital products, from polished interfaces to scalable web applications."
      />
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow hero-eyebrow">
              <span className="status-dot" /> DIGITAL SOLUTIONS & TECHNOLOGY
            </div>
            <h1>
              Build better.
              <br />
              <span>Scale smarter.</span>
            </h1>
            <p className="hero-text">
              We turn ambitious ideas into clear, capable digital
              experiences—designed with purpose and built for what comes next.
            </p>
            <div className="hero-buttons">
              <Button to="/services">Explore our services</Button>
              <Button to="/contact" variant="secondary">
                Discuss your project <ArrowRight size={15} />
              </Button>
            </div>
            <div className="hero-proof">
              <div className="proof-spark">
                <Sparkles size={15} />
              </div>
              <span>
                Thoughtful by design.
                <br />
                <b>Ready for what’s next.</b>
              </span>
              <ArrowDown size={15} />
            </div>
          </div>
          <HeroVisual />
        </div>
        <div className="hero-foot container">
          <span>INDEPENDENT DIGITAL STUDIO</span>
          <span>
            DESIGN <i /> DEVELOPMENT <i /> DELIVERY
          </span>
        </div>
      </section>
      <section className="section services-section">
        <div className="container">
          <div className="section-intro">
            <SectionHeading
              eyebrow="WHAT WE DO · 01—06"
              title={
                <>
                  Good ideas deserve
                  <br />a great digital home.
                </>
              }
              text="From the first sketch to the final line of code, we bring design and technology together to help your next step feel simple."
            />
            <Link className="text-link" to="/services">
              All services <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="service-grid">
            {services.slice(0, 6).map((item, i) => (
              <ServiceCard key={item.n} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>
      <section className="section projects-section">
        <div className="container">
          <div className="section-intro">
            <SectionHeading
              eyebrow="SELECTED WORK · CONCEPTS"
              title="Ideas, made tangible."
              text="A glimpse of the kinds of digital experiences we love shaping. These are illustrative concept projects, not client engagements."
            />
            <span className="concept-label">
              <span /> CONCEPT WORK
            </span>
          </div>
          <div className="project-grid">
            {projects.map((p, i) => (
              <ProjectCard key={p.name} project={p} index={i} />
            ))}
          </div>
        </div>
      </section>
      <section className="why-section">
        <div className="container why-grid">
          <div>
            <SectionHeading
              light
              eyebrow="WHY NOVASTACK"
              title={
                <>
                  The right details
                  <br />
                  make the difference.
                </>
              }
              text="Good technology should feel clear from the first conversation to the moment it goes live."
            />
            <Button to="/about" variant="light">
              Get to know us <ArrowUpRight size={15} />
            </Button>
          </div>
          <div className="values-list">
            {[
              [
                "01",
                "Clarity first",
                "We ask the right questions and make complex decisions feel understandable.",
              ],
              [
                "02",
                "Craft with care",
                "We sweat the details that make a product feel polished, accessible, and useful.",
              ],
              [
                "03",
                "Built to evolve",
                "We create maintainable foundations that can adapt as your needs grow.",
              ],
            ].map(([n, t, d]) => (
              <div className="value-row" key={n}>
                <span>{n}</span>
                <div>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
                <ArrowUpRight size={17} />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section process-section">
        <div className="container">
          <SectionHeading
            eyebrow="A CLEARER WAY FORWARD"
            title="From first thought to launch."
            text="A collaborative process that keeps the work focused, transparent, and moving."
          />
          <div className="process-grid">
            {[
              [
                Target,
                "01",
                "Discover",
                "Understand the people, problem, and outcomes that matter.",
              ],
              [
                Compass,
                "02",
                "Define",
                "Align on a practical scope, priorities, and direction.",
              ],
              [
                Layers2,
                "03",
                "Design & build",
                "Shape the experience, then build it with care.",
              ],
              [
                Workflow,
                "04",
                "Refine & deliver",
                "Test, improve, and hand over a foundation ready to grow.",
              ],
            ].map(([Icon, n, t, d]) => (
              <article key={n}>
                <span className="process-icon">
                  <Icon size={19} />
                </span>
                <span className="process-num">{n}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="quote-section">
        <div className="container quote-inner">
          <Quote size={27} />
          <div>
            <span className="eyebrow">OUR PROMISE</span>
            <h2>
              Make useful things.
              <br />
              <em>Make them beautifully.</em>
            </h2>
          </div>
          <span className="quote-star">✳</span>
        </div>
      </section>
      <section className="faq-preview section">
        <div className="container faq-grid">
          <SectionHeading
            eyebrow="GOOD TO KNOW"
            title="A few first questions."
            text="Want to get into the details? We’re happy to talk through your project."
          />
          <div>
            <FAQ items={faqs.slice(0, 3)} />
            <Link to="/contact" className="text-link faq-cta">
              Ask us anything <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>
      <CTA />
    </>
  );
}
function CTA() {
  return (
    <section className="cta-section">
      <div className="container cta-inner">
        <div className="cta-orbit" />
        <div>
          <span className="eyebrow">HAVE SOMETHING IN MIND?</span>
          <h2>
            Let’s make your
            <br />
            next move count.
          </h2>
          <p>
            Tell us what you’re working on. We’ll help you find a thoughtful way
            forward.
          </p>
          <Button to="/contact" variant="light">
            Start a conversation <ArrowUpRight size={16} />
          </Button>
        </div>
        <div className="cta-index">
          LET’S
          <br />
          BUILD
          <br />
          <span>01—∞</span>
        </div>
      </div>
    </section>
  );
}
function About() {
  return (
    <>
      <PageMeta
        title="About"
        description="Meet the principles and process behind NovaStack, a digital solutions and technology studio."
      />
      <PageIntro
        eyebrow="ABOUT NOVASTACK"
        title={
          <>
            Good work starts
            <br />
            with good questions.
          </>
        }
        text="NovaStack is a digital solutions and technology studio focused on making thoughtful, useful things for the web."
      />
      <section className="section about-story">
        <div className="container story-grid">
          <div className="story-art">
            <div className="story-shape shape-one" />
            <div className="story-shape shape-two" />
            <div className="story-word">
              n<span>↗</span>
            </div>
            <span className="story-caption">IDEAS, IN MOTION</span>
          </div>
          <div>
            <span className="eyebrow">OUR APPROACH</span>
            <h2>
              Make the complex
              <br />
              feel clear.
            </h2>
            <p className="lead">
              We believe the best digital work happens when strategy, design,
              and engineering move together.
            </p>
            <p>
              That means listening before drawing, choosing technology with
              intent, and shaping every interaction around the people who will
              use it. We keep collaboration close and decisions grounded in your
              goals.
            </p>
            <p>
              NovaStack is a project identity built around the work we want to
              do: useful digital products with a strong foundation and room to
              grow.
            </p>
          </div>
        </div>
      </section>
      <section className="mission-section">
        <div className="container mission-grid">
          <article>
            <Target size={22} />
            <span className="eyebrow">OUR MISSION</span>
            <h2>Build digital experiences that make progress easier.</h2>
            <p>
              We bring people and technology together to turn promising ideas
              into working, welcoming products.
            </p>
          </article>
          <article>
            <Compass size={22} />
            <span className="eyebrow">OUR VISION</span>
            <h2>A web that feels more human, useful, and considered.</h2>
            <p>
              We want every interaction to earn its place and every product to
              have a clear reason to exist.
            </p>
          </article>
        </div>
      </section>
      <section className="section values-section">
        <div className="container">
          <SectionHeading
            eyebrow="WHAT GUIDES THE WORK"
            title="Principles in practice."
          />
          <div className="principles-grid">
            {[
              [
                "01",
                "Be curious",
                "Understand the real problem before reaching for a solution.",
              ],
              [
                "02",
                "Keep it clear",
                "Make the work easy to understand, use, and maintain.",
              ],
              [
                "03",
                "Care about craft",
                "Sweat the details without losing sight of the whole.",
              ],
              [
                "04",
                "Build together",
                "Share decisions early and keep collaboration open.",
              ],
            ].map(([n, t, d]) => (
              <article key={n}>
                <span>{n}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section capability-section">
        <div className="container capability-grid">
          <div>
            <SectionHeading
              eyebrow="CAPABILITIES"
              title="A connected toolkit."
              text="A flexible set of skills for work that spans the whole digital experience."
            />
          </div>
          <div className="capability-list">
            {[
              "Product thinking & discovery",
              "Interface and experience design",
              "React and frontend engineering",
              "Node.js and API foundations",
              "Accessibility and performance",
              "Responsive quality assurance",
            ].map((x, i) => (
              <div key={x}>
                <span>0{i + 1}</span>
                {x}
                <Check size={15} />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="team-section">
        <div className="container team-grid">
          <div className="team-monogram">
            NS<span>+</span>
          </div>
          <div>
            <span className="eyebrow">A COLLABORATIVE STUDIO</span>
            <h2>Small, focused, and built around your goals.</h2>
            <p>
              NovaStack is presented as a studio identity. We don’t invent team
              biographies or claim credentials. For each engagement, the right
              people and skills should match the work.
            </p>
            <div className="hero-buttons">
              <Button to="/services" variant="light">Explore our services <ArrowUpRight size={15} /></Button>
              <Button to="/contact" variant="secondary">Talk with us <ArrowUpRight size={15} /></Button>
            </div>
          </div>
        </div>
      </section>
      <CTA />
    </>
  );
}
function PageIntro({ eyebrow, title, text }) {
  return (
    <section className="page-intro">
      <div className="container">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      <div className="intro-watermark">
        N<span>S</span>
      </div>
    </section>
  );
}
function Services() {
  const services = useServices();
  const [group, setGroup] = useState("All services");
  const visible = group === "All services" ? services : services.filter((service) => service.group === group);
  return <>
    <PageMeta title="Services" description="Explore NovaStack’s complete catalogue of 12 digital services."/>
    <PageIntro eyebrow="OUR SERVICES · 12 CAPABILITIES" title={<>Digital craft for<br/>what comes next.</>} text="Explore a focused catalogue across design, engineering, growth, and commerce. Each service can stand alone or connect to a broader project."/>
    <section className="section all-services"><div className="container">
      <div className="catalogue-intro"><span className="eyebrow">THE COMPLETE CATALOGUE</span><p>Choose a capability to see the approach, typical deliverables, and useful first questions.</p></div>
      <div className="filter-row" role="group" aria-label="Filter services by category">{serviceGroups.map((name) => <button key={name} className={group === name ? "filter-chip active" : "filter-chip"} aria-pressed={group === name} onClick={() => setGroup(name)}>{name}</button>)}</div>
      {visible.length ? <div className="services-long-grid">{visible.map((service, i) => <ServiceCard key={service.slug} item={service} index={i}/>)}</div> : <div className="empty-state">No services in this category yet. Choose another category to continue.</div>}
    </div></section>
    <section className="section deliverables-section"><div className="container deliverables-grid"><SectionHeading eyebrow="A THOUGHTFUL PROCESS" title="A clear brief makes better work." text="Every engagement starts with shared expectations and an agreed scope."/><div className="deliverables-list">{["Goals and audience", "Requirements and constraints", "Milestones and review points", "Deliverables and handover"].map((item, i) => <div key={item}><span>0{i+1}</span>{item}<Check size={16}/></div>)}</div></div></section>
    <CTA/>
  </>;
}
function Contact() {
  const services = useServices();
  return <><PageMeta title="Contact" description="Start a project conversation with NovaStack."/><PageIntro eyebrow="CONTACT" title={<>Good things start<br/>with a conversation.</>} text="Tell us what you’re building and what would make this project useful. We’ll help you think through a practical next step."/><section className="section contact-section"><div className="container contact-grid"><div className="contact-aside"><span className="eyebrow">START A PROJECT</span><h2>What are you<br/>imagining?</h2><p>Share whatever you know so far. Early ideas and well-defined plans are both welcome.</p><div className="contact-note"><span className="status-dot"/> FORM STATUS <b>API persistence</b><small>Success appears only after the API confirms the message was saved. Messages are not emailed.</small></div><div className="contact-details"><span className="eyebrow">A NOTE ON EMAIL</span><p>Enquiries and contact messages are stored in MongoDB after successful API confirmation. Email notifications are not configured.</p></div><div className="contact-service-links"><span className="eyebrow">EXPLORE SERVICES</span>{services.slice(0,4).map(s=><Link key={s.slug} to={`/services/${s.slug}`}>{s.title}<ArrowUpRight size={14}/></Link>)}</div></div><EnquiryForm mode="contact"/></div></section></>;
}
function NotFound() {
  return (
    <>
      <PageMeta
        title="Page not found"
        description="The page you’re looking for could not be found."
      />
      <section className="not-found">
        <div className="container">
          <span className="eyebrow">ERROR 404 · LOST IN THE STACK</span>
          <div className="error-number">404</div>
          <h1>
            This page took
            <br />
            <em>a different route.</em>
          </h1>
          <p>
            The link may have moved, or the address may be mistyped. Let’s get
            you back on track.
          </p>
          <Button to="/">
            Back to home <ArrowRight size={16} />
          </Button>
        </div>
      </section>
    </>
  );
}
export default function App() {
  useEffect(() => {
    document.documentElement.dataset.theme =
      localStorage.getItem("novastack-theme") || "light";
  }, []);
  return (
    <ServicesProvider><Frame>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:slug" element={<ServiceDetails />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/my-enquiries" element={<RequireAuth><MyEnquiries /></RequireAuth>} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin" element={<AdminGuard />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminOverview />} />
          <Route path="enquiries" element={<AdminEnquiries />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Frame></ServicesProvider>
  );
}
