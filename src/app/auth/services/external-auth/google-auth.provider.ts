const axios = require('axios');
import config from '../../../../config';
import { UserInfo } from '../../../../models/userInfo';
import { ExternalAuthProvider } from './external-auth.provider';
import log from '../../../../utils/logger';
import 'localstorage-polyfill'

export class GoogleAuthProvider implements ExternalAuthProvider {
 private readonly JWT_TOKEN = "JWT_TOKEN";
 async getAccessToken(authCode: string, action?: string): Promise<string> {
    const options = { headers: { accept: 'application/json' } };
    console.log("action : "+action)
    const body = {
      client_id: config.externalAuth.google.clientID,
      client_secret: config.externalAuth.google.clientSecret,
      redirect_uri: config.externalAuth.google.callbackURL, // +`/${action}`
      grant_type: 'authorization_code',
      code: authCode
    };
    return axios.post(config.externalAuth.google.accessTokenUrl, body, options)
      .then((res: any) =>  res.data.access_token ) // INFO: also `refresh_token` and `expires_in` in res.data
      .catch((error: any) => {
         console.log(" h.google.getAccessToken_failed ");
        log.error('auth.google.getAccessToken_failed', { error });
        throw error;
      })
  }

 async getUserInfo(accessToken: string): Promise<UserInfo> {
     console.log("get UserInfo from Google accessToken: "+JSON.stringify(accessToken))

    const options = { headers: { Authorization: `Bearer ${accessToken}`, scope:"https://www.googleapis.com/auth/userinfo.profile"} };
    return axios.get(config.externalAuth.google.userInfoUrl, options)
      .then((res: any) => {
        log.info('auth.google.getUserInfo', { googleId: res.data.sub });
         console.log(" UserInfo from Google "+JSON.stringify(res.data))
         const userIN = new UserInfo();
         userIN.id="1";
         userIN.accountId="1";
         userIN.login="true";
         userIN.email =res.data.email;

         console.log("node userInfo "+JSON.stringify(userIN))
        return userIN

        /*  Thees are in G:\jee-neonvinay\eclipseox\workspace\budget-angular\src\app\models
        	userIN.account=undefined;
		         userIN.password=undefined;
		         userIN.role=undefined;
		         userIN.confirmed=undefined;
         userIN.tfa=undefined;
        */

      }).catch((error: any) => {
        log.error('auth.google.getUserInfo_failed', { error });
        console.log("Could not get UserInfo from Google ")
        return Promise.reject('Could not get UserInfo from Google')
      });
  }

}