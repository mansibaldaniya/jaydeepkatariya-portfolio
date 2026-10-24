import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import nodemailer from 'nodemailer';
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultContent, projectValidationMessage, validateContent } from './content.js';
const app = express();
const port = Number(process.env.PORT ?? 3000);
const dataDir = resolve(process.cwd(), 'data');
const contentPath = resolve(dataDir, 'content.json');
const adminPath = resolve(dataDir, 'admin.json');
const uploadDir = resolve(process.cwd(), 'uploads');
const portfolioLogoPath = fileURLToPath(new URL('../../client/public/jaydeep-logo.svg', import.meta.url));
dotenv.config({ path: resolve(process.cwd(), 'server/.env') });
dotenv.config();
mkdirSync(dataDir, { recursive: true });
mkdirSync(uploadDir, { recursive: true });
const sessions = new Map();
const loginAttempts = new Map();
const sessionCookie = 'jaydeep_admin_session';
const sessionDuration = 8 * 60 * 60 * 1000;
const isProduction = process.env.NODE_ENV === 'production';
function readJson(path, fallback) {
    try {
        return JSON.parse(readFileSync(path, 'utf8'));
    }
    catch {
        return fallback;
    }
}
function saveJson(path, value) {
    const temporary = `${path}.tmp`;
    writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
    renameSync(temporary, path);
}
if (!existsSync(contentPath))
    saveJson(contentPath, defaultContent);
const savedContent = readJson(contentPath, defaultContent);
const { summary: legacySummary, ...savedContentWithoutSummary } = savedContent;
const filteredPortraitRoles = savedContent.portraitRoles?.filter(role => role !== 'Full Stack Developer' && role !== 'Software Developer');
let content = {
    ...defaultContent,
    ...savedContentWithoutSummary,
    heroDescription: savedContent.heroDescription ?? defaultContent.heroDescription,
    heroMessages: savedContent.heroMessages ?? defaultContent.heroMessages,
    portraitRoles: filteredPortraitRoles?.length === 4 ? filteredPortraitRoles : defaultContent.portraitRoles,
    metrics: savedContent.metrics ?? defaultContent.metrics,
};
if (!validateContent(content)) {
    content = defaultContent;
    saveJson(contentPath, content);
}
else if (legacySummary !== undefined || savedContent.metrics === undefined || savedContent.heroDescription === undefined || savedContent.heroMessages === undefined || savedContent.portraitRoles?.length !== 4 || filteredPortraitRoles?.length !== 4)
    saveJson(contentPath, content);
let admin = readJson(adminPath, null);
if (!admin && process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
    const salt = randomBytes(16).toString('hex');
    admin = { username: process.env.ADMIN_USERNAME, salt, passwordHash: scryptSync(process.env.ADMIN_PASSWORD, salt, 64).toString('hex') };
    saveJson(adminPath, admin);
}
app.disable('x-powered-by');
app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '7mb' }));
app.use('/api/uploads', express.static(uploadDir, { maxAge: isProduction ? '1h' : 0 }));
app.use((_request, response, next) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader('Cache-Control', 'no-store');
    next();
});
function getCookie(request, name) {
    return (request.headers.cookie ?? '').split(';').map(part => part.trim()).find(part => part.startsWith(`${name}=`))?.slice(name.length + 1);
}
function requireAdmin(request, response, next) {
    const token = getCookie(request, sessionCookie);
    const expiry = token ? sessions.get(token) : undefined;
    if (!token || !expiry || expiry < Date.now()) {
        if (token)
            sessions.delete(token);
        response.status(401).json({ error: 'Please sign in to continue.' });
        return;
    }
    sessions.set(token, Date.now() + sessionDuration);
    next();
}
function setSession(response) {
    const token = randomBytes(32).toString('hex');
    sessions.set(token, Date.now() + sessionDuration);
    response.cookie(sessionCookie, token, { httpOnly: true, secure: isProduction, sameSite: 'lax', path: '/', maxAge: sessionDuration });
}
function hashPassword(password, salt) { return scryptSync(password, salt, 64).toString('hex'); }
function constantTimeMatch(a, b) {
    const left = Buffer.from(a, 'hex');
    const right = Buffer.from(b, 'hex');
    return left.length === right.length && timingSafeEqual(left, right);
}
function escapeHtml(value) {
    return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}
app.post('/api/admin/uploads', requireAdmin, (request, response) => {
    const dataUrl = request.body?.dataUrl;
    const match = typeof dataUrl === 'string' ? /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl) : null;
    if (!match)
        return response.status(400).json({ error: 'Choose a JPG, PNG, or WEBP image.' });
    const mime = match[1];
    const bytes = Buffer.from(match[2], 'base64');
    if (!bytes.length || bytes.length > 5 * 1024 * 1024)
        return response.status(400).json({ error: 'Each image must be no larger than 5 MB.' });
    const valid = mime === 'jpeg' ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff : mime === 'png' ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) : bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP';
    if (!valid)
        return response.status(400).json({ error: 'The selected file is not a valid image.' });
    const extension = mime === 'jpeg' ? 'jpeg' : mime;
    const filename = `${randomUUID()}.${extension}`;
    writeFileSync(resolve(uploadDir, filename), bytes, { flag: 'wx' });
    return response.status(201).json({ url: `/api/uploads/${filename}` });
});
app.get('/api/health', (_request, response) => response.json({ status: 'ok', message: 'Portfolio API is running' }));
app.get('/api/content', (_request, response) => response.json(content));
const contactAttempts = new Map();
app.post('/api/contact', async (request, response) => {
    const address = request.ip ?? 'unknown';
    const now = Date.now();
    const attempt = contactAttempts.get(address);
    if (attempt && attempt.resetAt > now && attempt.count >= 5) {
        return response.status(429).json({ error: 'Too many messages. Please try again in an hour.' });
    }
    const { name, email, message } = request.body ?? {};
    if (typeof name !== 'string' || !name.trim() || name.length > 100 ||
        typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        typeof message !== 'string' || !message.trim() || message.length > 5000) {
        return response.status(400).json({ error: 'Enter a valid name, email address, and message (up to 5,000 characters).' });
    }
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !CONTACT_TO) {
        return response.status(503).json({ error: 'The contact form is temporarily unavailable. Please email me directly.' });
    }
    const current = attempt && attempt.resetAt > now ? attempt : { count: 0, resetAt: now + 60 * 60 * 1000 };
    contactAttempts.set(address, { ...current, count: current.count + 1 });
    try {
        const port = Number(SMTP_PORT ?? 465);
        if (![465, 587].includes(port))
            return response.status(500).json({ error: 'Email service is not configured correctly.' });
        const transporter = nodemailer.createTransport({ host: SMTP_HOST, port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } });
        const safeName = escapeHtml(name.trim());
        const safeEmail = escapeHtml(email.trim());
        const safeMessage = escapeHtml(message.trim());
        await transporter.sendMail({
            from: `Portfolio contact <${SMTP_USER}>`,
            to: CONTACT_TO,
            replyTo: { name: name.trim(), address: email.trim() },
            subject: `Portfolio enquiry from ${name.trim()}`,
            text: `Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`,
            attachments: [{ filename: 'jaydeep-logo.svg', path: portfolioLogoPath, cid: 'jaydeep-portfolio-logo' }],
            html: `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:32px 12px;background:#eef1ec;font-family:Arial,Helvetica,sans-serif;color:#202820;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #dce3da;border-radius:16px;overflow:hidden;">
    <tr><td style="height:5px;background:#829477;font-size:0;line-height:0;">&nbsp;</td></tr>
    <tr><td style="padding:30px 36px 24px;background:#121914;">
      <table role="presentation" cellspacing="0" cellpadding="0"><tr>
        <td style="padding-right:14px;vertical-align:middle;"><img src="cid:jaydeep-portfolio-logo" width="48" height="48" alt="Jaydeep Katariya" style="display:block;width:48px;height:48px;object-fit:contain;"></td>
        <td style="vertical-align:middle;"><div style="color:#eef1e9;font-size:17px;font-weight:700;letter-spacing:.2px;">Jaydeep Katariya</div><div style="margin-top:5px;color:#a9b8a3;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;">Portfolio contact</div></td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:34px 36px 12px;"><div style="color:#829477;font-size:11px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;">New message</div><h1 style="margin:10px 0 0;color:#202820;font-size:25px;line-height:1.3;font-weight:600;">You have a new enquiry</h1></td></tr>
    <tr><td style="padding:18px 36px 30px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
        <tr><td style="padding:13px 0;border-bottom:1px solid #e8ece6;color:#788174;font-size:11px;letter-spacing:1px;text-transform:uppercase;width:90px;">From</td><td style="padding:13px 0;border-bottom:1px solid #e8ece6;color:#202820;font-size:14px;font-weight:600;">${safeName}</td></tr>
        <tr><td style="padding:13px 0;border-bottom:1px solid #e8ece6;color:#788174;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Email</td><td style="padding:13px 0;border-bottom:1px solid #e8ece6;font-size:14px;"><a href="mailto:${safeEmail}" style="color:#637a59;text-decoration:none;">${safeEmail}</a></td></tr>
      </table>
      <div style="margin-top:24px;padding:20px 22px;background:#f5f7f3;border:1px solid #e5eae2;border-radius:10px;">
        <div style="margin-bottom:11px;color:#788174;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Message</div>
        <div style="color:#303830;font-size:15px;line-height:1.75;white-space:pre-wrap;overflow-wrap:anywhere;">${safeMessage}</div>
      </div>
      <p style="margin:24px 0 0;color:#788174;font-size:12px;line-height:1.6;">You can reply directly to this email to get back to ${safeName}.</p>
    </td></tr>
    <tr><td style="padding:18px 36px;background:#f7f8f6;border-top:1px solid #e8ece6;color:#8a9286;font-size:11px;line-height:1.5;">Sent from the contact form on Jaydeep Katariya’s portfolio.</td></tr>
  </table>
</body></html>`,
        });
        return response.json({ sent: true });
    }
    catch (error) {
        console.error('Contact email could not be sent:', error instanceof Error ? error.message : 'Unknown SMTP error');
        return response.status(502).json({ error: 'Your message could not be sent right now. Please try again or email me directly.' });
    }
});
app.get('/api/admin/status', (_request, response) => response.json({ configured: Boolean(admin) }));
app.post('/api/admin/setup', (request, response) => {
    if (admin)
        return response.status(409).json({ error: 'An admin account already exists.' });
    const { username, password } = request.body ?? {};
    const validUsername = typeof username === 'string' && (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username) || /^[a-zA-Z0-9_.-]{3,32}$/.test(username));
    if (!validUsername || typeof password !== 'string' || password.length < 12 || password.length > 200) {
        return response.status(400).json({ error: 'Enter a valid email or username and a password with at least 12 characters.' });
    }
    const salt = randomBytes(16).toString('hex');
    admin = { username, salt, passwordHash: hashPassword(password, salt) };
    saveJson(adminPath, admin);
    setSession(response);
    return response.status(201).json({ username });
});
app.post('/api/admin/login', (request, response) => {
    const address = request.ip ?? 'unknown';
    const attempt = loginAttempts.get(address);
    if (attempt && attempt.resetAt > Date.now() && attempt.count >= 8)
        return response.status(429).json({ error: 'Too many sign-in attempts. Please wait 10 minutes and try again.' });
    const { username, password } = request.body ?? {};
    const candidate = admin && typeof password === 'string' ? hashPassword(password, admin.salt) : '';
    const valid = Boolean(admin && typeof username === 'string' && username === admin.username && constantTimeMatch(candidate, admin.passwordHash));
    if (!valid) {
        const current = attempt && attempt.resetAt > Date.now() ? attempt : { count: 0, resetAt: Date.now() + 10 * 60 * 1000 };
        loginAttempts.set(address, { ...current, count: current.count + 1 });
        return response.status(401).json({ error: 'Username or password is incorrect.' });
    }
    loginAttempts.delete(address);
    setSession(response);
    return response.json({ username: username });
});
app.get('/api/admin/me', requireAdmin, (_request, response) => response.json({ username: admin?.username }));
app.post('/api/admin/logout', requireAdmin, (request, response) => {
    const token = getCookie(request, sessionCookie);
    if (token)
        sessions.delete(token);
    response.clearCookie(sessionCookie, { httpOnly: true, secure: isProduction, sameSite: 'lax', path: '/' });
    response.status(204).end();
});
app.put('/api/admin/content', requireAdmin, (request, response) => {
    if (!validateContent(request.body)) {
        const projectError = projectValidationMessage(request.body?.projects);
        return response.status(400).json({ error: projectError ?? 'Some fields are missing or exceed their allowed length. Please review the form and try again.' });
    }
    content = request.body;
    saveJson(contentPath, content);
    response.json({ saved: true });
});
app.listen(port, () => console.log(`Portfolio API ready at http://localhost:${port}`));
