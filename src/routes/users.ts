import { Router , Request , Response } from 'express';
import User from '../models/user.model';


const validateEmail = (email: any) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const validateEmail2 = (email: any )=> {
  return String(email)
    .toLowerCase()
    .match(
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/
    );
};

const router  = Router();

router.get('/users/', (req: Request, res: Response) => {
  /*User.find()
     .then((users: any) => res.json(users))
     .catch((err: string) => res.status(400).json('Error: '+err));*/
});

router.get('/users/search/:email', (req: Request, res: Response) => {
	const e = validateEmail (req.params.email) || validateEmail2(req.params.email) ;
	const em = req.params.email;
if (e !== undefined || e !== "") {

/*  User.find({}, { projection: { username: 0 , email: 0 , password: 0 ,role: 0 , confirmed: 0 , created: 0   } })
     .then((users: any[]) => {
			 console.log('users '+JSON.stringify(users)	);
		 const ul = users.filter((u: { email: string | undefined; username: string | undefined; }) => ( u.email !== undefined ? em.indexOf(u.email) >-1 : (u.username !==undefined ? em.indexOf(u.username)>-1 : false)  ) )
			if(ul.length>0) { console.log('user found '+em);}
		res.json(ul) } )
     .catch((err: string) => res.status(400).json('Error: '+err));*/
 }
 else {
	res.status(400).json('Error: INVALID Search '+req.params.email)
	}



});

router.get('/users/:email', (req: Request, res: Response) => {
   const e = validateEmail (req.params.email) || validateEmail2(req.params.email) ;
   if (e !== undefined || e !== "") {
      	console.log("e " + e);
	const em = req.params.email;
	const stipCaret =  req.params.email.substring(0,req.params.email.indexOf("@"));
	const query ={ "email": "" }; query.email = stipCaret ;
         console.log("query " + JSON.stringify(query)); // query
	console.log("em " + JSON.stringify(em)); // em
	/*User.findOne( { "$or": [ { email: em }, { username: stipCaret} ] }, { username: { $ifNull: [ "$username", null ] }, email: { $ifNull: [ "$email", null ] } ,
			 password: { $ifNull: [ "$password", null ] },
			 role: { $ifNull: [ "$role", null ] },
			confirmed: { $ifNull: [ "$confirmed", null ] },
			created: { $ifNull: [ "$created", null ] } ,
			 _id: false })
     		.then((users: any) =>      {
			    res.json(users)
	 	}).catch((err: string) => res.status(400).json('Error: '+err));*/

    }
   else {
	res.status(400).json('Error: INVALID '+req.params.email)
    }
}
);

router.post('/users/add' , (req: Request, res: Response) => {
  const username = req.body.username;
  const email = req.body.username;
const password= req.body.password;
const role = req.body.role;
const confirmed = req.body.confirmed;
const createdWith = req.body.createdWith;
const id= req.body.id;
  // new User({username , id , email, password, role, confirmed, createdWith})
  const newUser :any = {username , id , email, password, role, confirmed, createdWith};
    newUser.save()
   .then(() => res.json('User added !'))
   .catch((err: string) => res.status(400).json('Error: '+err))

})
export default  router;
