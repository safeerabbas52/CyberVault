// Paste into a Google Sheet's Apps Script. Add a time trigger (every 10 min) for run().
// Enable the Firestore scope in appsscript.json and link the script to your GCP project.
const PROJECT = 'YOUR_FIREBASE_PROJECT_ID', ADMIN_EMAIL = 'you@example.com';
const BASE = 'https://firestore.googleapis.com/v1/projects/' + PROJECT + '/databases/(default)/documents';
function api(path, method, body) {
  return JSON.parse(UrlFetchApp.fetch(BASE + path, {method: method || 'get', contentType: 'application/json',
    headers: {Authorization: 'Bearer ' + ScriptApp.getOAuthToken()}, payload: body ? JSON.stringify(body) : undefined,
    muteHttpExceptions: true}).getContentText());
}
const v = f => f ? (f.stringValue !== undefined ? f.stringValue : f.integerValue !== undefined ? f.integerValue : f.doubleValue !== undefined ? f.doubleValue : '') : '';
function run() { processMail(); syncSheet('tasks', ['title','memberId','domain','priority','status','deadline','weight','reportedProgress','verifiedProgress']);
  syncSheet('members', ['name','email','domain']); syncSheet('submissions', ['date','memberId','taskId','work','progress','evidence','problems','next']);
  syncSheet('publicStats', ['name','domain','percent','done','total']); }
function processMail() {
  (api('/mailQueue').documents || []).forEach(d => { const f = d.fields; if (v(f.status) !== 'pending') return;
    const kind = v(f.kind), to = kind === 'review' ? ADMIN_EMAIL : v(f.to);   // only admin or a task owner's email
    MailApp.sendEmail(to, 'CyberVault: task ' + kind, v(f.taskTitle) + (v(f.reason) ? '\nReason: ' + v(f.reason) : ''));
    api('/mailQueue/' + d.name.split('/').pop() + '?updateMask.fieldPaths=status', 'patch', {fields: {status: {stringValue: 'sent'}}}); });
}
function syncSheet(col, keys) {
  const ss = SpreadsheetApp.getActive(), s = ss.getSheetByName(col) || ss.insertSheet(col);
  const rows = [['id'].concat(keys)];
  (api('/' + col + '?pageSize=300').documents || []).forEach(d => rows.push([d.name.split('/').pop()].concat(keys.map(k => v(d.fields[k])))));
  s.clear(); s.getRange(1, 1, rows.length, keys.length + 1).setValues(rows);
}
