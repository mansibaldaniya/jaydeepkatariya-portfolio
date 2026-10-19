import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import AdminPanel from './AdminPanel'
import './style.css'

type Experience = { role: string; company: string; period: string; points: string[] }
type Project = { name: string; type: string; description: string; details: string[]; stack: string[]; images?: string[] }
type Education = { degree: string; school: string; period: string }
type SkillGroup = { group: string; items: string[] }
type Content = { name: string; title: string; location: string; availability: string; email: string; phone: string; linkedin: string; github: string; summary: string; experience: Experience[]; education: Education[]; skills: SkillGroup[]; projects: Project[]; languages: string[] }
const blank: Content = { name: '', title: '', location: '', availability: '', email: '', phone: '', linkedin: '', github: '', summary: '', experience: [], education: [], skills: [], projects: [], languages: [] }
async function api(path: string, options: RequestInit = {}) {
  const response = await fetch(`/api${path}`, { ...options, credentials: 'include', headers: { 'Content-Type': 'application/json', ...options.headers } })
  const data = response.status === 204 ? null : await response.json()
  if (!response.ok) throw new Error(data?.error ?? 'Something went wrong.')
  return data
}
const bullets = (items: string[]) => items.map((item, i) => <li key={`${item}-${i}`}>{item}</li>)

function CursorFollower() {
  const cursorRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const cursor = cursorRef.current
    if (!cursor) return
    const interactive = (target: EventTarget | null) => target instanceof Element && target.closest('a, button, input, textarea, select, [role="button"]') !== null
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`
      cursor.classList.add('cursor-visible')
    }
    const over = (event: PointerEvent) => { if (interactive(event.target)) cursor.classList.add('cursor-hover') }
    const out = (event: PointerEvent) => { if (interactive(event.target) && !interactive(event.relatedTarget)) cursor.classList.remove('cursor-hover') }
    const down = () => cursor.classList.add('cursor-pressed')
    const up = () => cursor.classList.remove('cursor-pressed')
    const leave = () => cursor.classList.remove('cursor-visible')
    document.addEventListener('pointermove', move)
    document.addEventListener('pointerover', over)
    document.addEventListener('pointerout', out)
    document.addEventListener('pointerdown', down)
    document.addEventListener('pointerup', up)
    document.addEventListener('pointercancel', up)
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerover', over)
      document.removeEventListener('pointerout', out)
      document.removeEventListener('pointerdown', down)
      document.removeEventListener('pointerup', up)
      document.removeEventListener('pointercancel', up)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [])
  return <div className="cursor-follower" ref={cursorRef} aria-hidden="true"><i className="cursor-spark spark-one"/><i className="cursor-spark spark-two"/><i className="cursor-spark spark-three"/><i className="cursor-spark spark-four"/><span/></div>
}

function SkillLogo({ name }: { name: string }) {
  const key = name.toLowerCase()
  if (key.includes('html')) return <svg viewBox="0 0 40 40" className="skill-logo" role="img" aria-label="HTML5 logo"><path fill="#e85d35" d="M7 4h26l-2.4 28L20 36l-10.6-4L7 4Z"/><path fill="#f47748" d="M20 8h9l-1.8 21L20 32V8Z"/><path fill="#fff" d="M13 12h14l-.4 4H17l.3 3h8.9l-.9 9-5.3 2-5.2-2-.4-4h4l.2 1.3 1.4.5 1.4-.5.2-2.4h-9L13 12Z"/></svg>
  if (key.includes('css')) return <svg viewBox="0 0 40 40" className="skill-logo" role="img" aria-label="CSS3 logo"><path fill="#2878cf" d="M7 4h26l-2.4 28L20 36l-10.6-4L7 4Z"/><path fill="#4295ed" d="M20 8h9l-1.8 21L20 32V8Z"/><path fill="#fff" d="M13 12h14l-.4 4h-9.2l.2 3h8.7l-.8 9-5.5 2-5.4-2-.3-4h4l.2 1.3 1.5.5 1.4-.5.2-2.4h-9L13 12Z"/></svg>
  if (key.includes('javascript') || key === 'js') return <svg viewBox="0 0 40 40" className="skill-logo" role="img" aria-label="JavaScript logo"><rect x="4" y="4" width="32" height="32" rx="6" fill="#f2d84a"/><text x="9" y="28" fill="#292b25" fontSize="15" fontWeight="800" fontFamily="Arial">JS</text></svg>
  if (key.includes('react')) return <svg viewBox="0 0 40 40" className="skill-logo" role="img" aria-label="React logo"><g fill="none" stroke="#4dc9e8" strokeWidth="1.8"><ellipse cx="20" cy="20" rx="16" ry="6.5"/><ellipse cx="20" cy="20" rx="16" ry="6.5" transform="rotate(60 20 20)"/><ellipse cx="20" cy="20" rx="16" ry="6.5" transform="rotate(120 20 20)"/></g><circle cx="20" cy="20" r="3.1" fill="#4dc9e8"/></svg>
  if (key.includes('php')) return <svg viewBox="0 0 40 40" className="skill-logo" role="img" aria-label="PHP logo"><ellipse cx="20" cy="20" rx="18" ry="12" fill="#777bb3"/><text x="5" y="24" fill="white" fontSize="11" fontWeight="700" fontFamily="Arial">php</text></svg>
  const brands: [string, string, string][] = [['shopify', '#79a943', 'S'], ['laravel', '#ef503f', 'L'], ['craft', '#d18c52', 'C'], ['mysql', '#367397', 'My'], ['docker', '#2496ed', 'D'], ['git', '#e85d35', 'Git'], ['openai', '#3c8b83', 'AI'], ['webhook', '#5e8373', '↗'], ['testing', '#829477', '✓']]
  const brand = brands.find(([match]) => key.includes(match))
  const [label, color, letters] = brand ? [name, brand[1], brand[2]] : [name, '#829477', name.slice(0, 2).toUpperCase()]
  return <svg viewBox="0 0 40 40" className="skill-logo" role="img" aria-label={`${label} logo`}><rect x="4" y="4" width="32" height="32" rx="10" fill={color}/><text x="20" y="24" fill="white" fontSize={letters.length > 2 ? '9' : '13'} fontWeight="700" fontFamily="Arial" textAnchor="middle">{letters}</text></svg>
}

function ProjectGallery({ project, index }: { project: Project; index: number }) {
  const images = project.images ?? []
  const [active, setActive] = useState(0)
  useEffect(() => setActive(current => Math.min(current, Math.max(images.length - 1, 0))), [images.length])
  if (!images.length) return <div className="project-image"><div className="project-glow"/><span className="project-index">0{index + 1} / {project.type}</span><div className="project-graphic"><span className="graphic-orbit orbit-1"/><span className="graphic-orbit orbit-2"/><span className="graphic-symbol">{['\u2733', '\u2197', '\u25c9', '\u221e'][index % 4]}</span><span className="graphic-word">{project.name}</span></div><span className="graphic-caption">PRODUCT / {String(index + 1).padStart(2, '0')}</span></div>
  return <div className="project-image project-photo"><img className="project-photo-img" src={images[active]} alt={`${project.name} project preview ${active + 1}`} key={images[active]}/>{images.length > 1 && <><span className="project-image-index">0{index + 1} / {project.type}</span><button type="button" className="gallery-nav gallery-prev" aria-label={`Previous ${project.name} image`} onClick={() => setActive(current => (current - 1 + images.length) % images.length)}>{String.fromCharCode(8249)}</button><button type="button" className="gallery-nav gallery-next" aria-label={`Next ${project.name} image`} onClick={() => setActive(current => (current + 1) % images.length)}>{String.fromCharCode(8250)}</button><div className="gallery-dots" aria-label="Project images">{images.map((_, i) => <button type="button" key={i} aria-label={`Show image ${i + 1}`} aria-current={active === i} onClick={() => setActive(i)}/>)}</div></>}</div>
}

function Portfolio() {
  const [c, setC] = useState<Content>(blank)
  const [loading, setLoading] = useState(true)
  useEffect(() => { api('/content').then(setC).catch(() => undefined).finally(() => setLoading(false)) }, [])
  if (loading) return <div className="loading-screen"><span className="loader"/> Loading portfolio</div>
  return <main className="site-shell">
    <header className="topbar wrap"><a className="brand" href="#home" aria-label={`${c.name} home`}><img className="brand-logo" src="/jaydeep-logo.svg" alt=""/></a><nav><a href="#work">Work</a><a href="#experience">Experience</a><a href="#about">About</a><a className="nav-cta" href={`mailto:${c.email}`}>Let’s talk <span>↗</span></a></nav></header>
    <section className="hero wrap" id="home">
      <div className="hero-copy">
        <p className="eyebrow"><span className="live-dot"/>{c.availability}<span className="eyebrow-place">{c.location}</span></p>
        <p className="hero-hello">Hello<span>.</span></p>
        <p className="hero-name">I&apos;m <strong>{c.name}</strong></p>
        <h1>{c.title}</h1>
        <p className="hero-intro">I build thoughtful web, Shopify, and AI experiences, from the first sketch through launch.</p>
        <div className="hero-actions"><a className="button button-dark" href={`mailto:${c.email}?subject=${encodeURIComponent('Let us build something together')}`}>Got a project? <span>&rarr;</span></a><a className="button button-outline" href="/jaydeep-katariya-resume.pdf" target="_blank" rel="noreferrer">My resume <span>&#8599;</span></a></div>
      </div>
      <div className="hero-art" aria-label={`${c.name}, ${c.title}`}>
        <img className="hero-portrait" src="/jaydeep-portrait-dark.png" alt={`${c.name}, smiling in formal attire`}/>
        <div className="portrait-halo"/><div className="portrait-orbit portrait-orbit-a"/><div className="portrait-orbit portrait-orbit-b"/>
        <div className="portrait-caption"><span className="portrait-caption-dot"/>FULL-STACK DEVELOPER <span>/</span> SURAT, INDIA</div>
      </div>
    </section>
    <div className="hero-tech-strip"><div className="wrap hero-tech-inner"><span className="hero-tech-label">TOOLS I BUILD WITH</span>{['HTML5','CSS3','JavaScript','TypeScript','React','Node.js','Git'].map((tool,i)=><span className="hero-tech-item" key={tool}><span className="hero-tech-index">0{i+1}</span>{tool}</span>)}</div></div>
    <section className="hero-metrics wrap" aria-label="Career highlights"><article><strong>1.5+</strong><span>Years experience</span></article><article><strong>{c.projects.filter(project => project.type.toLowerCase().includes('shopify')).length}</strong><span>Shopify apps</span></article><article><strong>{c.projects.length}</strong><span>Projects completed</span></article></section>
    <section className="intro-band"><div className="wrap intro-inner"><span className="section-kicker">A QUICK INTRO</span><p>{c.summary}</p><span className="intro-mark">✳</span></div></section>
    <section className="work-section wrap" id="work"><div className="section-title"><div><span className="section-kicker">01 / THINGS I’VE BUILT</span><h2>Selected work<span>.</span></h2></div><span className="section-aside">A mix of products, platforms<br/>and problems worth solving.</span></div><div className="project-list">{c.projects.map((project, i) => <article className={`project project-${i % 4}`} key={`${project.name}-${i}`}><ProjectGallery project={project} index={i}/><div className="project-info"><div className="project-heading"><div><h3>{project.name}</h3><p>{project.type}</p></div><a className="circle-link" href={`mailto:${c.email}?subject=${encodeURIComponent(`Project: ${project.name}`)}`} aria-label={`Ask about ${project.name}`}>↗</a></div><p className="project-description">{project.description}</p><ul className="project-details">{bullets(project.details)}</ul><div className="chips">{project.stack.map(item => <span key={item}>{item}</span>)}</div></div></article>)}</div></section>
    <section className="experience-section" id="experience"><div className="wrap"><div className="section-title"><div><span className="section-kicker">02 / WHERE I’VE GROWN</span><h2>Experience<span>.</span></h2></div><span className="section-aside">Building better things,<br/>one collaboration at a time.</span></div><div className="timeline">{c.experience.map((job, i) => <article className="timeline-item" key={`${job.company}-${job.role}-${i}`}><div className="timeline-dot"/><div className="job-heading"><div><h3>{job.role}</h3><p>{job.company}</p></div><time>{job.period}</time></div><ul>{bullets(job.points)}</ul></article>)}</div></div></section>
    <section className="about-section wrap" id="about"><div className="section-title"><div><span className="section-kicker">03 / THE PERSON BEHIND THE PIXELS</span><h2>Curious by nature<span>.</span></h2></div></div><div className="about-grid"><div className="about-note"><div className="note-orbit"><span>✳</span></div><span className="note-label">A NOTE TO SELF</span><p>Keep asking<br/>better questions.</p><span className="note-signature">— Jaydeep</span></div><div className="about-details"><p className="about-lead">I like making the complex feel simple, the useful feel delightful, and the everyday feel more considered.</p><p>My work sits at the intersection of product thinking and full-stack development. From AI-powered assistants to learning platforms, I enjoy understanding how things fit together and finding the details that make them feel right.</p><div className="education-list"><span className="section-kicker">EDUCATION</span>{c.education.map((item, i) => <div className="education-item" key={`${item.degree}-${i}`}><div><strong>{item.degree}</strong><span>{item.school}</span></div><time>{item.period}</time></div>)}</div></div></div></section>
    <section className="skills-section"><div className="wrap"><div className="section-title"><div><span className="section-kicker">04 / TOOLS I REACH FOR</span><h2>My toolkit<span>.</span></h2></div><span className="section-aside">The tools behind the<br/>things I love to build.</span></div><div className="skill-grid">{c.skills.map((group, i) => <article className="skill-group" key={`${group.group}-${i}`}><header className="skill-card-heading"><span className="skill-number">{String(i + 1).padStart(2, '0')}</span><h3>{group.group}</h3><span className="skill-card-count">{String(group.items.length).padStart(2, '0')} TOOLS</span></header><div className="skill-items">{group.items.map(item => <span className="skill-tile" key={item}><SkillLogo name={item}/><span>{item}</span></span>)}</div></article>)}</div><div className="language-line"><span className="section-kicker">LANGUAGES</span>{c.languages.map(language => <span key={language}>{language}</span>)}</div></div></section>
    <footer className="footer"><div className="wrap"><span className="section-kicker">05 / HAVE A GOOD ONE IN MIND?</span><div className="footer-main"><h2>Let’s make<br/><em>something matter.</em></h2><a className="footer-cta" href={`mailto:${c.email}`} aria-label="Email Jaydeep">↗</a></div><div className="footer-meta"><div className="contact-links"><a className="footer-email" href={`mailto:${c.email}`}>{c.email}</a>{c.phone && <a className="footer-phone" href={`tel:${c.phone.replace(/\s/g, '')}`}>{c.phone}</a>}</div><div className="social-links">{c.linkedin && <a href={c.linkedin} target="_blank" rel="noreferrer">LINKEDIN ↗</a>}{c.github && <a href={c.github} target="_blank" rel="noreferrer">GITHUB ↗</a>}<a href="/admin">ADMIN ↗</a></div><span>© {new Date().getFullYear()} {c.name.toUpperCase()} · MADE WITH CARE</span></div></div></footer>
  </main>
}

function App(){return <><CursorFollower/>{window.location.pathname.startsWith('/admin')?<AdminPanel/>:<Portfolio/>}</>}
createRoot(document.getElementById('root')!).render(<App/> )
