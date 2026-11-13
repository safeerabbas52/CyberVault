# CyberVault (Spark/free plan, no Cloud Functions)
1. Firebase console: create project, enable **Authentication → Email/Password**, create **Firestore**.
2. Create your admin user (Auth → Add user) with the email you will use as admin.
3. `cp .env.example .env`, fill values from Project settings → Web app. Set `VITE_ADMIN_EMAIL`.
4. In `firestore.rules` replace `you@example.com` with the same admin email. Publish rules: `firebase deploy --only firestore:rules`.
5. `npm install && npm run dev`. Sign in as admin → Members (add 7) → Tasks → assign.
6. Deploy: `npm run build && firebase deploy --only hosting`.
7. Sheets/email: open a Google Sheet → Extensions → Apps Script, paste `apps-script/Code.gs`, set PROJECT and ADMIN_EMAIL,
   link it to the Firebase GCP project, add scopes (`datastore`, `script.send_mail`, `spreadsheets`, `script.external_request`)
   in appsscript.json, and add a 10-minute trigger for `run`.
Notes: stats shown to members (`publicStats`) refresh whenever admin changes data or presses "Refresh stats".
Known limit: on the free plan any signed-in user can queue an email request; the script only sends to the admin or the task owner address.
