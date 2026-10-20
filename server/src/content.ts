export type Experience = { role: string; company: string; period: string; points: string[]; companyWebsite?: string; companyEmail?: string; companyPhone?: string }
export type Project = { name: string; type: string; description: string; details: string[]; stack: string[]; images?: string[]; link?: string }
export type Education = { degree: string; school: string; period: string }
export type Metric = { value: string; label: string }
export type PortfolioContent = {
  name: string; title: string; location: string; availability: string; email: string; phone: string; linkedin: string; github: string
  heroDescription: string; heroMessages: string[]; portraitRoles: string[]; metrics: Metric[]; experience: Experience[]; education: Education[]; skills: { group: string; items: string[] }[]; projects: Project[]; languages: string[]
}

export const defaultContent: PortfolioContent = {
  name: 'Jaydeep Katariya', title: 'Software Developer', location: 'Surat, India', availability: 'Open to opportunities',
  email: 'jaydeepkatariya21@gmail.com', phone: '+91 70462 99866', linkedin: '', github: '',
  heroDescription: 'I design and build thoughtful digital experiences, from scalable web platforms to Shopify apps and AI-powered products.',
  heroMessages: ['Open to New Opportunities', 'Available for Freelance Work', 'Open to Work & Collaboration', 'Turning Ideas into Digital Experiences'],
  portraitRoles: ['Shopify App Developer', 'Backend Developer', 'SaaS Application Developer', 'API Integration Developer'],
  metrics: [
    { value: '1+', label: 'Years of Experience' },
    { value: '10+', label: 'Projects Built' },
    { value: '8+', label: 'Technologies' },
    { value: '3+', label: 'Full Stack Applications' },
  ],
  experience: [
    { role: 'Junior Software Developer', company: 'Brainfleck Solutions', period: 'Oct 2024 – Present', points: ['Develop and maintain full-stack applications using Laravel, React.js, PHP, and MySQL.', 'Build scalable backend APIs and business logic for Shopify and e-learning platforms.', 'Integrate AI-powered chatbots using the OpenAI API and Shopify ecosystem tools.', 'Create responsive interfaces with React.js, JavaScript, jQuery, HTML5, CSS3, Ajax, and Blade.', 'Integrate Shopify APIs, Razorpay, Cashfree, and webhooks.', 'Collaborate across teams to design, develop, test, and deploy applications.', 'Improve databases and API performance; use Git and Docker in development and deployment workflows.'], companyWebsite: 'https://brainfleck.com/', companyEmail: 'info@brainfleck.com', companyPhone: '+91 9727371118' },
    { role: 'Software Developer Intern', company: 'Brainfleck Solutions', period: 'Apr 2024 – Sep 2024', points: ['Contributed to full-stack application development with Laravel, React.js, PHP, and MySQL.', 'Assisted with API integrations, frontend development, database management, and feature delivery.', 'Worked with the development team on scalable, user-focused solutions.'], companyWebsite: 'https://brainfleck.com/', companyEmail: 'info@brainfleck.com', companyPhone: '+91 9727371118' },
  ],
  education: [
    { degree: 'Master of Computer Applications (MCA)', school: 'LJ University', period: '2022 – 2024' },
    { degree: 'Bachelor of Arts', school: 'The Maharaja Sayajirao University', period: '2019 – 2022' },
  ],
  skills: [
    { group: 'Frontend', items: ['HTML5', 'CSS3', 'React.js', 'JavaScript', 'Shopify Liquid'] },
    { group: 'Frameworks & Backend', items: ['Laravel', 'Craft CMS', 'PHP 8+'] },
    { group: 'Tools & Platforms', items: ['Git', 'Docker', 'Shopify', 'Shopify Polaris', 'OpenAI API', 'Webhooks'] },
    { group: 'Database', items: ['MySQL'] },
    { group: 'Testing', items: ['Black box testing', 'White box testing', 'Functional testing', 'API testing', 'Cross-browser testing'] },
  ],
  projects: [
    { name: 'Chatara AI — Smart Assistant', type: 'Shopify Application', description: 'An AI-powered Shopify assistant that helps customers discover products and get support through natural conversation.', details: ['Built natural-language customer interactions, product discovery, recommendations, and conversational memory with the OpenAI API.', 'Implemented real-time product and order synchronization using Shopify webhooks and MCP integration.', 'Created a customizable React and Shopify Polaris dashboard for chatbot appearance, behavior, and store setup.'], stack: ['OpenAI API', 'Shopify', 'React', 'Shopify Polaris', 'Webhooks'], images: ['/api/uploads/chatara.jpeg'], link: 'https://apps.shopify.com/chatara-ai-chat-assistant?st_source=autocomplete&surface_detail=autocomplete_apps' },
    { name: 'ChalDigital', type: 'Affiliate Marketing & Education Platform', description: 'A learning and affiliate platform for courses, referrals, and earnings.', details: ['Built course management, enrollment, checkout, and certificate features.', 'Created admin tools for users, courses, orders, affiliate earnings, and referrals with automated payment and account verification.', 'Implemented learner dashboards for progress, enrollments, referral tracking, and earnings.'], stack: ['Laravel', 'React', 'PHP', 'MySQL'], link: 'https://chaldigital.com/' },
    { name: 'Questly (QuizPilot)', type: 'Shopify Product Quiz App', description: 'A no-code quiz builder that helps Shopify merchants guide customers to personalized product recommendations.', details: ['Built the quiz app and admin panel with Shopify Polaris, Theme App Extensions, Shopify APIs, OAuth, webhooks, and billing.', 'Integrated Mailchimp, Klaviyo, ActiveCampaign, and Zapier/Make for lead capture and marketing automation.'], stack: ['Laravel', 'React', 'Shopify APIs', 'Polaris', 'OAuth'], images: ['/api/uploads/questly.jpeg'], link: 'https://apps.shopify.com/questly-smart-quiz?st_source=autocomplete&surface_detail=autocomplete_apps' },
    { name: 'Repilo', type: 'Shopify Loyalty & Rewards App', description: 'A Shopify loyalty platform for points, rewards, referrals, VIP tiers, and redemptions.', details: ['Implemented customer and order synchronization and points reconciliation with Shopify webhooks and ledger-based balances.', 'Built merchant dashboards and storefront experiences with Shopify Polaris, App Bridge, and Theme App Extensions.', 'Integrated third-party services including Judge.me.'], stack: ['Laravel', 'React', 'Shopify APIs', 'Polaris', 'Webhooks'], images: ['/api/uploads/repilo.jpeg'] },
    { name: 'Jap Tap', type: 'Android Application · Backend Development', description: 'An Android application for daily japa practice, with a backend that supports a smooth and consistent user experience.', details: ['Developed backend APIs used by the Android app to exchange and manage application data.', 'Built reliable server-side data handling to support user activity and progress tracking.', 'Collaborated on API integration and backend improvements as the project evolved.'], stack: ['Backend Development', 'REST APIs', 'PHP', 'MySQL', 'Android'] },
  ],
  languages: ['English — Professional working proficiency', 'Hindi — Professional working proficiency', 'Gujarati — Native speaker'],
}

const text = (value: unknown, max: number) => typeof value === 'string' && value.trim().length > 0 && value.length <= max
const textList = (value: unknown, maxItems: number, maxLength: number) => Array.isArray(value) && value.length <= maxItems && value.every(item => text(item, maxLength))
const validUrlOrEmpty = (value: unknown) => typeof value === 'string' && value.length <= 300 && (!value || /^https:\/\//i.test(value))

export function projectValidationMessage(value: unknown): string | null {
  if (!Array.isArray(value)) return 'Projects must be a list. Please reload the page and try again.'
  if (value.length > 16) return 'You can add up to 16 projects.'
  for (const [index, project] of value.entries()) {
    const label = `Project ${String(index + 1).padStart(2, '0')}`
    if (!project || typeof project !== 'object') return `${label} has invalid data.`
    const p = project as Project
    if (!text(p.name, 120)) return `${label}: enter a name (up to 120 characters).`
    if (!text(p.type, 120)) return `${label}: enter a project type (up to 120 characters).`
    if (!text(p.description, 500)) return `${label}: enter a description (up to 500 characters).`
    if (!textList(p.details, 12, 400)) return `${label}: highlights need 1–12 non-empty lines, each up to 400 characters.`
    if (!textList(p.stack, 20, 70)) return `${label}: technologies need 1–20 non-empty lines, each up to 70 characters.`
    if (p.link !== undefined && !validUrlOrEmpty(p.link)) return `${label}: the live URL must start with https:// and be no longer than 300 characters.`
    if (p.images !== undefined && !(Array.isArray(p.images) && p.images.length <= 8 && p.images.every(image => typeof image === 'string' && image.length <= 300 && /^\/api\/uploads\/[a-zA-Z0-9._-]+$/.test(image)))) return `${label}: use up to 8 uploaded images.`
  }
  return null
}

export function validateContent(value: unknown): value is PortfolioContent {
  if (!value || typeof value !== 'object') return false
  const c = value as PortfolioContent
  return text(c.name, 80) && text(c.title, 100) && text(c.location, 100) && text(c.availability, 100) &&
    text(c.email, 200) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email) && text(c.phone, 50) && validUrlOrEmpty(c.linkedin) && validUrlOrEmpty(c.github) &&
    text(c.heroDescription, 300) && textList(c.heroMessages, 4, 100) && c.heroMessages.length === 4 && textList(c.portraitRoles, 4, 100) && c.portraitRoles.length === 4 &&
    Array.isArray(c.metrics) && c.metrics.length === 4 && c.metrics.every(metric => metric && text(metric.value, 20) && text(metric.label, 60)) &&
    Array.isArray(c.experience) && c.experience.length <= 12 && c.experience.every(e => e && text(e.role, 100) && text(e.company, 120) && text(e.period, 80) && textList(e.points, 12, 400) && (e.companyWebsite === undefined || validUrlOrEmpty(e.companyWebsite)) && (e.companyEmail === undefined || e.companyEmail === '' || (text(e.companyEmail, 200) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.companyEmail))) && (e.companyPhone === undefined || e.companyPhone === '' || text(e.companyPhone, 50))) &&
    Array.isArray(c.education) && c.education.length <= 8 && c.education.every(e => e && text(e.degree, 140) && text(e.school, 140) && text(e.period, 80)) &&
    Array.isArray(c.skills) && c.skills.length <= 16 && c.skills.every(s => s && text(s.group, 80) && textList(s.items, 30, 70)) &&
    Array.isArray(c.projects) && c.projects.length <= 16 && c.projects.every(p => p && text(p.name, 120) && text(p.type, 120) && text(p.description, 500) && textList(p.details, 12, 400) && textList(p.stack, 20, 70) && (p.link === undefined || validUrlOrEmpty(p.link)) && (p.images === undefined || (Array.isArray(p.images) && p.images.length <= 8 && p.images.every(image => typeof image === 'string' && image.length <= 300 && /^\/api\/uploads\/[a-zA-Z0-9._-]+$/.test(image))))) &&
    textList(c.languages, 12, 100)
}
