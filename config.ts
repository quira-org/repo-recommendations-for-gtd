const prodAuth0Hostname = 'https://quine.eu.auth0.com';
const devAuth0Hostname = 'https://dev-6efvmm67.eu.auth0.com';

const devAPIURL = 'https://cosmos-dev.quine.sh/api';
const prodAPIURL = 'https://cosmos.quine.sh/api';
const devFERoot = 'https://scout-dev.quine.sh';
const prodFERoot = 'https://scout.quine.sh';

export const prodConfig = {
  userInfoEndpoint: `${prodAuth0Hostname}/userinfo`,
  tokenEndpoint: '/oauth/token',
  tokenURI: `${prodAuth0Hostname}/oauth/token`,
  auth0Hostname: prodAuth0Hostname,
  auth0ClientId: 'WhITauwih53wi382lP0wxh9f7RPQQKGR',
  deviceActivationURI: `${prodAuth0Hostname}/oauth/device/code`,
  audience: `${prodAuth0Hostname}/api/v2/`,
  quineURLs: {
    feRoot: prodFERoot,
    cosmos: {
      user : {
        register: `${prodAPIURL}/cosmos/user/register/`
      },
    },
    scout :{
      recommendation: `${prodAPIURL}/scout/recommendation/`,
      repositories: {
        cardInfo: `${prodAPIURL}/scout/repositories/card-info/`,
      },
    }
  }
};

export const devConfig = {
  userInfoEndpoint: `${devAuth0Hostname}/userinfo`,
  tokenEndpoint: '/oauth/token',
  tokenURI: `${devAuth0Hostname}/oauth/token`,
  auth0Hostname: devAuth0Hostname,
  auth0ClientId: 'QNWUQQvFoW8F5hQberf7jbxnOGBCci0O',
  deviceActivationURI: `${devAuth0Hostname}/oauth/device/code`,
  audience: `${devAuth0Hostname}/api/v2/`,
  quineURLs: {
    feRoot: devFERoot,
    cosmos: {
      user : {
        register: `${prodAPIURL}/cosmos/user/register/`
      },
    },
    scout :{
      recommendation: `${prodAPIURL}/scout/recommendation/`,
      repositories: {
        cardInfo: `${prodAPIURL}/scout/repositories/card-info/`,
      },
    }
  }
};

export const config = prodConfig;