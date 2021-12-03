import { Auth0Auth } from "./Auth0Auth";
import { GitHubInteraction } from "./GitHubInteraction";
export declare class Authentication {
    auth0Auth: Auth0Auth;
    gitHubInteraction: GitHubInteraction;
    constructor();
    getQuineAccessToken(): Promise<string>;
    private handleExpiredTokenFlow;
    private handleDeviceActivationFlow;
}
