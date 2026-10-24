import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import AdminPanel from './AdminPanel'
import './style.css'

type Experience = { role: string; company: string; period: string; points: string[]; companyWebsite?: string; companyEmail?: string; companyPhone?: string }
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
  const brandSlugs: [string, string][] = [['shopify', 'shopify'], ['laravel', 'laravel'], ['craft', 'craftcms'], ['mysql', 'mysql'], ['docker', 'docker'], ['git', 'git'], ['openai', 'openai']]
  const logoBrand = brandSlugs.find(([match]) => key.includes(match))
  const fallbackLetters = name.replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase() || '•'
  const fallbackLogo = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#879d75"/><text x="24" y="30" fill="#102014" font-family="Arial,sans-serif" font-size="16" font-weight="700" text-anchor="middle">${fallbackLetters}</text></svg>`)}`
  if (logoBrand) return <img className="skill-logo skill-logo-brand" src={`https://cdn.simpleicons.org/${logoBrand[1]}`} alt={`${name} logo`} loading="lazy" decoding="async" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackLogo }}/>
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
  const [contactError, setContactError] = useState('')
  const [contactSending, setContactSending] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [typedName, setTypedName] = useState('')
  const [workFilter, setWorkFilter] = useState('All projects')
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [skillFilter, setSkillFilter] = useState('All')

  useEffect(() => { api('/content').then(setC).catch(() => undefined).finally(() => setLoading(false)) }, [])
  useEffect(() => {
    if (!c.name) return
    const title = `${c.name} | ${c.title} & Shopify App Developer`
    const description = `${c.name} is a ${c.title.toLowerCase()} in ${c.location}, building Shopify apps, full-stack web platforms, and AI-powered products.`
    document.title = title
    const setMeta = (selector: string, content: string, attribute = 'content') => {
      const element = document.querySelector<HTMLMetaElement>(selector)
      if (element) element.setAttribute(attribute, content)
    }
    setMeta('meta[name="description"]', description)
    setMeta('meta[property="og:title"]', title)
    setMeta('meta[property="og:description"]', description)
    setMeta('meta[property="og:image"]', `${window.location.origin}/jaydeep-portrait-dark.png`)
    setMeta('meta[name="twitter:title"]', title)
    setMeta('meta[name="twitter:description"]', description)
    setMeta('meta[name="twitter:image"]', `${window.location.origin}/jaydeep-portrait-dark.png`)
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical) }
    canonical.href = `${window.location.origin}${window.location.pathname}`
    let structuredData = document.querySelector<HTMLScriptElement>('#person-structured-data')
    if (!structuredData) { structuredData = document.createElement('script'); structuredData.id = 'person-structured-data'; structuredData.type = 'application/ld+json'; document.head.append(structuredData) }
    structuredData.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      name: `${c.name} | ${c.title}`,
      url: window.location.origin,
      mainEntity: {
        '@type': 'Person',
        name: c.name,
        jobTitle: c.title,
        description,
        url: window.location.origin,
        image: `${window.location.origin}/jaydeep-portrait-dark.png`,
        email: c.email,
        telephone: c.phone,
        address: { '@type': 'PostalAddress', addressLocality: c.location.split(',')[0]?.trim(), addressCountry: 'IN' },
        sameAs: [c.linkedin, 'https://github.com/Jaydeepkatariy'].filter(Boolean),
        knowsAbout: [...new Set(c.skills.flatMap(group => group.items))],
      },
    })
  }, [c])
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
  const skillFilters = ['All', 'Frontend', 'Backend & Framework', 'Database', 'Tools', 'Testing']
  const visibleSkillGroups = c.skills.filter(group => {
    if (skillFilter === 'All') return true
    const name = group.group.toLowerCase()
    if (skillFilter === 'Backend & Framework') return name.includes('backend') || name.includes('framework')
    if (skillFilter === 'Tools') return name.includes('tool') || name.includes('platform')
    return name.includes(skillFilter.toLowerCase())
  })
  const displayedSkillGroups = skillFilter === 'All'
    ? [{ group: 'All technologies', items: Array.from(new Set(c.skills.flatMap(group => group.items))) }]
    : visibleSkillGroups
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
    <section className="work-section wrap" id="work"><div className="section-title"><div><span className="section-kicker">Things I’ve built</span><h2>Selected work<span>.</span></h2></div><span className="section-aside">A mix of products, platforms<br/>and problems worth solving.</span></div><div className="work-filters" role="group" aria-label="Filter selected work">{['All projects','Shopify apps','Websites','Android apps'].map(filter=><button type="button" key={filter} className={workFilter===filter?'active':''} aria-pressed={workFilter===filter} onClick={()=>{setWorkFilter(filter);setShowAllProjects(false)}}>{filter}</button>)}</div><div className="project-list">{matchingProjects.slice(0, showAllProjects ? matchingProjects.length : 4).map(({project,i}) => <article className={`project project-${i % 4}`} key={`${project.name}-${i}`}><ProjectGallery project={project} index={i}/><div className="project-info"><div className="project-heading"><div><h3>{project.name}</h3><p>{project.type}</p></div>{project.link ? <a className="project-action-link" href={project.link} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${project.name} live`}>{project.type.toLowerCase().includes('shopify') ? <svg className="project-action-icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 7h12l1 10H3L4 7Z"/><path d="M7 8V5a3 3 0 0 1 6 0v3"/></svg> : <svg className="project-action-icon" viewBox="0 0 20 20" aria-hidden="true"><rect x="2.5" y="3.5" width="15" height="13" rx="2"/><path d="M3 7h14M6 5.3h.1m2.2 0h.1"/></svg>}<span>{project.type.toLowerCase().includes('shopify') ? 'View app' : 'Visit website'}</span><span className="project-action-arrow" aria-hidden="true">↗</span></a> : <a className="circle-link" href={`mailto:${c.email}?subject=${encodeURIComponent(`Project: ${project.name}`)}`} aria-label={`Ask about ${project.name}`}>↗</a>}</div><p className="project-description">{project.description}</p><ul className="project-details">{bullets(project.details)}</ul><div className="chips">{project.stack.map(item => <span key={item}>{item}</span>)}</div></div></article>)}</div>{matchingProjects.length>4&&<div className="projects-more"><button type="button" className="projects-more-button" onClick={()=>setShowAllProjects(show=>!show)}>{showAllProjects ? 'Show featured projects' : 'View all projects'}<span aria-hidden="true">{showAllProjects ? '↑' : '↓'}</span></button></div>}</section>
    <section className="experience-section" id="experience"><div className="wrap"><div className="section-title"><div><span className="section-kicker">Where I’ve grown</span><h2>Experience<span>.</span></h2></div><span className="section-aside">Building better things,<br/>one collaboration at a time.</span></div><div className="experience-layout"><div className="experience-orbit experience-orbit-center"><span>{c.metrics[0]?.value ?? '1+'}</span><small>YEARS<br/>IN PRACTICE</small></div><div className="timeline">{c.experience.map((job, i) => <article className="timeline-item" key={`${job.company}-${job.role}-${i}`}><div className="timeline-dot" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/></svg></div><div className="job-heading"><div><h3>{job.role}</h3><p>{job.company}</p>{(job.companyWebsite||job.companyEmail||job.companyPhone)&&<div className="company-contact-links">{job.companyWebsite&&<a href={job.companyWebsite} target="_blank" rel="noopener noreferrer"><span aria-hidden="true">↗</span> Website</a>}{job.companyEmail&&<a href={`mailto:${job.companyEmail}`}><span aria-hidden="true">✉</span> Email</a>}{job.companyPhone&&<a href={`tel:${job.companyPhone.replace(/[^+\d]/g,'')}`}><svg className="company-phone-icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M5.2 2.8h2.2l1.1 3.6-1.7 1.2a12 12 0 0 0 5.6 5.6l1.2-1.7 3.6 1.1v2.2a2 2 0 0 1-2.2 2A13.5 13.5 0 0 1 3.2 5a2 2 0 0 1 2-2.2Z"/></svg> Call</a>}</div>}</div><time>{job.period}</time></div><ul>{bullets(job.points)}</ul></article>)}</div></div></div></section>
    <section className="about-section wrap" id="about"><div className="section-title"><div><span className="section-kicker">The person behind the pixels</span><h2>Curious by nature<span>.</span></h2></div></div><div className="about-grid"><div className="about-left-column"><div className="about-note"><div className="note-orbit"><span>✳</span></div><span className="note-label">A NOTE TO SELF</span><p>Keep asking<br/>better questions.</p><span className="note-signature">— Jaydeep</span></div><section className="about-carousel-section" aria-label="Product principles"><div className="about-carousel-heading"><div><span className="section-kicker">A little about how I work</span><h3>Good work, by design<span>.</span></h3></div></div><div className="about-carousel-viewport" role="region" aria-label="Product principles"><div className="about-carousel-track"><div className="about-principle-group"><article className="about-principle-card"><span className="about-principle-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.1 6.2L20 11l-5.9 2.1L12 19l-2.1-5.9L4 11l5.9-1.8L12 3Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/></svg></span><span className="about-principle-label">PRODUCT THINKING</span><h4>Make complex feel simple.</h4><p>Clear flows and thoughtful details that help people get where they need to go.</p></article><article className="about-principle-card"><span className="about-principle-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="7" height="7" rx="2"/><rect x="14" y="13" width="7" height="7" rx="2"/><path d="M10 7.5h3a2 2 0 0 1 2 2v3.5M14 16.5h-3a2 2 0 0 1-2-2V11"/></svg></span><span className="about-principle-label">ENGINEERING</span><h4>Build for the real world.</h4><p>Reliable backends, useful integrations, and foundations that can grow with a product.</p></article><article className="about-principle-card"><span className="about-principle-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/><path d="m16.5 17 1.5 1.5 3-3"/></svg></span><span className="about-principle-label">CRAFT</span><h4>Care about the small things.</h4><p>Polish the interactions, edges, and moments that make software feel considered.</p></article></div><div className="about-principle-group" aria-hidden="true"><article className="about-principle-card"><span className="about-principle-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.1 6.2L20 11l-5.9 2.1L12 19l-2.1-5.9L4 11l5.9-1.8L12 3Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/></svg></span><span className="about-principle-label">PRODUCT THINKING</span><h4>Make complex feel simple.</h4><p>Clear flows and thoughtful details that help people get where they need to go.</p></article><article className="about-principle-card"><span className="about-principle-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="7" height="7" rx="2"/><rect x="14" y="13" width="7" height="7" rx="2"/><path d="M10 7.5h3a2 2 0 0 1 2 2v3.5M14 16.5h-3a2 2 0 0 1-2-2V11"/></svg></span><span className="about-principle-label">ENGINEERING</span><h4>Build for the real world.</h4><p>Reliable backends, useful integrations, and foundations that can grow with a product.</p></article><article className="about-principle-card"><span className="about-principle-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/><path d="m16.5 17 1.5 1.5 3-3"/></svg></span><span className="about-principle-label">CRAFT</span><h4>Care about the small things.</h4><p>Polish the interactions, edges, and moments that make software feel considered.</p></article></div></div></div></section></div><div className="about-details"><p className="about-lead">I like making the complex feel simple, the useful feel delightful, and the everyday feel more considered.</p><p>My work sits at the intersection of product thinking and full-stack development. From AI-powered assistants to learning platforms, I enjoy understanding how things fit together and finding the details that make them feel right. I believe the best digital experiences are built with a balance of thoughtful design, meaningful functionality, and attention to detail.</p><div className="education-list"><span className="section-kicker">EDUCATION</span>{c.education.map((item, i) => <div className="education-item" key={`${item.degree}-${i}`}><div><strong>{item.degree}</strong><span>{item.school}</span></div><time>{item.period}</time></div>)}</div></div></div></section>
    <section className="skills-section" id="toolkit"><div className="wrap"><div className="section-title"><div><span className="section-kicker">Tools I reach for</span><h2>My toolkit<span>.</span></h2></div><span className="section-aside">The tools behind the<br/>things I love to build.</span></div><div className="skill-filters" role="group" aria-label="Filter toolkit by category">{skillFilters.map(filter => <button type="button" key={filter} className={skillFilter === filter ? 'is-active' : ''} aria-pressed={skillFilter === filter} onClick={() => setSkillFilter(filter)}>{filter}</button>)}</div><div className={`skill-grid ${skillFilter === 'All' ? 'skill-grid-all' : 'skill-grid-filtered'}`}>{displayedSkillGroups.map((group, i) => <article className="skill-group" key={`${group.group}-${i}`}><header className="skill-card-heading"><h3>{group.group}</h3><span className="skill-card-count">{String(group.items.length).padStart(2, '0')} TOOLS</span></header><div className="skill-items" data-count={group.items.length} role="group" aria-label={`${group.group} technologies`}><div className="skill-item-track"><div className="skill-item-set">{group.items.map(item => <span className="skill-tile" key={item}><SkillLogo name={item}/><span>{item}</span></span>)}</div><div className="skill-item-set" aria-hidden="true">{group.items.map(item => <span className="skill-tile" key={item}><SkillLogo name={item}/><span>{item}</span></span>)}</div></div></div></article>)}</div></div></section>
        <section className="contact-section wrap" id="contact"><div className="contact-layout"><div className="contact-form-side"><span className="section-kicker">GET IN TOUCH</span><h2>Let&apos;s connect<span>.</span></h2><p className="contact-intro">Have something in mind? Tell me a little about it and I’ll get back to you.</p><form className="contact-form" onSubmit={async event => { event.preventDefault(); const form = event.currentTarget; const values = new FormData(form); setContactSending(true); setContactSent(false); setContactError(''); try { const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: values.get('name'), email: values.get('email'), message: values.get('message') }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error ?? 'Your message could not be sent.'); setContactSent(true); form.reset() } catch (error) { setContactError(error instanceof Error ? error.message : 'Your message could not be sent. Please try again.') } finally { setContactSending(false) } }}><label>Name<input name="name" required maxLength={100} autoComplete="name" placeholder="Your name"/></label><label>Email<input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="Your email address"/></label><label className="contact-message">Message<textarea name="message" rows={5} required maxLength={5000} placeholder="Tell me about your project..."/></label><div className="contact-form-actions"><button className="button button-dark" type="submit" disabled={contactSending}>{contactSending ? 'Sending…' : 'Send message'} <span aria-hidden="true">↗</span></button>{contactSent && <p className="contact-hint" role="status">Thanks for reaching out. Your message has been sent.</p>}{contactError && <p className="contact-hint" role="alert">{contactError}</p>}</div></form></div><aside className="contact-profile"><div className="contact-profile-heading"><div className="contact-avatar"><img src="/jaydeep-portrait-dark.png" alt={`${c.name} portrait`}/><span aria-hidden="true"/></div><div className="contact-profile-name"><span className="section-kicker">A LITTLE ABOUT ME</span><h3>{c.name}</h3><p>{c.title}</p></div></div><p className="contact-profile-copy">I enjoy turning thoughtful ideas into useful, carefully built digital products.</p><div className="contact-details"><a href={`mailto:${c.email}`}><span className="contact-detail-icon" aria-hidden="true">✉</span><span><small>EMAIL</small>{c.email}</span></a>{c.phone && <a href={`tel:${c.phone.replace(/[^+\d]/g, '')}`}><span className="contact-detail-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 3.5h3l1.5 4.2-2 1.4a14 14 0 0 0 6.4 6.4l1.4-2 4.2 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3 5.7 2 2 0 0 1 5 3.5Z"/></svg></span><span><small>PHONE</small>{c.phone}</span></a>}{c.location && <div><span className="contact-detail-icon" aria-hidden="true">⌖</span><span><small>LOCATION</small>{c.location}</span></div>}</div><div className="contact-profile-footer">{c.availability && <span className="contact-availability"><i/> {c.availability}</span>}<div className="contact-socials">{c.linkedin && <a href={c.linkedin} target="_blank" rel="noreferrer">LinkedIn <span>↗</span></a>}{c.github && <a href={c.github} target="_blank" rel="noreferrer">GitHub <span>↗</span></a>}</div></div></aside></div></section>
                <footer className="footer"><div className="wrap footer-layout"><div className="footer-identity"><a href="#home" className="footer-brand"><img src="/jaydeep-logo.svg" alt=""/><span>Jaydeep Katariya<span>.</span></span></a><p>Thoughtful products, built with care.</p><div className="footer-contact"><a href={`mailto:${c.email}`}><small>EMAIL</small>{c.email}</a>{c.phone && <a href={`tel:${c.phone.replace(/[^+\d]/g, '')}`}><small>PHONE</small>{c.phone}</a>}</div></div><nav className="footer-nav" aria-label="Social links">{c.linkedin && <a href={c.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>}<a href="https://github.com/Jaydeepkatariy" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a></nav><div className="footer-bottom"><span>© {new Date().getFullYear()} Jaydeep Katariya</span><div className="footer-credit-links"><a href="https://mansibaldaniya.vercel.app" target="_blank" rel="noopener noreferrer">mansibaldaniya.vercel.app <span aria-hidden="true">↗</span></a></div></div></div></footer>
  </main>
}

function App(){return <><CursorFollower/>{window.location.pathname.startsWith('/admin')?<AdminPanel/>:<Portfolio/>}</>}
createRoot(document.getElementById('root')!).render(<App/> )
