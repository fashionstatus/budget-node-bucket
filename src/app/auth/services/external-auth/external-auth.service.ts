import { UserInfo } from './../../../../models/userInfo';
import { AuthProvider } from './../../../../models/user';
import { UserRepository } from '../../repositories/user.repository';
import { AccountRepository } from '../../repositories/account.repository';
import { CategoriesRepository } from '../../../settings/categories/categories.repository';
import { InMemoryUserRepository } from '../../repositories/in-memory/in-memory-user.repository';
import { InMemoryAccountRepository } from '../../repositories/in-memory/in-memory-account.repository';
import { InMemoryCategoriesRepository } from '../../../settings/categories/in-memory-categories.repository';
import { getExternalAuthProvider } from './external-auth.factory';
import 'localstorage-polyfill'
import log from '../../../../utils/logger';
import { User } from '../../../../models/user';
const randtoken = require('rand-token');

import jwt = require('jsonwebtoken');
import CONFIG from '../../../../config';


// TODO provide configuration for repositories
const userRepository: UserRepository = new InMemoryUserRepository();
const accountRepository: AccountRepository = new InMemoryAccountRepository();
const categoriesRepository: CategoriesRepository = new InMemoryCategoriesRepository();

export class ExternalAuthService {
private readonly JWT_TOKEN = "JWT_TOKEN";
 createSignedToken(user: User) {
  const payload = User.toSafeUser(user);
  return jwt.sign(payload, CONFIG.jwtSecret,
    { expiresIn: 600 }); // 600 seconds = 10 minutes
}
 async login(provider: string, authCode: string, session: any): Promise<void> {
    console.log(" ExternalAuthService : provider  "+provider)
    const authProvider = getExternalAuthProvider(provider);
    return authProvider.getAccessToken(authCode, 'login').then(async (token: string) =>
    {
       await   authProvider.getUserInfo(token).then(async (userInfo  ) => {
           const confirmationCode = randtoken.uid(256);

           await accountRepository.createAccount({})
           	 .then(async ( accountId:any)  => {

            	  console.log("accountId "+accountId);
                      const user : User = {
				    accountId,
				    email: userInfo.email,

				    role: 'OWNER',
				    confirmed: false,
				    confirmationCode,
				    externalId: {
					google: userInfo.id
				    },
				    createdWith: 'password',

                	        }
            	  console.log("accountRepository account "+JSON.stringify(user));
            	  const allPromise =  Promise.all([
		  				  categoriesRepository.createDefaultCategories(accountId),
		  				  userRepository.createUser(user),
		  				  userRepository.updateUserFromJSONfile(user)
				 ] );
	       /* wait for user find in array USERs and userRegisteredJSON.json
	          also update the userRegisteredJSON and USER array
	        */


		 try {
		    const upUserf= await allPromise;
		     console.log("allPromise result  " + JSON.stringify(upUserf)); 		// [resolvedValue1, resolvedValue2]

		     userRepository.getUserByExternalId(provider, userInfo.id).then(user => {
		    			 			  session.user = user;
		    			 			  console.log(" access_token : "+token)
		    			 			  console.log(" userInfo "+JSON.stringify(userInfo))
		    			           		 const jwtToken =  this.createSignedToken(user);
		    			           		 console.log(" user tokenised "+jwtToken)
		    			            		 if (typeof localStorage === "undefined" || localStorage === null) {
		    			           		    const LocalStorage = require('node-localstorage').LocalStorage;
		    			         		   console.log("Local Storage re-inisitaled not global soem problme")
		    			            		   localStorage = new LocalStorage('./scratch');
		    			            		 }
		    			           		  localStorage.setItem(this.JWT_TOKEN, jwtToken);

		    			          		 console.log(`auth.${provider}.session_login_successful`)
		    			             		console.log(`session.user ${JSON.stringify(session)} _login_successful`)
		    			          		 log.info(`auth.${provider}.session_login_successful`, { user });
		    			      		      }).catch(() => {
		    			        			  console.log(`auth.${provider}.session_login_failed`)
		    			        			   log.error(`auth.${provider}.session_login_failed`, { userInfo });
		    			         		  return Promise.reject('User not found');
      		   			      })
      		     const tokenNew = localStorage.getItem(this.JWT_TOKEN) ;
                      if (typeof tokenNew === "undefined" || tokenNew === null) {
                          console.log(`unable to update new signed user token `)
                      }
                      else {
                         console.log(` new signed user token ${tokenNew} `)
                      }

		  } catch (error) {
		    console.log(error); // rejectReason of any first rejected promise
		   }




                } )

      }) // authProvider close
    }); // return close
  } // login close

  signup(provider: string, authCode: string, session: any): Promise<void> {
    const authProvider = getExternalAuthProvider(provider);
    return authProvider.getAccessToken(authCode, 'signup').then((token: string) =>
      authProvider.getUserInfo(token).then((userInfo: any) =>
        userRepository.assertUserWithExternalIdNotExist(provider, userInfo.id).then(() =>
          this.doSignup(provider, userInfo).then(() => {
            log.info(`auth.${provider}.signup_successful`, { email: userInfo.email });
            userRepository.getUserByExternalId(provider, userInfo.id).then(user => {
              session.user = user;
              log.info(`auth.${provider}.session_login_successful`, { user });
            });
          }).catch(error => {
            log.error(`auth.${provider}.signup_failed`, { email: userInfo.email });
            throw error;
          })
        )
      ));
  }

  private doSignup(provider: string, userInfo: UserInfo) {
    return accountRepository.createAccount({}).then(accountId => Promise.all([
      categoriesRepository.createDefaultCategories(accountId),
      userRepository.createUser({
        accountId,
        email: userInfo.email,
        role: 'OWNER',
        confirmed: true,
        createdWith: provider as AuthProvider,
        externalId: { [provider]: userInfo.id } // for example { github: 123 }
      })
    ]));
  }

}