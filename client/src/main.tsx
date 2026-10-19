import React from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

function App() {
  return (
    <main className="page-shell">
      <nav className="nav wrap">
        <a className="wordmark" href="#top">J<span>.</span></a>
        <div className="nav-links"><a href="#work">Work</a><a href="#about">About</a><a className="contact-link" href="mailto:hello@example.com">Let’s talk <span>↗</span></a></div>
      </nav>
      <section className="hero wrap" id="top">
        <div className="eyebrow"><span className="status-dot" /> AVAILABLE FOR SELECT PROJECTS <span className="eyebrow-year">2025 — 26</span></div>
        <h1>Digital things,<br /><em>thoughtfully</em> made.</h1>
        <div className="hero-bottom"><p>I’m Jaydeep — a developer who turns curious ideas into clear, useful experiences for the web.</p><a className="round-arrow" href="#work" aria-label="Explore selected work">↓</a></div>
        <div className="hero-art" aria-hidden="true"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-core">J<span>.</span></div><div className="art-spark spark-one">✳</div><div className="art-spark spark-two">✳</div><span className="art-label">IDEAS IN<br/>GOOD COMPANY</span></div>
      </section>
      <section className="work-section wrap" id="work">
        <div className="section-heading"><span>01 / SELECTED WORK</span><span>A FEW THINGS I’VE MADE</span></div>
        <article className="project-card"><div className="project-visual visual-sage"><div className="browser-bar"><i/><i/><i/><span>fieldnotes.studio</span></div><div className="field-copy"><small>FIELDNOTES / 2025</small><strong>Make room<br/>for wonder.</strong><span>✳</span></div></div><div className="project-meta"><div><h2>Fieldnotes</h2><p>A calmer corner of the internet for creative people.</p></div><span className="tag">DESIGN · DEVELOPMENT</span><a className="project-arrow" href="mailto:hello@example.com" aria-label="Ask about Fieldnotes">↗</a></div></article>
        <div className="project-grid"><article className="project-card"><div className="project-visual visual-blue"><div className="atlas-mark">atlas<span>°</span></div><div className="atlas-circle">Find your<br/>next place<span>↗</span></div></div><div className="project-meta"><div><h2>Atlas Journal</h2><p>Travel stories with a sense of place.</p></div><a className="project-arrow" href="mailto:hello@example.com" aria-label="Ask about Atlas Journal">↗</a></div></article><article className="project-card"><div className="project-visual visual-peach"><div className="loop-ring">loop</div><div className="loop-note">Little habits.<br/>Lasting change.</div><span className="loop-star">✳</span></div><div className="project-meta"><div><h2>Loop Habit</h2><p>A gentle nudge toward better routines.</p></div><a className="project-arrow" href="mailto:hello@example.com" aria-label="Ask about Loop Habit">↗</a></div></article></div>
      </section>
      <section className="about-section" id="about"><div className="wrap about-inner"><div className="section-heading"><span>02 / A LITTLE ABOUT ME</span><span>HOW I LIKE TO WORK</span></div><div className="about-content"><h2>Good work comes from<br/>being <em>curious together.</em></h2><div className="about-copy"><p>I care about the details you feel, even when you can’t quite name them. I work across design and code to make digital products feel intuitive, warm, and a little unexpected.</p><p>Currently learning, making, and working with good people from somewhere in India.</p><a href="mailto:hello@example.com">A bit more about me <span>↗</span></a></div></div><div className="principles"><span>01 &nbsp; STAY CURIOUS</span><span>02 &nbsp; SWEAT THE DETAILS</span><span>03 &nbsp; MAKE IT HUMAN</span></div></div></section>
      <footer className="wrap footer"><div className="footer-top"><span>HAVE SOMETHING IN MIND?</span><a href="mailto:hello@example.com">Let’s make it<br/><em>happen.</em><span className="footer-arrow">↗</span></a></div><div className="footer-bottom"><span>© 2025 JAYDEEP</span><span>MADE WITH CARE & A LITTLE COFFEE</span><div><a href="https://github.com/">GITHUB ↗</a><a href="https://www.linkedin.com/">LINKEDIN ↗</a></div></div></footer>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)
