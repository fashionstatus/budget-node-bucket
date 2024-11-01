const randtoken = require('rand-token');
import bcrypt = require('bcryptjs');
import CONFIG from '../../../config';
import { OtpService } from './otp.service';
import { UserRepository } from '../repositories/user.repository';
import { AccountRepository } from '../repositories/account.repository';
import { InMemoryAccountRepository } from '../repositories/in-memory/in-memory-account.repository';
import { InMemoryUserRepository } from '../repositories/in-memory/in-memory-user.repository';
import { CategoriesRepository } from '../../settings/categories/categories.repository';
import { InMemoryCategoriesRepository } from '../../settings/categories/in-memory-categories.repository';
import { AuthRequest } from 'src/models/authRequest';
// import { User } from 'src/models/user';
import { User } from '../../../models/user';
import 'localstorage-polyfill';
import log from './../../../utils/logger';
import jwt = require('jsonwebtoken');


const userRepository: UserRepository = new InMemoryUserRepository();
const accountRepository: AccountRepository = new InMemoryAccountRepository();
const categoriesRepository: CategoriesRepository = new InMemoryCategoriesRepository();
const otp = new OtpService();

/*
  >>> Salt prevents from Rainbow Tables attack. How bcrypt generates salt?
  >>> Example code with explicit salt generation and hashing:

  bcrypt.genSalt(10).then(salt => {
    bcrypt.hash("password here", salt)
      .then(hash => console.log({ salt, hash }));
  });

  >>> Results in:

  {
    salt: '$2a$10$f8.SA/84vLuIqChGu4Y/6u',
    hash: '$2a$10$f8.SA/84vLuIqChGu4Y/6uFZMdQsBSAnYjymCIrXLVsIihRiDN4kS'
  }

  >>> Where:

  $2a$                            - bcrypt prefix
  $10$                            - cost factor (2^10 ==> 1,024 iterations)
  f8.SA/84vLuIqChGu4Y/6u          - salt
  FZMdQsBSAnYjymCIrXLVsIihRiDN4kS - hash

  >>> Structure:

  $2a$[cost]$[22 character salt][31 character hash]
  \__/\____/ \_________________/\_________________/
  Alg  Cost          Salt              Hash

*/
export class SignupService {
   localStorage: any;

   private readonly JWT_TOKEN = "JWT_TOKEN";

   constructor() {
       const LocalStorage= require('node-localstorage').LocalStorage;
       // var LocalStorage = LocalStorageT.localStorage;
            console.log("Local Storage re-inisitaled not global soem problme")
       this.localStorage = new LocalStorage('./scratch');
   }

  getLocalStorage() {
      const LocalStorage= require('node-localstorage').LocalStorage;
       // var LocalStorage = LocalStorageT.localStorage;
            console.log("Local Storage re-inisitaled not global soem problme")
        localStorage = new LocalStorage('./scratch');

  }

  createSignedToken(user: User) {
        const payload = User.toSafeUser(user);
          return jwt.sign(payload, CONFIG.jwtSecret,
            { expiresIn: 600 }); // 600 seconds = 10 minutes
         }



 async  signup(signupRequest: AuthRequest): Promise<any> {
    console.log("Sigun service ...")
    const confirmationCode = randtoken.uid(256);

     const user : User = {
            accountId: '',
            email: signupRequest.email,
            password: '',
            role: 'OWNER',
            confirmed: false,
            confirmationCode,
            createdWith: 'password',
            tfaSecret: otp.generateNewSecret()
          };
    return bcrypt.hash(signupRequest.password, 10) // 10 is the cost factor (implicit salt generation)
      .then(hashedPassword => accountRepository.createAccount({})
        .then(accountId =>
                 {
                    user.accountId = accountId; user.password = hashedPassword
             Promise.all([
          categoriesRepository.createDefaultCategories(accountId),
          userRepository.createUser(user),
          userRepository.updateUserFromJSONfile(user)
        ])
          }
        ).then(() => {
          log.info('auth.signup_successful', { email: signupRequest.email });
          const jwtToken =  this.createSignedToken(user);
          // this.getLocalStorage();
          // this.sendConfirmationEmail(signupRequest.email, confirmationCode);
          if (typeof this.localStorage === undefined || this.localStorage === null) {
               this.getLocalStorage();
          }
          else if (typeof this.localStorage !== "undefined" || this.localStorage !== null) {
              try {
              // console.log(" user tokenised "+jwtToken)
              console.log(" signup local storeage  "+JSON.stringify(this.localStorage))

              this.localStorage.setItem(this.JWT_TOKEN, jwtToken);
              } catch(tre){
                  console.log(" signup service ${tre} ");
              }
          }
          return Promise.resolve(jwtToken);
        }).catch(error => {
          log.error('auth.signup_failed', { email: signupRequest.email });
          throw error; // rethrow the error for the controller
        })
      );
  }

  confirm(email: string, confirmationCode: string): Promise<void> {
    return userRepository.getUserByEmail(email).then(user => {
      if (user && !user.confirmed && user.confirmationCode === confirmationCode) {
        user.confirmed = true;
        user.confirmationCode = undefined;
        log.info('auth.confirmation_successful', { email });
      } else {
        log.warn('auth.confirmation_failed', { email });
        return Promise.reject();
      }
    });
  }

  private sendConfirmationEmail(email: string, code: string) {
    const link = `${CONFIG.clientUrl}/confirm?email=${email}&code=${code}`;
    console.log(`>>> LINK >>>: ${link}`); // mock email sending :)
    log.info('auth.signup_confirmation_email_sent', { email });
  }

}