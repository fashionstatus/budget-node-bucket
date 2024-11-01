import cors = require('cors');
import morgan = require('morgan');
// import = require('express');
// import mongoose , { ConnectOptions } from 'mongoose';

import express from "express";
import {  Application, Request,  Response , NextFunction} from "express";
import {IncomingHttpHeaders} from 'http';
import session = require('express-session');
import * as csrf from 'csurf';
import csrfCookieSetter from './utils/set-csrf-cookie';
import passport from './app/auth/passport';
import routes from './routes';
import config from './config';
import errorHandler from './utils/error-handler';
import serveIndex from './utils/serve-index';
import logger from './utils/logger';
import { User } from './models/user';
import fs  =  require('fs');
import https = require('https');
import http = require('http');
import path = require('path');
import 'localstorage-polyfill'

global.localStorage = localStorage;
declare module 'express-session' {
  interface SessionData { user: User | null | undefined }
}
console.log("ssl at : "+path.resolve(__dirname, './ssl.key/serveractual.key'))

if (typeof localStorage === "undefined" || localStorage === null) {
   const LocalStorage = require('node-localstorage').LocalStorage;
   localStorage = new LocalStorage('./scratch');
}

localStorage.setItem('myFirstKey', 'myFirstValue');
console.log(localStorage.getItem('myFirstKey'));

const privateKey  = fs.readFileSync(path.resolve(__dirname, './ssl.key/serveractual.key'), 'utf8');
const certificate = fs.readFileSync(path.resolve(__dirname,'./ssl.crt/serveractual.crt'), 'utf8');
const credentials = {key: privateKey, cert: certificate};
const app: Application = express();
// app.use(express.static('../angular/dist/'));
const httpsServer = https.createServer(credentials, app);
const httpServer = http.createServer( app);
const ip = '0.0.0.0'; // '192.168.32.1';
const port = 5555;
app.use(session(config.sessionConfig));
app.use(morgan(config.morganPattern, { stream: config.morganStream }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(cors());
/* MONGODB connection
// useCreateIndex:true, no support
const uri = config.ATLAS_URI;

mongoose.connect(uri, {

  useNewUrlParser:true,
  useUnifiedTopology: true
  } as ConnectOptions , (err: any) => {
  if(err) throw err;
  console.log('Connected to MongoDB')
});
// app.use(csrf());
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB ATLASS connection established succcessfully");
})


import exercisesRouter from './routes/exercises';
import  usersRouter  from './routes/users';
app.use('/exercises', exercisesRouter)
app.use('/users',usersRouter);



// MONGODB connection ------------------------------ NOT WORKING Mongoose install issue */
// app.use(csrfCookieSetter());
const originsWhitelist = ['https://localhost:8000',
  'https://192.168.1.4:8000','https://192.168.1.4:8080','http://192.168.1.4:3000','http://127.0.0.1:3000',
   'https://192.168.1.7','https://192.168.1.2','https://192.168.1.3','https://192.168.1.5','https://192.168.1.6',
   'https://budget-client-407513.el.r.appspot.com', 'https://glaubhanta.site','https://www.glaubhanta.site'
];
const options: cors.CorsOptions = {
   origin:  originsWhitelist ,
  credentials:true,
  methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH','OPTIONS']
}
 /*type issue not working
var corsOptions = {
  origin: function(origin: string, callback: any){
        var isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
        callback(null, isWhitelisted);
  },
  credentials:true,
  methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}*/
// const crsOpt = cors(options);
// app.options('*',crsOpt); // for pre-flight request for delete request's
app.use( (req: Request,  res: Response, next: NextFunction)  => {

  const origin :string = req.headers.origin !=undefined ? req.headers.origin :( req.headers.host !=undefined ? req.headers.host  :"") ;
   const  originHost =   origin.substring(0,origin.indexOf(":"));
console.log("req.headers "+JSON.stringify(req.headers));
  let validReqOrigin = false;
  originsWhitelist.forEach((validHost, index) => {
      if(validHost.indexOf(originHost) >-1){
        validReqOrigin = true;
      }
  });
  if(validReqOrigin) {
res.header("Access-Control-Allow-Origin",originHost);
     console.log("CORS allowed "+originHost);
// console.log("CORS request body "+JSON.stringify(req['body']));
  }
  else { console.log("CORS not allowed "+origin);
}
  res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
next();

},   cors(options));


/*
app.all('*', function(req: Request,  res: Response, next: NextFunction) {

        const origin :string = req.headers.origin !=undefined ? req.headers.origin :( req.headers.host !=undefined ? req.headers.host  :"") ;
         const  originHost =   origin.substring(0,origin.indexOf(":"));
	console.log("req.headers "+JSON.stringify(req.headers));
        let validReqOrigin = false;
        originsWhitelist.forEach((validHost, index) => {
            if(validHost.indexOf(originHost) >-1){
              validReqOrigin = true;
            }
        });
        if(validReqOrigin) {
	   res.header("Access-Control-Allow-Origin",originHost);
           console.log("CORS allowed "+originHost);
	  // console.log("CORS request body "+JSON.stringify(req['body']));
        }
        else { console.log("CORS not allowed "+origin);
	 }
        res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
	next();
    });
*/
// app.use(csrf());
// app.use(csrfCookieSetter());
app.use(errorHandler());
app.use(logger.initialize());
app.use(routes);
// app.get('*', serveIndex());
/*httpsServer.listen(8080, ip || 'localhost'  , () => {
  console.log("The HTTP SSL server started on port 8080");
});*/
httpServer.listen( port, ip || 'localhost' ,() => {
  console.log("The HTTP  server started ");
  console.log('Express server started on port %s', JSON.stringify(httpServer.address()));
});
// app.listen(8080, ip || 'localhost' ,() => logger.info('main.app_start'));