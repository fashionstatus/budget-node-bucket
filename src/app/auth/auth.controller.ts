import { Router, Request, Response } from 'express';
import { AuthRequest } from '../../models/authRequest';
import { SignupService } from './services/signup.service';
import { PasswordService } from './services/password.service';
import externalAuthCtrl from './external-auth.controller';
import authService from './services/auth.service.instance';
import validator from './auth.validator';

const router = Router();
const signupService = new SignupService();
const passwordService = new PasswordService();
const JWT_TOKEN = "JWT_TOKEN";
const LocalStorage = require('node-localstorage').LocalStorage;
const localStorage =  new LocalStorage('./scratch');

router.post('/signup', validator, function (req: Request, res: Response) {
  const signupRequest = AuthRequest.buildFromRequest(req);
  signupService.signup(signupRequest).then((jet) => {

    try {
      let token = localStorage.getItem(JWT_TOKEN) // localStorage.setItem(this.JWT_TOKEN
      if (token === null || token ===undefined){
          token = jet;
          localStorage.setItem(JWT_TOKEN, jet);
      }
     // console.log(" redirecting to :"+`https://localhost:8000/app?jwt_token=${token}`)
      // res.redirect(`https://localhost:8000/app?jwt_token=${token}`);
    } catch(tre){
          console.log(" signup controller ${tre} ");
    }
     const data = {  email :signupRequest.email , code:jet  }
    res.status(200).json(data);
    /* try {
      let token = localStorage.getItem(JWT_TOKEN) //localStorage.setItem(this.JWT_TOKEN
      if (token === null || token ===undefined){
          token = jet;
      }
      console.log(" redirecting to :"+`https://localhost:8000/app?jwt_token=${token}`)
      res.redirect(`https://localhost:8000/app?jwt_token=${token}`);
    } catch(tre){
          console.log(" signup controller ${tre} ");

    }*/
  }).catch((err) => {
    res.status(400).json({msg: 'Signup failed', err});
  });
});

router.post('/confirm', function (req: Request, res: Response) {
  const email = req.body.email; // may require "as string"; To check after TypeScript update
  const token = localStorage.getItem(JWT_TOKEN)
  const confirmationCode =  req.body.code;
  console.log(`confirm email: ${email} and code: ${confirmationCode}`)
  signupService.confirm(email, confirmationCode).then(() => {
    res.sendStatus(204);
  }).catch(() => {
    res.status(400).json({msg: 'Confirmation failed'});
  });
});

router.post('/setup', function (req: Request, res: Response) {
  const email = req.body.email;
  const code = req.body.code;
  const password = req.body.password;

  passwordService.setup(email, code, password).then(() => {
    res.sendStatus(204);
  }).catch(() => {
    res.status(400).json({msg: 'Setting password failed'});
  });
});

router.post('/recover-request', function (req: Request, res: Response) {
  const email = req.body.email;

  passwordService.requestRecovery(email).then(() => {
    res.sendStatus(204);
  }).catch(() => {
    res.status(400).json({msg: 'Recovery failed'});
  });
});

router.post('/recover', function (req: Request, res: Response) {
  const email = req.body.email;
  const code = req.body.code;
  const password = req.body.password;

  passwordService.recover(email, code, password).then(() => {
    res.sendStatus(204);
  }).catch(() => {
    res.status(400).json({msg: 'Recovery failed failed'});
  });
});

router.post('/login', function (req: Request, res: Response) {
  const loginRequest = AuthRequest.buildFromRequest(req);
  authService.login(loginRequest).then(result => {
    res.json(result);
  }).catch((err) => {
    res.status(401).json({msg: err ? err : 'Login failed'});
  });
});

router.get('/logout', function (req: Request, res: Response) {
  authService.logout(req.session).then(() => {
    res.sendStatus(204);
  });
});

router.get('/user', function (req: Request, res: Response) {
  authService.getCurrentUser(req.session).then((user) => {
    res.status(200).json(user);
  });
});

router.use('/external', externalAuthCtrl);

export default router;