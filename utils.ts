const sodium = require('tweetsodium');

interface IAuth0DecodedJWT {
  iss: string; // domain
  sub: string; // format: `${connectionName}|${someId}`. Example: "github|134743" or "auth0|619613468d4f400069a6fcd6"
  aud: string[]; // Array of accessible audiences. Example: ["https://dev-6efvmm67.eu.auth0.com/api/v2/","https://dev-6efvmm67.eu.auth0.com/userinfo"]
  iat: string; // createdAt timestamp
  exp: number; // expirestAt timestamp
  scope: string; // eg: "openid profile email. Corresponds to the scope requested when calling the generate device code auth route in Auth0
}

export function decodeJWT(jwt: string): IAuth0DecodedJWT {
  const tokenDecodablePart = jwt.split('.')[1];
  if (typeof tokenDecodablePart === 'undefined') {
    throw new Error('Error while decoding JWT. Invalid format. Possible OAuth authentication issue.');
  }
  const decoded = Buffer.from(tokenDecodablePart, 'base64').toString();
  const parsedJWT = JSON.parse(decoded);
  return {
    iss: parsedJWT.iss,
    sub: parsedJWT.sub,
    aud: parsedJWT.aud,
    iat: parsedJWT.iat,
    exp: Number(parsedJWT.exp),
    scope: parsedJWT.scope
  }
}

export async function pollUntil<T>(
  expiresInMillis: number,
  intervalMillis: number,
  method: () => Promise<T>,
  checkShouldStopPolling: (p: T) => boolean
) {
  const startTime = Date.now();
  let time1 = Date.now();
  let time2 = time1 + intervalMillis;
  let res = await method();
  let codeExpired = startTime + expiresInMillis < Date.now();
  while (!codeExpired && !checkShouldStopPolling(res)) {
    if (time2 - time1 > intervalMillis + 500) {
      res = await method();
      time1 = time2;
    }
    time2 = Date.now();
    codeExpired = startTime + expiresInMillis < time2;
  }
  return res;
}

const crypto = require('crypto');
const { Octokit } = require("@octokit/core");

export function encryptGHSecret (publicKey: string, value: string){
  const messageBytes = Buffer.from(value);
  const keyBytes = Buffer.from(publicKey, 'base64');

// Encrypt using LibSodium.
  const encryptedBytes = sodium.seal(messageBytes, keyBytes);

  // Base64 the encrypted secret
  return Buffer.from(encryptedBytes).toString('base64');
}