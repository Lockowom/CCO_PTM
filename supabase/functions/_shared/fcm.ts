import { SignJWT, importPKCS8 } from 'https://deno.land/x/jose@v5.2.2/index.ts';

export type FirebaseServiceAccount = {
  client_email: string;
  private_key: string;
  project_id: string;
};

export function firebaseServiceAccount(): FirebaseServiceAccount {
  const raw = Deno.env.get('FCM_SERVICE_ACCOUNT');
  if (!raw) throw new Error('Missing FCM_SERVICE_ACCOUNT secret');
  const account = JSON.parse(raw) as FirebaseServiceAccount;
  if (!account.client_email || !account.private_key || !account.project_id) {
    throw new Error('FCM_SERVICE_ACCOUNT is incomplete');
  }
  return account;
}

async function accessToken(account: FirebaseServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const privateKey = await importPKCS8(account.private_key, 'RS256');
  const assertion = await new SignJWT({
    iss: account.client_email,
    sub: account.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    iat: now,
    exp: now + 3600
  })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .sign(privateKey);
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });
  if (!response.ok) throw new Error(`Firebase OAuth failed (${response.status})`);
  const data = await response.json();
  if (!data.access_token) throw new Error('Firebase OAuth returned no access token');
  return data.access_token as string;
}

export async function sendFcm(token: string, message: Record<string, unknown>) {
  const account = firebaseServiceAccount();
  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${account.project_id}/messages:send`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${await accessToken(account)}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({ message: { ...message, token } })
    }
  );
  if (!response.ok)
    throw new Error(`FCM failed (${response.status}): ${(await response.text()).slice(0, 300)}`);
}
