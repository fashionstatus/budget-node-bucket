import bcrypt = require('bcryptjs');
import jwt = require('jsonwebtoken');
import CONFIG from '../../../config';
import passport from '../passport';
import { AuthService } from './auth.service';
import { LoginThrottler } from './login.throttler';
import { UserRepository } from '../repositories/user.repository';
import { InMemoryUserRepository } from '../repositories/in-memory/in-memory-user.repository';
import { AuthRequest } from './../../../models/authRequest';
import { Token } from './../../../models/token';
import { User } from './../../../models/user';
import log from './../../../utils/logger';

// TODO provide configuration for repositories
const userRepository: UserRepository = new InMemoryUserRepository();
const loginThrottler = new LoginThrottler();

export class JwtAuthService implements AuthService<Token> {

  authenticate() {
    console.log("jwt-auth-service authenticate .... passport being used ")
    return passport.authenticate('jwt', { session: false });
  }

  login(loginRequest: AuthRequest): Promise<Token> {
    const email = loginRequest.email;

    console.log('JWT Auth used '+email)
	console.log('req  '+JSON.stringify(loginRequest))
    if(loginRequest?.email === undefined || loginRequest?.password === undefined ) {
	   log.info('login payload not proper ', {loginRequest});
	   console.log('login payload not proper ', {loginRequest});
	  return Promise.reject('Please check request payload ');
	}
    return userRepository.getUserByEmail(email).then(user => {

      return loginThrottler.isLoginBlocked(email).then(isBlocked => {
        if (isBlocked) {
          log.warn('auth.jwt_login_failed.user_blocked', {email});
          throw new Error(`Login blocked. Please try in ${CONFIG.loginThrottle.timeWindowInMinutes} minutes`);
        } else {
          return bcrypt.compare(loginRequest.password, user.password!).then(match => {
            if (match && user.confirmed) {

              const token = createSignedToken(user);
              log.info('auth.jwt_login_successful', {user});
              const result =JSON.stringify('mit der Aufgabe fertig'  );
              //  'закончил с задачей';
              const timeFormat: Intl.DateTimeFormatOptions = { month: 'numeric', day: '2-digit', hour: '2-digit', minute: '2-digit',
                   hour12: false, timeZoneName: 'long', timeZone: 'Asia/Kolkata' };
              const date = new Date();
                const cd =  new Intl.DateTimeFormat('en-GB', timeFormat).format(date);
              const version =  cd ;
              const logTemp = {
                      jwt : token,
                      day: [result, version].join('\n')
              }
              log.info('logged ', {logTemp});

              return { jwt: token , day: [result, version].join('\n') };

            } else if (match && !user.confirmed) {

              log.info('auth.jwt_login_failed.not_confirmed', {user});
              return Promise.reject('Please confirm your user profile');

            } else {

              loginThrottler.registerLoginFailure(email);
              log.info('auth.jwt_login_failed.wrong_password', {user});
              return Promise.reject();

            }
          });
        }
      });

    });
  }

  logout() {
    log.info('auth.jwt_logout_successful');
    return Promise.resolve();
  }

  getCurrentUser(): Promise<void> {
    return Promise.resolve();
  }

}

function createSignedToken(user: User) {
  const payload = User.toSafeUser(user);
  return jwt.sign(payload, CONFIG.jwtSecret,
    { expiresIn: 600 }); // 600 seconds = 10 minutes
}
