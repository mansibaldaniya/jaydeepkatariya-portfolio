import cors from 'cors'
import express, { type NextFunction, type Request, type Response } from 'express'
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defaultContent, validateContent } from './content.js'

const app = express()
const port = Number(process.env.PORT ?? 3000)
const dataDir = resolve(process.cwd(), 'data')
const contentPath = resolve(dataDir, 'content.json')
const adminPath = resolve(dataDir, 'admin.json')
const uploadDir = resolve(process.cwd(), 'uploads')
mkdirSync(dataDir, { recursive: true })
mkdirSync(uploadDir, { recursive: true })

type Admin = { username: string; salt: string; passwordHash: string }
const sessions = new Map<string, number>()
const loginAttempts = new Map<string, { count: number; resetAt: number }>()
const sessionCookie = 'jaydeep_admin_session'
const sessionDuration = 8 * 60 * 60 * 1000
const isProduction = process.env.NODE_ENV === 'production'

function readJson<T>(path: string, fallback: T): T {
  try { return JSON.parse(readFileSync(path, 'utf8')) as T } catch { return fallback }
}
function saveJson(path: string, value: unknown) {
  const temporary = `${path}.tmp`
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  renameSync(temporary, path)
}
if (!existsSync(contentPath)) saveJson(contentPath, defaultContent)
const savedContent = readJson<Partial<typeof defaultContent> & { summary?: unknown }>(contentPath, defaultContent)
const { summary: legacySummary, ...savedContentWithoutSummary } = savedContent
let content = { ...defaultContent, ...savedContentWithoutSummary, metrics: savedContent.metrics ?? defaultContent.metrics }
if (!validateContent(content)) { content = defaultContent; saveJson(contentPath, content) }
else if (legacySummary !== undefined || savedContent.metrics === undefined) saveJson(contentPath, content)
let admin: Admin | null = readJson<Admin | null>(adminPath, null)
if (!admin && process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
  const salt = randomBytes(16).toString('hex')
  admin = { username: process.env.ADMIN_USERNAME, salt, passwordHash: scryptSync(process.env.ADMIN_PASSWORD, salt, 64).toString('hex') }
  saveJson(adminPath, admin)
}

app.disable('x-powered-by')
app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '7mb' }))
app.use('/api/uploads', express.static(uploadDir, { maxAge: isProduction ? '1h' : 0 }))
app.use((_request, response, next) => {
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.setHeader('Cache-Control', 'no-store')
  next()
})

function getCookie(request: Request, name: string) {
  return (request.headers.cookie ?? '').split(';').map(part => part.trim()).find(part => part.startsWith(`${name}=`))?.slice(name.length + 1)
}
function requireAdmin(request: Request, response: Response, next: NextFunction) {
  const token = getCookie(request, sessionCookie)
  const expiry = token ? sessions.get(token) : undefined
  if (!token || !expiry || expiry < Date.now()) {
    if (token) sessions.delete(token)
    response.status(401).json({ error: 'Please sign in to continue.' })
    return
  }
  sessions.set(token, Date.now() + sessionDuration)
  next()
}
function setSession(response: Response) {
  const token = randomBytes(32).toString('hex')
  sessions.set(token, Date.now() + sessionDuration)
  response.cookie(sessionCookie, token, { httpOnly: true, secure: isProduction, sameSite: 'lax', path: '/', maxAge: sessionDuration })
}
function hashPassword(password: string, salt: string) { return scryptSync(password, salt, 64).toString('hex') }
function constantTimeMatch(a: string, b: string) {
  const left = Buffer.from(a, 'hex')
  const right = Buffer.from(b, 'hex')
  return left.length === right.length && timingSafeEqual(left, right)
}

app.post('/api/admin/uploads', requireAdmin, (request, response) => {
  const dataUrl = request.body?.dataUrl
  const match = typeof dataUrl === 'string' ? /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl) : null
  if (!match) return response.status(400).json({ error: 'Choose a JPG, PNG, or WEBP image.' })
  const mime = match[1]
  const bytes = Buffer.from(match[2], 'base64')
  if (!bytes.length || bytes.length > 5 * 1024 * 1024) return response.status(400).json({ error: 'Each image must be no larger than 5 MB.' })
  const valid = mime === 'jpeg' ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff : mime === 'png' ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) : bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP'
  if (!valid) return response.status(400).json({ error: 'The selected file is not a valid image.' })
  const extension = mime === 'jpeg' ? 'jpeg' : mime
  const filename = `${randomUUID()}.${extension}`
  writeFileSync(resolve(uploadDir, filename), bytes, { flag: 'wx' })
  return response.status(201).json({ url: `/api/uploads/${filename}` })
})
app.get('/api/health', (_request, response) => response.json({ status: 'ok', message: 'Portfolio API is running' }))
app.get('/api/content', (_request, response) => response.json(content))
app.get('/api/admin/status', (_request, response) => response.json({ configured: Boolean(admin) }))
app.post('/api/admin/setup', (request, response) => {
  if (admin) return response.status(409).json({ error: 'An admin account already exists.' })
  const { username, password } = request.body ?? {}
  const validUsername = typeof username === 'string' && ( /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username) || /^[a-zA-Z0-9_.-]{3,32}$/.test(username) )
  if (!validUsername || typeof password !== 'string' || password.length < 12 || password.length > 200) {
    return response.status(400).json({ error: 'Enter a valid email or username and a password with at least 12 characters.' })
  }
  const salt = randomBytes(16).toString('hex')
  admin = { username, salt, passwordHash: hashPassword(password, salt) }
  saveJson(adminPath, admin)
  setSession(response)
  return response.status(201).json({ username })
})
app.post('/api/admin/login', (request, response) => {
  const address = request.ip ?? 'unknown'
  const attempt = loginAttempts.get(address)
  if (attempt && attempt.resetAt > Date.now() && attempt.count >= 8) return response.status(429).json({ error: 'Too many sign-in attempts. Please wait 10 minutes and try again.' })
  const { username, password } = request.body ?? {}
  const candidate = admin && typeof password === 'string' ? hashPassword(password, admin.salt) : ''
  const valid = Boolean(admin && typeof username === 'string' && username === admin.username && constantTimeMatch(candidate, admin.passwordHash))
  if (!valid) {
    const current = attempt && attempt.resetAt > Date.now() ? attempt : { count: 0, resetAt: Date.now() + 10 * 60 * 1000 }
    loginAttempts.set(address, { ...current, count: current.count + 1 })
    return response.status(401).json({ error: 'Username or password is incorrect.' })
  }
  loginAttempts.delete(address)
  setSession(response)
  return response.json({ username: username as string })
})
app.get('/api/admin/me', requireAdmin, (_request, response) => response.json({ username: admin?.username }))
app.post('/api/admin/logout', requireAdmin, (request, response) => {
  const token = getCookie(request, sessionCookie)
  if (token) sessions.delete(token)
  response.clearCookie(sessionCookie, { httpOnly: true, secure: isProduction, sameSite: 'lax', path: '/' })
  response.status(204).end()
})
app.put('/api/admin/content', requireAdmin, (request, response) => {
  if (!validateContent(request.body)) return response.status(400).json({ error: 'Some fields are missing or exceed their allowed length. Please review the form and try again.' })
  content = request.body
  saveJson(contentPath, content)
  response.json({ saved: true })
})

app.listen(port, () => console.log(`Portfolio API ready at http://localhost:${port}`))
