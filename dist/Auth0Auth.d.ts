interface IReqDeviceCodeResponse {
    deviceCode: string;
    userCode: string;
    verificationURI: string;
    expiresIn: number;
    interval: number;
    verificationUriComplete: string;
}
export declare type TAccessToken = string;
export declare type TRefreshToken = string;
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
export declare class Auth0Auth {
    deviceCode?: string;
    quineRefreshToken?: string;
    quineAccessToken?: string;
    initiated: boolean;
    constructor();
    getUserInfo(bearerToken: string): Promise<IAuth0UserInfo>;
    requestDeviceCode(): Promise<IReqDeviceCodeResponse>;
    requestDeviceActivation(verificationURI: string, userCode: string, prePopulatedCodeURI: string): Promise<void>;
    requestTokens(deviceCode: string, activationLink: string): Promise<IAuth0TokensResponse | null>;
    exchangeRefreshTokenForAccessToken(refreshToken: string): Promise<IAuth0TokensResponse>;
    pollForTokens(deviceCode: string, activationLink: string, expiresIn: number, tokenPollingIntervalSeconds: number): Promise<IAuth0TokensResponse>;
}
export {};
