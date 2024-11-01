import { Request, Response, NextFunction } from 'express';
import path = require('path');
import 'localstorage-polyfill'

export default () => (req: Request, res: Response, next: NextFunction) => {
  // this allows Angular Router find the route after refreshing the page
  res.sendFile(path.resolve('../angular/dist/index.html'))
}