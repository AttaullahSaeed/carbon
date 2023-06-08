import { XeroClient } from 'xero-node';
import { setEnvValue, saveTokenToDB } from '../utils.js';

const XERO_AUTH_URL = 'https://identity.xero.com/connect/token';
const port = process.env.PORT;
export const initXero = () => {
    return new XeroClient({
        response_type: 'code',
        clientId: process.env.XERO_CLIENT_ID,
        clientSecret: process.env.XERO_SECRET_ID,
        redirectUris: [`http://localhost:${port}/callback`],
        scopes: 'openid profile email accounting.settings accounting.transactions offline_access'.split(
          ' '
        ),
        state: 'returnPage=my-sweet-dashboard'
      });
}

export const initXeroWithTokenSet = () => {
    return new XeroClient({
        clientId: process.env.XERO_CLIENT_ID,
        clientSecret: process.env.XERO_SECRET_ID,
        redirectUris: [`http://localhost:${port}/callback`],
        scopes: 'openid profile email accounting.settings accounting.transactions offline_access'.split(
          ' '
        )
      });
}

export const refreshTokenSet = async (xero, tokenSet) => {
  const now = new Date().getTime()

  if (tokenSet.expired()) {
    console.log('token expired...refreshing now...')
    try {
      const validTokenSet = await xero.refreshToken();
      
      tokenSet = validTokenSet;
      console.log(`new refresh tokken is ${tokenSet.refresh_token}`)
      process.env['TOKENS'] = JSON.stringify(tokenSet);
      setEnvValue("TOKENS", JSON.stringify(tokenSet));
      await saveTokenToDB(JSON.stringify(tokenSet));

      await xero.setTokenSet(validTokenSet);
      return validTokenSet;
    } catch(error) {
      console.log('error in refreshing token');
      console.log(error);
      return null;
    }
  }
  return tokenSet;
}

export const getAccounts = async tokenSet => {
  const xero = initXeroWithTokenSet();
  await xero.initialize();
  await xero.setTokenSet(tokenSet);
  const now = new Date().getTime()
  tokenSet = await xero.readTokenSet();
  tokenSet = refreshTokenSet(xero, tokenSet);
  tokenSet = await xero.readTokenSet();
  
  try {
    await xero.updateTenants();
  } catch(error) {
    console.log('error in updating Tenants hence refreshing Tokens');
    tokenSet = refreshTokenSet(xero, tokenSet);
    await xero.setTokenSet(tokenSet);
    await saveTokenToDB(JSON.stringify(tokenSet));

    
  }

  
  const activeTenantId = xero.tenants[0].tenantId;

  try {
    const getAccountsResponse = await xero.accountingApi.getAccounts(activeTenantId);
    return getAccountsResponse.body.accounts;
  }
  catch(error) {
    console.log(error);
    return null;
  }
}