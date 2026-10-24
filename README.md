# Jaydeep Katariya — Portfolio

A responsive animated portfolio for Jaydeep, built with React and TypeScript, with a Node.js and Express API.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173. The API runs at http://localhost:3000 and its health endpoint is http://localhost:3000/api/health.

## Contact form email

Copy `server/.env.example` to `server/.env` and set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `CONTACT_TO`. For Gmail, use `smtp.gmail.com`, port `465`, your Gmail address as `SMTP_USER` and `CONTACT_TO`, and a Google App Password as `SMTP_PASS` (not your regular Gmail password). Keep the app password private and configure the same variables in your production server environment. The contact form sends messages through the Express API; the visitor's email is set as the reply-to address.

## Admin

Open http://localhost:5173/admin. Sign in with the configured email and password; the first admin account can be created from this page. The server stores a salted password hash and an HTTP-only session cookie. The password field has a show/hide control. Sign in to edit content using the fixed form fields; saved text is rendered as text and validated by the API, so it cannot inject layout markup. Portfolio content is saved in `server/data/content.json`. The admin account is local to this server and is kept in the ignored `server/data/admin.json` file.

For a public deployment, set `NODE_ENV=production`, set `CLIENT_ORIGIN` to the exact website origin, and use HTTPS. The server marks the admin session cookie secure in production.

To create production builds, run `npm run build` from the project root.
