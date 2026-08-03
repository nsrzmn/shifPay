# ShiftPay

ShiftPay is a mobile-first daily earnings tracker for delivery gig workers. Each self-hosted deployment uses its owner's Google Sheet as the database and is protected by a shared passcode.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnsrzmn%2FshifPay&env=GOOGLE_SHEET_URL,GOOGLE_SERVICE_ACCOUNT_JSON,APP_PASSCODE&project-name=shiftpay&repository-name=shiftpay)

## What you need

- Node.js 20 or newer
- A Google account and Google Sheet
- A Google Cloud project with the Google Sheets API enabled
- A Google service account JSON key
- A random app passcode of at least 16 characters

Every clone uses its own credentials, Sheet, and passcode. Never commit `.env.local` or a service-account key.

## 1. Create the Google Sheet

1. Create a blank spreadsheet in Google Sheets. Its name can be anything.
2. Copy its full URL, such as `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`.
3. Do not create an `Entries` tab manually. ShiftPay creates and formats it after connection.

ShiftPay only creates or formats the worksheet named `Entries`; it leaves every other worksheet untouched.

## 2. Create the service account

1. Open [Google Cloud Console](https://console.cloud.google.com/) and create or select a project.
2. Open **APIs & Services → Library**, search for **Google Sheets API**, and enable it.
3. Open **IAM & Admin → Service Accounts** and create a service account.
4. Open the service account, choose **Keys → Add key → Create new key → JSON**, and download the file.
5. Open the JSON file and copy the `client_email` value.
6. In Google Sheets, choose **Share**, paste that service-account email, and give it **Editor** access.

The service account does not need project-wide Owner or Editor permissions. Access comes from sharing the individual spreadsheet with its email.

## 3. Configure local development

Install dependencies and copy the safe example:

```bash
npm install
cp .env.example .env.local
```

Set these values in `.env.local`:

```dotenv
GOOGLE_SHEET_URL="https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit"
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n","client_email":"...@....iam.gserviceaccount.com"}'
APP_PASSCODE="a-long-random-passcode"
```

`GOOGLE_SERVICE_ACCOUNT_JSON` must be the entire downloaded JSON object on one line. A local `jq -c . downloaded-key.json` command can produce the minified value; do not paste its output into issues, logs, chat, or source control.

Verify Sheet access and initialize the schema:

```bash
npm run verify:setup
```

Then start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with `APP_PASSCODE`.

## Deploy to Vercel

1. Use the deploy button above or import this repository in Vercel.
2. If this repository contains the app in a nested folder, set **Root Directory** to `shiftpay`.
3. Add `GOOGLE_SHEET_URL`, `GOOGLE_SERVICE_ACCOUNT_JSON`, and `APP_PASSCODE` in **Project Settings → Environment Variables**.
4. Apply the variables to Production and any Preview environments that should use the Sheet.
5. Deploy. Environment changes require a new deployment.

For safety, use a different Sheet and passcode for preview deployments. All three values are server-only and must not be renamed with a `NEXT_PUBLIC_` prefix.

## Google Sheet schema

ShiftPay creates an `Entries` worksheet with these columns:

```text
id, date, hoursWorked, deliveryEarnings, tips, fines, otherExpenses, notes, netEarnings, hourlyRate, createdAt, updatedAt
```

Do not reorder or rename these columns and do not edit entry rows directly. ShiftPay validates the schema and stops rather than overwriting incompatible data.

## Commands

```bash
npm run dev          # local development
npm run verify:setup # verify credentials and initialize/validate the worksheet
npm run lint         # Next.js ESLint checks
npm run typecheck    # TypeScript checks
npm test             # unit tests
npm run test:e2e     # Playwright mobile browser flow
npm run build        # production build
```

Install Playwright's browser once before the end-to-end suite:

```bash
npx playwright install chromium
```

## Troubleshooting

### “Required ShiftPay environment variables are missing”

Confirm all three variables exist. For local development they belong in `.env.local` at the app root. In Vercel, redeploy after changing variables.

### “GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON”

Paste the complete credential as one valid JSON object. Keep the private key's newlines encoded as `\n`. Vercel accepts the minified JSON directly as the variable value.

### “Could not access the Google Sheet”

Confirm that:

- Google Sheets API is enabled in the credential's Cloud project.
- The URL opens the intended spreadsheet.
- The spreadsheet is shared as Editor with the credential's exact `client_email`.
- The service-account key is still active.

### “Entries worksheet headers do not match”

The existing `Entries` tab has an incompatible first row. Restore the documented headers exactly, or rename that tab so ShiftPay can safely create a new `Entries` worksheet. ShiftPay never overwrites an incompatible schema.

### Passcode changed but an old session stopped working

This is expected. Session signatures are derived from `APP_PASSCODE`, so changing it immediately invalidates all existing sessions.

## Security model

- Google credentials and the passcode stay on the server.
- Sheets API calls occur only in authenticated Next.js Route Handlers.
- The browser receives a signed HttpOnly session cookie, never the passcode or service-account key.
- Each deployment is designed for one person or a trusted household sharing one passcode and one Sheet.
- ShiftPay is online-only; Google Sheets is authoritative and entry data is not persisted in localStorage.
