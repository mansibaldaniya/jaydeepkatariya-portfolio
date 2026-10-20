import { useEffect, useState, type FormEvent, type ReactNode } from 'react'

type Experience = { role: string; company: string; period: string; points: string[] }
type Project = { name: string; type: string; description: string; details: string[]; stack: string[]; images?: string[] }
type Education = { degree: string; school: string; period: string }
type SkillGroup = { group: string; items: string[] }
type Metric = { value: string; label: string }
type Content = { name: string; title: string; location: string; availability: string; email: string; phone: string; linkedin: string; github: string; heroDescription: string; heroMessages: string[]; portraitRoles: string[]; metrics: Metric[]; experience: Experience[]; education: Education[]; skills: SkillGroup[]; projects: Project[]; languages: string[] }
const blank: Content = { name: '', title: '', location: '', availability: '', email: '', phone: '', linkedin: '', github: '', heroDescription: '', heroMessages: [], portraitRoles: [], metrics: [], experience: [], education: [], skills: [], projects: [], languages: [] }
const pages = [
  { id: 'overview', label: 'Overview', icon: '⌂', description: 'A snapshot of your portfolio content.' },
  { id: 'profile', label: 'Profile & contact', icon: '◉', description: 'Your name, introduction, and contact details.' },
  { id: 'metrics', label: 'Career highlights', icon: '✦', description: 'Edit the four scrolling career highlights on your homepage.' },
  { id: 'projects', label: 'Projects', icon: '▧', description: 'Manage the work and products shown on your site.' },
  { id: 'experience', label: 'Experience', icon: '↗', description: 'Update your roles and contributions.' },
  { id: 'education', label: 'Education', icon: '▤', description: 'Manage your qualifications.' },
  { id: 'skills', label: 'Skills & languages', icon: '✳', description: 'Organize your technical skills and languages.' },
] as const
type PageId = typeof pages[number]['id']

async function api(path: string, options: RequestInit = {}) {
  const response = await fetch(`/api${path}`, { ...options, credentials: 'include', headers: { 'Content-Type': 'application/json', ...options.headers } })
  const data = response.status === 204 ? null : await response.json()
  if (!response.ok) throw new Error(data?.error ?? 'Something went wrong.')
  return data
}
function initialPage(): PageId {
  const route = window.location.pathname.split('/').filter(Boolean)[1] as PageId | undefined
  return pages.some(page => page.id === route) ? route! : 'overview'
}
function Field({ label, value, onChange, maxLength, multiline = false, type = 'text', autoComplete }: { label: string; value: string; onChange: (value: string) => void; maxLength?: number; multiline?: boolean; type?: string; autoComplete?: string }) {
  const [visible, setVisible] = useState(false)
  return <label className="admin-field"><span>{label}</span>{multiline ? <textarea value={value} maxLength={maxLength} onChange={event => onChange(event.target.value)}/> : <div className="input-wrap"><input type={type === 'password' && visible ? 'text' : type} value={value} maxLength={maxLength} autoComplete={autoComplete} onChange={event => onChange(event.target.value)}/>{type === 'password' && <button type="button" className="password-toggle" onClick={() => setVisible(value => !value)} aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible}>{visible ? 'Hide' : 'Show'}</button>}</div>}</label>
}
function CardHeading({ number, title, description, action }: { number: string; title: string; description: string; action?: ReactNode }) {
  return <div className="editor-card-title"><span>{number}</span><div><h2>{title}</h2><p>{description}</p></div>{action}</div>
}

export default function AdminPanel() {
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [content, setContent] = useState<Content>(blank)
  const [page, setPage] = useState<PageId>(initialPage)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingProject, setUploadingProject] = useState<number | null>(null)
  useEffect(() => {
    const pop = () => setPage(initialPage())
    window.addEventListener('popstate', pop)
    return () => window.removeEventListener('popstate', pop)
  }, [])
  useEffect(() => {
    api('/admin/status').then((result: { configured: boolean }) => {
      setConfigured(result.configured)
      if (result.configured) api('/admin/me').then((result: { username: string }) => { setEmail(result.username); setLoggedIn(true) }).catch(() => undefined)
    }).catch(() => setError('Could not connect to the portfolio server.'))
  }, [])
  useEffect(() => { if (loggedIn) api('/content').then(setContent).catch((e: Error) => setError(e.message)) }, [loggedIn])
  const navigate = (next: PageId) => {
    window.history.pushState({}, '', next === 'overview' ? '/admin' : `/admin/${next}`)
    setPage(next); setError(''); setNotice('')
  }
  const update = <K extends keyof Content>(key: K, value: Content[K]) => setContent(current => ({ ...current, [key]: value }))
  const updateItem = <K extends 'experience' | 'education' | 'skills' | 'projects' | 'metrics'>(key: K, index: number, item: Content[K][number]) => setContent(current => ({ ...current, [key]: current[key].map((entry, i) => i === index ? item : entry) }))
  const uploadProjectImages = async (index: number, files: FileList | null) => {
    if (!files?.length) return
    const project = content.projects[index]
    let images = [...(project.images ?? [])]
    const selected = Array.from(files)
    if (images.length + selected.length > 8) { setError('A project can have up to 8 images.'); return }
    setError(''); setNotice(''); setUploadingProject(index)
    try {
      for (const file of selected) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose JPG, PNG, or WEBP images.')
        if (file.size > 5 * 1024 * 1024) throw new Error('Each image must be no larger than 5 MB.')
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read image.'))
          reader.onerror = () => reject(new Error('Could not read image.'))
          reader.readAsDataURL(file)
        })
        const result = await api('/admin/uploads', { method: 'POST', body: JSON.stringify({ dataUrl }) }) as { url: string }
        images.push(result.url)
      }
      updateItem('projects', index, { ...project, images })
      setNotice(`${selected.length} image${selected.length === 1 ? '' : 's'} uploaded. Save changes to publish.`)
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to upload images.') }
    finally { setUploadingProject(null) }
  }
  const authenticate = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError('')
    try { const result = await api(configured ? '/admin/login' : '/admin/setup', { method: 'POST', body: JSON.stringify({ username: email, password }) }); setEmail(result.username); setConfigured(true); setLoggedIn(true); setPassword('') }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to sign in.') } finally { setBusy(false) }
  }
  const save = async () => {
    setBusy(true); setError(''); setNotice('')
    try { await api('/admin/content', { method: 'PUT', body: JSON.stringify(content) }); setNotice('Changes saved successfully.'); setSaved(true); window.setTimeout(() => setSaved(false), 1800) }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to save changes.') } finally { setBusy(false) }
  }
  const logout = async () => { try { await api('/admin/logout', { method: 'POST' }) } catch { /* session may have expired */ } finally { setLoggedIn(false); setNotice(''); setError('') } }
  if (configured === null) return <div className="admin-page"><div className="loading-screen"><span className="loader"/> Connecting securely</div></div>
  if (!loggedIn) return <main className="admin-page"><a className="brand admin-brand" href="/" aria-label="Jaydeep Katariya home"><img className="brand-logo" src="/jaydeep-logo.svg" alt=""/></a><div className="login-card"><a className="back-link" href="/">← Back to portfolio</a><span className="section-kicker">JAYDEEP’S PORTFOLIO</span><h1>{configured ? 'Welcome back.' : 'Set up your admin.'}</h1><p>{configured ? 'Sign in to update your portfolio details.' : 'Create your private admin login to manage this site.'}</p><form onSubmit={authenticate}><Field label="Email address" value={email} onChange={setEmail} maxLength={200} type="email" autoComplete="username"/><Field label="Password" value={password} onChange={setPassword} maxLength={200} type="password" autoComplete={configured ? 'current-password' : 'new-password'}/>{error && <p className="admin-error">{error}</p>}<button className="button button-dark login-button" disabled={busy}>{busy ? 'Please wait…' : configured ? 'Sign in →' : 'Create admin account →'}</button></form>{!configured && <p className="setup-hint">Your account is stored on this server. Passwords are stored as salted hashes, never in plain text.</p>}</div></main>

  const current = pages.find(item => item.id === page)!
  const saveButton = <button className={`button button-dark save-button ${saved ? 'saved' : ''}`} disabled={busy} onClick={save}>{busy ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}</button>
  const pageHeading = <div className="admin-page-heading"><div><span className="section-kicker">CONTENT MANAGER / {current.label.toUpperCase()}</span><h1>{page === 'overview' ? `Good to see you, ${content.name.split(' ')[0] || 'Jaydeep'}.` : current.label}<span>.</span></h1><p>{current.description}</p></div>{page !== 'overview' && saveButton}</div>
  let panel: ReactNode
  if (page === 'overview') panel = <><div className="admin-stats">{[{ label: 'Projects', value: content.projects.length, page: 'projects' as PageId, icon: '▧' }, { label: 'Experience roles', value: content.experience.length, page: 'experience' as PageId, icon: '↗' }, { label: 'Education items', value: content.education.length, page: 'education' as PageId, icon: '▤' }, { label: 'Skill groups', value: content.skills.length, page: 'skills' as PageId, icon: '✳' }].map(stat => <button className="stat-card" key={stat.label} onClick={() => navigate(stat.page)}><span>{stat.icon} &nbsp; {stat.label}</span><strong>{stat.value.toString().padStart(2, '0')}</strong><small>Manage section ↗</small></button>)}</div><section className="admin-welcome"><div className="welcome-orbit">✳</div><span className="section-kicker">YOUR PORTFOLIO IS LOOKING GOOD</span><h2>Keep your story<br/><em>up to date.</em></h2><p>Choose a section to make changes. Your public site keeps its design while you update the content.</p><button className="button button-dark" onClick={() => navigate('profile')}>Edit profile <span>→</span></button></section><div className="quick-links"><h2>Content sections</h2>{pages.filter(item => item.id !== 'overview').map(item => <button key={item.id} onClick={() => navigate(item.id)}><span className="quick-icon">{item.icon}</span><span><strong>{item.label}</strong><small>{item.description}</small></span><b>↗</b></button>)}</div></>
  else if (page === 'profile') panel = <section className="editor-card"><CardHeading number="01" title="Profile & contact" description="Your name, hero copy, and contact details."/><div className="field-grid">{([['Full name','name',80],['Professional title','title',100],['Email','email',200],['Phone','phone',50],['LinkedIn URL (https://)','linkedin',300],['GitHub URL (https://)','github',300]] as const).map(([label,key,max])=><Field key={key} label={label} value={content[key]} maxLength={max} onChange={value=>update(key,value)}/>)}<div className="field-wide"><Field label="Hero description" value={content.heroDescription} maxLength={300} multiline onChange={value=>update('heroDescription',value)}/></div><div className="field-wide"><Field label="Rotating hero messages (one per line, exactly 4)" value={content.heroMessages.join('\n')} maxLength={403} multiline onChange={value=>update('heroMessages',value.split('\n').slice(0,4))}/></div><div className="field-wide"><Field label="Portrait role captions (one per line, exactly 4)" value={content.portraitRoles.join('\n')} maxLength={403} multiline onChange={value=>update('portraitRoles',value.split('\n').slice(0,4))}/></div></div></section>
  else if (page === 'metrics') panel = <section className="editor-card"><CardHeading number="01" title="Career highlights" description="Edit the value and label for each item in the homepage carousel."/>{content.metrics.map((metric,i)=><div className="compact-repeat metric-editor" key={`metric-${i}`}><Field label={`Highlight ${String(i+1).padStart(2,'0')} value`} value={metric.value} maxLength={20} onChange={v=>updateItem('metrics',i,{...metric,value:v})}/><Field label="Label" value={metric.label} maxLength={60} onChange={v=>updateItem('metrics',i,{...metric,label:v})}/></div>)}</section>
  else if (page === 'projects') panel = <section className="editor-card"><CardHeading number="01" title="Portfolio projects" description="Update project descriptions, highlights, and technologies." action={<button className="add-button" disabled={content.projects.length >= 16} onClick={()=>update('projects',[...content.projects,{name:'New project',type:'Project type',description:'A short introduction.',details:['A key detail.'],stack:['Technology'],images:[]}])}>+ Add project</button>}/>{content.projects.map((project,i)=><div className="repeat-card" key={`project-${i}`}><div className="repeat-title"><strong>PROJECT {String(i+1).padStart(2,'0')}</strong><button className="remove-button" onClick={()=>update('projects',content.projects.filter((_,j)=>j!==i))}>Remove project</button></div><div className="project-image-editor"><div className="upload-heading"><div><strong>PROJECT IMAGES</strong><span>{(project.images ?? []).length} / 8 images</span></div><label className="upload-button">{uploadingProject === i ? 'Uploading...' : 'Upload images'}<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={uploadingProject !== null || (project.images ?? []).length >= 8} onChange={event => { void uploadProjectImages(i, event.currentTarget.files); event.currentTarget.value = '' }}/></label></div><div className="upload-previews">{(project.images ?? []).map((url,imageIndex)=><div className="upload-preview" key={`${url}-${imageIndex}`}><img src={url} alt={`${project.name} image ${imageIndex + 1}`}/><button type="button" className="remove-image" aria-label={`Remove image ${imageIndex + 1}`} onClick={()=>updateItem('projects',i,{...project,images:(project.images ?? []).filter((_,j)=>j!==imageIndex)})}>{String.fromCharCode(215)}</button></div>)}{!(project.images ?? []).length&&<p>No images yet. Add one or more images to show them in the portfolio.</p>}</div><small>JPG, PNG, or WEBP / up to 5 MB each. Multiple images appear as a slider.</small></div><div className="field-grid"><Field label="Project name" value={project.name} maxLength={120} onChange={v=>updateItem('projects',i,{...project,name:v})}/><Field label="Project type" value={project.type} maxLength={120} onChange={v=>updateItem('projects',i,{...project,type:v})}/><div className="field-wide"><Field label="Description" value={project.description} maxLength={500} multiline onChange={v=>updateItem('projects',i,{...project,description:v})}/></div><div className="field-wide"><Field label="Highlights (one per line)" value={project.details.join('\n')} multiline onChange={v=>updateItem('projects',i,{...project,details:v.split('\n').slice(0,12)})}/></div><div className="field-wide"><Field label="Technologies (one per line)" value={project.stack.join('\n')} multiline onChange={v=>updateItem('projects',i,{...project,stack:v.split('\n').slice(0,20)})}/></div></div></div>)}</section>
  else if (page === 'experience') panel = <section className="editor-card"><CardHeading number="01" title="Work history" description="Keep role titles, dates, and contributions current." action={<button className="add-button" disabled={content.experience.length >= 12} onClick={()=>update('experience',[...content.experience,{role:'New role',company:'Company',period:'Year – Present',points:['A contribution.']}])}>+ Add role</button>}/>{content.experience.map((job,i)=><div className="repeat-card" key={`job-${i}`}><div className="repeat-title"><strong>ROLE {String(i+1).padStart(2,'0')}</strong><button className="remove-button" onClick={()=>update('experience',content.experience.filter((_,j)=>j!==i))}>Remove role</button></div><div className="field-grid"><Field label="Role" value={job.role} maxLength={100} onChange={v=>updateItem('experience',i,{...job,role:v})}/><Field label="Company" value={job.company} maxLength={120} onChange={v=>updateItem('experience',i,{...job,company:v})}/><Field label="Period" value={job.period} maxLength={80} onChange={v=>updateItem('experience',i,{...job,period:v})}/><div className="field-wide"><Field label="Contributions (one per line)" value={job.points.join('\n')} multiline onChange={v=>updateItem('experience',i,{...job,points:v.split('\n').slice(0,12)})}/></div></div></div>)}</section>
  else if (page === 'education') panel = <section className="editor-card"><CardHeading number="01" title="Education" description="Add degrees, schools, and study periods." action={<button className="add-button" disabled={content.education.length >= 8} onClick={()=>update('education',[...content.education,{degree:'Qualification',school:'Institution',period:'Year – Year'}])}>+ Add education</button>}/>{content.education.map((item,i)=><div className="repeat-card" key={`education-${i}`}><div className="repeat-title"><strong>EDUCATION {String(i+1).padStart(2,'0')}</strong><button className="remove-button" onClick={()=>update('education',content.education.filter((_,j)=>j!==i))}>Remove education</button></div><div className="field-grid"><Field label="Degree or qualification" value={item.degree} maxLength={140} onChange={v=>updateItem('education',i,{...item,degree:v})}/><Field label="Institution" value={item.school} maxLength={140} onChange={v=>updateItem('education',i,{...item,school:v})}/><Field label="Period" value={item.period} maxLength={80} onChange={v=>updateItem('education',i,{...item,period:v})}/></div></div>)}</section>
  else panel = <><section className="editor-card"><CardHeading number="01" title="Skill groups" description="Group technologies and methods by category." action={<button className="add-button" disabled={content.skills.length >= 16} onClick={()=>update('skills',[...content.skills,{group:'New category',items:['Skill']}])}>+ Add group</button>}/>{content.skills.map((group,i)=><div className="compact-repeat" key={`skill-${i}`}><Field label="Category" value={group.group} maxLength={80} onChange={v=>updateItem('skills',i,{...group,group:v})}/><Field label="Skills (one per line)" value={group.items.join('\n')} multiline onChange={v=>updateItem('skills',i,{...group,items:v.split('\n').slice(0,30)})}/><button className="remove-button" onClick={()=>update('skills',content.skills.filter((_,j)=>j!==i))}>Remove</button></div>)}</section><section className="editor-card"><CardHeading number="02" title="Languages" description="List languages and proficiency levels."/><Field label="Languages (one per line)" value={content.languages.join('\n')} multiline onChange={v=>update('languages',v.split('\n').slice(0,12))}/></section></>

  return <main className="admin-shell"><aside className="admin-sidebar"><a className="brand" href="/" aria-label="Jaydeep Katariya home"><img className="brand-logo" src="/jaydeep-logo.svg" alt=""/></a><div className="sidebar-caption">WORKSPACE</div><nav className="admin-nav">{pages.map(item=><button key={item.id} className={page===item.id?'active':''} onClick={()=>navigate(item.id)}><span className="sidebar-icon">{item.icon}</span>{item.label}{page===item.id&&<i/>}</button>)}</nav><div className="sidebar-bottom"><a href="/" target="_blank">View live site <span>↗</span></a><span className="sidebar-owner"><span className="admin-live"/>{email}</span></div></aside><div className="admin-main"><header className="admin-topbar"><div><span className="admin-breadcrumb">Jaydeep’s portfolio</span><span className="breadcrumb-slash">/</span><strong>{current.label}</strong></div><button className="text-link" onClick={logout}>Sign out ↗</button></header><div className="admin-workspace">{pageHeading}{error&&<div className="toast toast-error">{error}</div>}{notice&&<div className="toast">{notice}</div>}{panel}{page!=='overview'&&<div className="editor-bottom"><span className="section-kicker">CHANGES ARE SAVED TO YOUR PORTFOLIO</span>{saveButton}</div>}</div></div></main>
}
