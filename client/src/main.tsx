import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import AdminPanel from './AdminPanel'
import './style.css'

type Experience = { role: string; company: string; period: string; points: string[] }
type Project = { name: string; type: string; description: string; details: string[]; stack: string[]; images?: string[]; link?: string }
type Education = { degree: string; school: string; period: string }
type SkillGroup = { group: string; items: string[] }
type Metric = { value: string; label: string }
type Content = { name: string; title: string; location: string; availability: string; email: string; phone: string; linkedin: string; github: string; heroDescription: string; heroMessages: string[]; portraitRoles: string[]; metrics: Metric[]; experience: Experience[]; education: Education[]; skills: SkillGroup[]; projects: Project[]; languages: string[] }
const blank: Content = { name: '', title: '', location: '', availability: '', email: '', phone: '', linkedin: '', github: '', heroDescription: '', heroMessages: [], portraitRoles: [], metrics: [], experience: [], education: [], skills: [], projects: [], languages: [] }
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
  const [contactSent, setContactSent] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [typedName, setTypedName] = useState('')
  const [workFilter, setWorkFilter] = useState('All projects')
  const [showAllProjects, setShowAllProjects] = useState(false)
  useEffect(() => { api('/content').then(setC).catch(() => undefined).finally(() => setLoading(false)) }, [])
  useEffect(() => {
    if (!c.name) { setTypedName(''); return }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setTypedName(c.name); return }
    setTypedName('')
    let position = 0
    const timer = window.setInterval(() => {
      position += 1
      setTypedName(c.name.slice(0, position))
      if (position >= c.name.length) window.clearInterval(timer)
    }, 75)
    return () => window.clearInterval(timer)
  }, [c.name])
  useEffect(() => {
    if (!menuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false) }
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Element && !event.target.closest('#site-navigation, .menu-toggle')) setMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', closeOnEscape); document.removeEventListener('pointerdown', closeOnOutsideClick) }
  }, [menuOpen])
  if (loading) return <div className="loading-screen"><span className="loader"/> Loading portfolio</div>
  const matchingProjects = c.projects.map((project, i) => ({ project, i })).filter(({ project }) => {
    const type = project.type.toLowerCase()
    if (workFilter === 'All projects') return true
    if (workFilter === 'Shopify apps') return type.includes('shopify')
    if (workFilter === 'Android apps') return type.includes('android')
    return !type.includes('shopify') && !type.includes('android')
  })
  return <main className="site-shell">
    {menuOpen && <button className="menu-backdrop" type="button" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)}/>}
    <header className="topbar wrap"><a className="brand" href="#home" aria-label={`${c.name} home`} onClick={() => setMenuOpen(false)}><img className="brand-logo" src="/jaydeep-logo.svg" alt=""/><span>Jaydeep Katariya</span></a><button className="menu-toggle" type="button" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} aria-controls="site-navigation" onClick={() => setMenuOpen(open => !open)}><span/><span/><span/></button><nav id="site-navigation" className={menuOpen ? 'is-open' : ''}><div className="menu-drawer-heading"><button type="button" className="menu-close" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)}><span/><span/></button></div><a href="#work" onClick={() => setMenuOpen(false)}>Work</a><a href="#experience" onClick={() => setMenuOpen(false)}>Experience</a><a href="#about" onClick={() => setMenuOpen(false)}>About</a><a href="#toolkit" onClick={() => setMenuOpen(false)}>My toolkit</a><a className="nav-cta" href="#contact" onClick={() => setMenuOpen(false)}>Contact <span>↗</span></a></nav></header>
    <section className="hero wrap" id="home">
      <div className="hero-copy">
        <p className="eyebrow"><span className="live-dot"/><span className="hero-status" aria-label={c.heroMessages.join('; ')}>{c.heroMessages.map((message, index) => <span className="hero-status-item" key={`${message}-${index}`} style={{ animationDelay: `${-index * 4}s` }}>{message}</span>)}</span></p>
        <p className="hero-greeting">HELLO, I&apos;M</p>
        <p className="hero-name"><strong className="typed-name"><span className="typed-name-reserve" aria-hidden="true">{c.name}</span><span className="typed-name-output" aria-hidden="true">{Array.from(typedName).map((letter,index)=><span className="name-letter" key={`${index}-${letter}`} style={{animationDelay:`${index*55}ms`}}>{letter === ' ' ? '\u00a0' : letter}</span>)}</span><span className="sr-only">{c.name}</span></strong></p>
        <h1 className="hero-role"><span className="hero-role-mark" aria-hidden="true"/><span className="hero-role-title">{c.title}</span></h1>
        <p className="hero-intro">{c.heroDescription}</p>
        <div className="hero-actions"><a className="button button-dark" href="#work">Explore work <span>&rarr;</span></a><a className="button button-outline" href="/jaydeep-katariya-resume.pdf" target="_blank" rel="noreferrer">My resume <span>&#8599;</span></a></div>
      </div>
      <div className="hero-art" aria-label={`${c.name}, ${c.title}`}>
        <img className="hero-portrait" src="/jaydeep-portrait-dark.png" alt={`${c.name}, smiling in formal attire`}/>
        <div className="portrait-halo"/><div className="portrait-orbit portrait-orbit-a"/><div className="portrait-orbit portrait-orbit-b"/>
        <div className="portrait-role-tags" role="list" aria-label="Development specialties">{c.portraitRoles.map((role,index)=><span className={`portrait-role-tag portrait-role-tag-${index+1}`} role="listitem" key={`${role}-${index}`}><i aria-hidden="true"/>{role}</span>)}</div>
      </div>
    </section>
    <section className="hero-metrics wrap" aria-label="Career highlights"><div className="hero-metrics-track">{[0,1].map(copy => <div className="hero-metrics-set" key={copy} aria-hidden={copy === 1}>{c.metrics.map((metric, index) => <article key={`${copy}-${index}`}><strong>{metric.value}</strong><span>{metric.label}</span></article>)}</div>)}</div></section>
    <section className="work-section wrap" id="work"><div className="section-title"><div><span className="section-kicker">Things I’ve built</span><h2>Selected work<span>.</span></h2></div><span className="section-aside">A mix of products, platforms<br/>and problems worth solving.</span></div><div className="work-filters" role="group" aria-label="Filter selected work">{['All projects','Shopify apps','Websites','Android apps'].map(filter=><button type="button" key={filter} className={workFilter===filter?'active':''} aria-pressed={workFilter===filter} onClick={()=>{setWorkFilter(filter);setShowAllProjects(false)}}>{filter}</button>)}</div><div className="project-list">{matchingProjects.slice(0, showAllProjects ? matchingProjects.length : 4).map(({project,i}) => <article className={`project project-${i % 4}`} key={`${project.name}-${i}`}><ProjectGallery project={project} index={i}/><div className="project-info"><div className="project-heading"><div><h3>{project.name}</h3><p>{project.type}</p></div>{project.link ? <a className="project-action-link" href={project.link} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${project.name} live`}>{project.type.toLowerCase().includes('shopify') ? <svg className="project-action-icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 7h12l1 10H3L4 7Z"/><path d="M7 8V5a3 3 0 0 1 6 0v3"/></svg> : <svg className="project-action-icon" viewBox="0 0 20 20" aria-hidden="true"><rect x="2.5" y="3.5" width="15" height="13" rx="2"/><path d="M3 7h14M6 5.3h.1m2.2 0h.1"/></svg>}<span>{project.type.toLowerCase().includes('shopify') ? 'View app' : 'Visit website'}</span><span className="project-action-arrow" aria-hidden="true">↗</span></a> : <a className="circle-link" href={`mailto:${c.email}?subject=${encodeURIComponent(`Project: ${project.name}`)}`} aria-label={`Ask about ${project.name}`}>↗</a>}</div><p className="project-description">{project.description}</p><ul className="project-details">{bullets(project.details)}</ul><div className="chips">{project.stack.map(item => <span key={item}>{item}</span>)}</div></div></article>)}</div>{matchingProjects.length>4&&<div className="projects-more"><button type="button" className="projects-more-button" onClick={()=>setShowAllProjects(show=>!show)}>{showAllProjects ? 'Show fewer projects' : 'View all projects'}<span aria-hidden="true">{showAllProjects ? '↑' : '↓'}</span></button></div>}</section>
    <section className="experience-section" id="experience"><div className="wrap"><div className="section-title"><div><span className="section-kicker">Where I’ve grown</span><h2>Experience<span>.</span></h2></div><span className="section-aside">Building better things,<br/>one collaboration at a time.</span></div><div className="timeline">{c.experience.map((job, i) => <article className="timeline-item" key={`${job.company}-${job.role}-${i}`}><div className="timeline-dot"/><div className="job-heading"><div><h3>{job.role}</h3><p>{job.company}</p></div><time>{job.period}</time></div><ul>{bullets(job.points)}</ul></article>)}</div></div></section>
    <section className="about-section wrap" id="about"><div className="section-title"><div><span className="section-kicker">The person behind the pixels</span><h2>Curious by nature<span>.</span></h2></div></div><div className="about-grid"><div className="about-note"><div className="note-orbit"><span>✳</span></div><span className="note-label">A NOTE TO SELF</span><p>Keep asking<br/>better questions.</p><span className="note-signature">— Jaydeep</span></div><div className="about-details"><p className="about-lead">I like making the complex feel simple, the useful feel delightful, and the everyday feel more considered.</p><p>My work sits at the intersection of product thinking and full-stack development. From AI-powered assistants to learning platforms, I enjoy understanding how things fit together and finding the details that make them feel right.</p><div className="education-list"><span className="section-kicker">EDUCATION</span>{c.education.map((item, i) => <div className="education-item" key={`${item.degree}-${i}`}><div><strong>{item.degree}</strong><span>{item.school}</span></div><time>{item.period}</time></div>)}</div></div></div></section>
    <section className="skills-section" id="toolkit"><div className="wrap"><div className="section-title"><div><span className="section-kicker">Tools I reach for</span><h2>My toolkit<span>.</span></h2></div><span className="section-aside">The tools behind the<br/>things I love to build.</span></div><div className="skill-grid">{c.skills.map((group, i) => <article className="skill-group" key={`${group.group}-${i}`}><header className="skill-card-heading"><span className="skill-number">{String(i + 1).padStart(2, '0')}</span><h3>{group.group}</h3><span className="skill-card-count">{String(group.items.length).padStart(2, '0')} TOOLS</span></header><div className="skill-items">{group.items.map(item => <span className="skill-tile" key={item}><SkillLogo name={item}/><span>{item}</span></span>)}</div></article>)}</div><div className="language-line"><span className="section-kicker">LANGUAGES</span>{c.languages.map(language => <span key={language}>{language}</span>)}</div></div></section>
    <section className="contact-section wrap" id="contact"><div className="section-title"><div><span className="section-kicker">Get in touch</span><h2>Contact<span>.</span></h2></div><span className="section-aside">Have a project in mind?<br/>Send me a message.</span></div><form className="contact-form" onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); const subject = encodeURIComponent(`Portfolio enquiry from ${form.get('name')}`); const body = encodeURIComponent(`Name: ${form.get('name')}\nEmail: ${form.get('email')}\n\n${form.get('message')}`); window.location.href = `mailto:${c.email}?subject=${subject}&body=${body}`; setContactSent(true) }}><label>Name<input name="name" required autoComplete="name"/></label><label>Email<input name="email" type="email" required autoComplete="email"/></label><label className="contact-message">Message<textarea name="message" rows={5} required/></label><button className="button button-dark" type="submit">Send message <span>↗</span></button>{contactSent && <p className="contact-hint" role="status">Your email app should open with your message ready to send.</p>}</form></section>
    <footer className="footer"><div className="wrap"><span className="section-kicker">05 / HAVE A GOOD ONE IN MIND?</span><div className="footer-main"><h2>Let’s make<br/><em>something matter.</em></h2><a className="footer-cta" href={`mailto:${c.email}`} aria-label="Email Jaydeep">↗</a></div><div className="footer-meta"><div className="contact-links"><a className="footer-email" href={`mailto:${c.email}`}>{c.email}</a>{c.phone && <a className="footer-phone" href={`tel:${c.phone.replace(/\s/g, '')}`}>{c.phone}</a>}</div><div className="social-links">{c.linkedin && <a href={c.linkedin} target="_blank" rel="noreferrer">LINKEDIN ↗</a>}{c.github && <a href={c.github} target="_blank" rel="noreferrer">GITHUB ↗</a>}<a href="/admin">ADMIN ↗</a></div><span>© {new Date().getFullYear()} {c.name.toUpperCase()} · MADE WITH CARE</span></div></div></footer>
  </main>
}

function App(){return <><CursorFollower/>{window.location.pathname.startsWith('/admin')?<AdminPanel/>:<Portfolio/>}</>}
createRoot(document.getElementById('root')!).render(<App/> )
