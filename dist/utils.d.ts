interface IAuth0DecodedJWT {
    iss: string;
    sub: string;
    aud: string[];
    iat: string;
    exp: number;
    scope: string;
}
export declare function decodeJWT(jwt: string): IAuth0DecodedJWT;
export declare function pollUntil<T>(expiresInMillis: number, intervalMillis: number, method: () => Promise<T>, checkShouldStopPolling: (p: T) => boolean): Promise<T>;
export declare function encryptGHSecret(publicKey: string, value: string): string;
export {};
