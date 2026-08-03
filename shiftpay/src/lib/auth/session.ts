import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "shiftpay_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

async function signingKey(passcode: string): Promise<Uint8Array> {
  const material = new TextEncoder().encode(`shiftpay-session-v1:${passcode}`);
  return new Uint8Array(await crypto.subtle.digest("SHA-256", material));
}

export async function createSessionToken(passcode: string): Promise<string> {
  return new SignJWT({ authorized: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(await signingKey(passcode));
}

export async function verifySessionToken(token: string | undefined, passcode = process.env.APP_PASSCODE): Promise<boolean> {
  if (!token || !passcode) return false;
  try {
    const result = await jwtVerify(token, await signingKey(passcode), { algorithms: ["HS256"] });
    return result.payload.authorized === true;
  } catch {
    return false;
  }
}
