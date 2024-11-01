const randtoken = require('rand-token');
import log from '../../../../utils/logger';

const LENGTH = 32;

export default {

  setAndGetNewState(session: any) {
    session.oauthState = randtoken.generate(LENGTH);
    console.log("StateService : setAndGetNewState session state  "+session.oauthState)
    return session.oauthState;
  },

  getAndRemoveState(session: any) {
    const state = session.oauthState;
    session.oauthState = null;
    return state;
  },

  assertStateIsValid(session: any, state: string) {
    return new Promise<void>((resolve, reject) => {
       console.log("StateService : assertStateIsValid state  "+state)
      if (!!state && state.length === LENGTH && state === session.oauthState) {
         console.log("StateService : assertStateIsValid session.oauthState  "+session.oauthState)
        log.info('auth.external.state.valid_check', { state });
        resolve();
      } else {
         console.log("StateService Failed: assertStateIsValid session.oauthState  "+session.oauthState)
        log.error('auth.external.state.failed_check', { state, expectedState: session.oauthState });
        reject('Invalid state paramater');
      }
    });
  }

}