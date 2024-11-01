const express = require('express');
import { Router , Request , Response} from 'express';
import Exercise  from '../models/exercise.model';

const router  = express.Router();

router.get('/exercises' , (req: Request, res: Response) => {
 /* Exercise.find()
     .then((exercise: any) => res.json(exercise))
     .catch((err: string) => res.status(400).json('Error: '+err));*/
});

router.post('/exercises/add', (req: Request, res: Response) => {
  const username = req.body.username;
  const description = req.body.description;
  const duration = Number(req.body.duration);
  const date = Date.parse(req.body.date);
   // new Exercise({username, description, duration, date})
  const newExercise :any =  {username, description, duration, date}
  newExercise.save()
   .then(() => res.json('Exercise added !'))
   .catch((err: string) => res.status(400).json('Error: '+err))

})

export default router;
