# Firebase admin scripts

These scripts run on a trusted machine only. Never expose a Firebase service-account key in the browser or commit it to Git.

Grant admin access:

```bash
node scripts/set-admin-role.mjs FIREBASE_AUTH_UID
```

Revoke admin access:

```bash
node scripts/set-admin-role.mjs FIREBASE_AUTH_UID --revoke
```

Set `GOOGLE_APPLICATION_CREDENTIALS` to the downloaded Firebase service-account JSON path, or provide the JSON through `FIREBASE_SERVICE_ACCOUNT_JSON`.
