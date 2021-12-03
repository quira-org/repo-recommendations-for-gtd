import { Auth0Auth, TAccessToken } from "./Auth0Auth";
import { GitHubInteraction } from "./GitHubInteraction";
import { decodeJWT } from "./utils";

export class Authentication {
  public auth0Auth: Auth0Auth;
  public gitHubInteraction: GitHubInteraction;

  constructor() {
    this.auth0Auth = new Auth0Auth();
    this.gitHubInteraction = new GitHubInteraction();
  }

  public async getQuineAccessToken() {
    if (!this.gitHubInteraction.initiated) {
      this.gitHubInteraction = await this.gitHubInteraction.getInstance();
    }
    console.log('Check if Quine access token is available.');
    let storedAccessToken = this.auth0Auth.quineAccessToken || null;
    const storedRefreshToken = this.auth0Auth.quineRefreshToken || null;

    console.log('Finished getting access token secret or checking whether it\'s missing.');

    const now = Date.now();
    if (storedAccessToken && storedAccessToken.length > 1) {
      const decodedToken = decodeJWT(storedAccessToken);
      const expiredAccessToken = now - decodedToken.exp < 0;
      if (expiredAccessToken) {
        if (storedRefreshToken && storedRefreshToken.length > 1) {
          const refreshToken = await this.handleExpiredTokenFlow(storedRefreshToken);
          this.auth0Auth.quineRefreshToken = refreshToken;
          return refreshToken;
        } // missing refresh token. Shouldn't end up here unless the user manually deleted the refresh token stored in GitHub
        const accessToken = await this.handleDeviceActivationFlow();
        // instantiate the Auth0Auth class, if the token's missing from the env vars
        this.auth0Auth.quineAccessToken = accessToken;
        return accessToken;
      }
      return storedAccessToken;
    }
    // missing storedToken. This is either a fresh install or the user manually deleted the tokens
    const accessToken = await this.handleDeviceActivationFlow();
    // instantiate the Auth0Auth class, if the token's missing from the env var
    this.auth0Auth.quineAccessToken = accessToken;
    return accessToken;
  }

  private async handleExpiredTokenFlow(refreshToken: string): Promise<TAccessToken> {
    const ghInteractionInstance = await this.gitHubInteraction.getInstance();
    console.log('Running handleExpiredTokenFlow');
    const newAccessTokenResponse = await this.auth0Auth.exchangeRefreshTokenForAccessToken(refreshToken);
    console.log('Fetched new access token.');
    await ghInteractionInstance.setQuineAccessToken(newAccessTokenResponse.accessToken);
    console.log('Stored new access token as repo secret.');
    await ghInteractionInstance.setQuineRefreshToken(newAccessTokenResponse.refreshToken);
    console.log('Stored new refresh token as repo secret.');
    return newAccessTokenResponse.accessToken;
  }
  private async handleDeviceActivationFlow(): Promise<TAccessToken> {
    const ghInteractionInstance = await this.gitHubInteraction.getInstance();
    const {
      deviceCode,
      userCode,
      verificationURI,
      expiresIn,
      interval,
      verificationUriComplete,
    } = await this.auth0Auth.requestDeviceCode();
    // this.tokenPollingInterval = interval;
    await this.auth0Auth.requestDeviceActivation(verificationURI, userCode, verificationUriComplete);
    const newAccessTokenResponse = await this.auth0Auth.pollForTokens(deviceCode, verificationUriComplete, expiresIn, interval);
    console.log('Fetched new access token.');
    if (!newAccessTokenResponse) {
      throw new Error('Device authorization code expired. Please run the action again.');
    }
    await ghInteractionInstance.setQuineAccessToken(newAccessTokenResponse.accessToken);
    console.log('Stored new access token as repo secret.');
    await ghInteractionInstance.setQuineRefreshToken(newAccessTokenResponse.refreshToken);
    console.log('Stored new refresh token as repo secret.');
    return newAccessTokenResponse.accessToken;
  }
}