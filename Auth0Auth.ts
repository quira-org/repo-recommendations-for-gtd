// see https://auth0.com/docs/authorization/flows/call-your-api-using-the-device-authorization-flow#request-tokens
// for a step-by-step guide on the auth flow
/**
 * If first time run or Quine API token (QAt) expired:
 * 1. Get a QAt via Auth0 calls
 * 2. Store the QAt in GitHub Secrets
 * ELSE
 * 3. Fetch the QAt from GH Secrets
 * ENDIF
 * 4. Use QAt to call the Quine API
 */
import { config } from './config';
import { pollUntil } from "./utils";
import { getInput } from "@actions/core";
const fetch = require('node-fetch');

interface IAuth0ReqDeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number; // polling interval to be used when veryfying if the user is logged in
  verification_uri_complete: string;
}
interface IReqDeviceCodeResponse {
  deviceCode: string;
  userCode: string;
  verificationURI: string;
  expiresIn: number;
  interval: number;
  verificationUriComplete: string;
}

export type TAccessToken = string;
export type TRefreshToken = string;

interface IAuth0RequestTokensResponse {
  access_token: TAccessToken;
  refresh_token?: TRefreshToken;
  expires_in?: number;
}

interface IAuth0TokensResponse {
  accessToken: TAccessToken;
  refreshToken: TRefreshToken;
  expiresIn: string;
}

export interface IAuth0UserInfo {
  email: string;
  email_verified: boolean;
  name: string;
  nickname: string;
  picture: string;
  sub: string;
  updated_at: string;
}

export class Auth0Auth {
  public deviceCode?: string;
  public quineRefreshToken?: string;
  public quineAccessToken?: string;
  public initiated: boolean;
  constructor() {
    //quine_access_token
    this.initiated = false;
    this.quineAccessToken = getInput('quine-access-token');
    this.quineRefreshToken = getInput('quine-refresh-token');
  }

  public async getUserInfo(bearerToken: string): Promise<IAuth0UserInfo> {
    const response = await fetch(config.userInfoEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearerToken}`,
      }
    });
    // const r = await response.json();
    // console.log("ALOOO");
    // console.log(r);
    // console.log("ALOOO");
    return response.json() as IAuth0UserInfo;
  }

  public async requestDeviceCode(): Promise<IReqDeviceCodeResponse> {
    const params = new URLSearchParams();
    params.append('client_id', config.auth0ClientId);
    params.append('audience', config.audience);
    params.append('scope', 'profile email openid offline_access');
    const response = await fetch(config.deviceActivationURI, { method: 'POST', body: params });
    const data = await response.json() as IAuth0ReqDeviceCodeResponse;
    return {
      deviceCode: data.device_code,
      userCode: data.user_code,
      verificationURI: data.verification_uri,
      expiresIn: data.expires_in,
      interval: data.interval,
      verificationUriComplete: data.verification_uri_complete,
    };
  }

   public async requestDeviceActivation(verificationURI: string, userCode: string, prePopulatedCodeURI: string) {
     console.log("Visit the following link to log in our sign up for a Quine account:");
     console.log(prePopulatedCodeURI);
     console.log(`Or go to ${verificationURI} and type in the following code: ${userCode}`);
  }

  public async requestTokens(deviceCode: string, activationLink: string): Promise<IAuth0TokensResponse | null> {
    console.debug("Checking if authorisation flow is complete...");
    const params = new URLSearchParams();
    params.append('grant_type', 'urn:ietf:params:oauth:grant-type:device_code');
    params.append('device_code', deviceCode);
    params.append('client_id', config.auth0ClientId);

    const response = await fetch(config.tokenURI, { method: 'POST', body: params });
    const res = await response.json();
    if (res.access_token) {
      console.debug("Authorisation flow complete!");
      return {
        refreshToken: res.refresh_token,
        accessToken: res.access_token,
        expiresIn: res.expires_in,
      }
    }
    console.log(`Authorisation flow not completed. Go to ${activationLink}.`);
    return null;
  }

  public async exchangeRefreshTokenForAccessToken(refreshToken: string): Promise<IAuth0TokensResponse> {
    return {
      refreshToken: 'test',// res.refresh_token,
      accessToken: 'test',// res.access_token,
      expiresIn: '10', // res.expires_in,
    };
  }

  public async pollForTokens(deviceCode: string, activationLink: string, expiresIn: number, tokenPollingIntervalSeconds: number): Promise<IAuth0TokensResponse> {
    if (tokenPollingIntervalSeconds) {
      const res = await pollUntil<IAuth0TokensResponse | null>(
        expiresIn * 1000,
        tokenPollingIntervalSeconds * 1000,
        () => this.requestTokens(deviceCode, activationLink),
        (res) => res !== null
      );
      if (res !== null) {
        return res;
      }
      throw new Error('An error occurred when asking for auth token. Token received is null. Did you authenticate this using code displayed earlier?');
    }
    throw new Error('An error occurred when asking for auth token. No polling interval set. Did you authenticate this using code displayed earlier?');
  }
}

