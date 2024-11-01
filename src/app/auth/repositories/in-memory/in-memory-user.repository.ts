import { UserRepository } from '../user.repository';
import { Id, UserRole } from 'src/models/types';
import { User } from 'src/models/user';
// resolve = require('path').resolve
 const fs = require('fs');
    const fileName = '../../../../userRegisteredJson.json';
    const file = require(fileName);

function readUserRegisteredJSON() {
  // file  = resolve(file)
  console.log(" users Regsitered in JSON is  "+file.users.length)
  console.log(" us: "+JSON.stringify(file.users));
    // let filedata ='';
   //  const data = fs.readFileSync(file, { encoding: 'utf8' });
    return file.users;
}
let usersRegistered = readUserRegisteredJSON();
const checkEmail = (vale:User ,k:any ) => {
         return vale.email === k;
}


export class InMemoryUserRepository implements UserRepository {

  getUserById(id: Id, attachAccount = false): Promise<User> {
    const user = USERS.find(user => user.id === id);
    if (attachAccount) {
      // TODO attach account in response
    }
    return new Promise((resolve, reject) => {
      user ? resolve(user) : reject();
    });
  }

  getUserByEmail(email: string): Promise<User> {
    const user = USERS.find(user => user.email === email);
    const user2 = this.readUserFromJSONfile(email);
    return new Promise((resolve, reject) => {
      user ?  resolve(user)  : ( user2 ?  resolve(user2) : reject("Invalid Email 2 try ")) ;
    });
  }

  getUserByExternalId(provider: string, externalId: string): Promise<User> {
    console.log(`provider ${provider} and eternalId ${externalId} `)
    const user = USERS.find(user => !!externalId && !!user.externalId && user.externalId[provider] === externalId);
    console.log(`getUserByExternalId ${JSON.stringify(user)}  `)
    return new Promise((resolve, reject) => {
      user ? resolve(user) : reject();
    });
  }
  readUserFromJSONfile(userInEmail : string) {
   console.log(" readUserFromJSONfile File  ....")
	let user =null;
     if(typeof usersRegistered !== "undefined" || usersRegistered !== null) {
        console.log("userRegisteredJson file is read ")
        if( usersRegistered instanceof Object && Array.isArray(usersRegistered)){
            // check user already in array
              console.log('looking for email '+userInEmail);
             user = usersRegistered.find(user => user.email === userInEmail);
            // user not found so add the user
            if( user === undefined || user === null ) {
                 console.log('new user not in memory .. plese signup  ');
            }
            else {
		 console.log('user in memory retrieving .. ');
		  console.log('user is .. '+JSON.stringify(user));
            }
        }
        else {
             console.log('new user not in userRegisteredJson.json .. ');
        }
     }
     return user;

  }

  resyncUSERSandRegisteredUser() {

   const uniqUsers = 	usersRegistered.reduce(function(arr:User[], curr:User) {
			const exits =   arr.filter( elem => checkEmail(elem, curr.email ));
			if( exits.length ==0){
			  console.log("pushed "+JSON.stringify(curr))
			 return  arr.push(curr)
	                }
	                else {
	                 return arr
	                }

	                } , USERS);
    USERS = uniqUsers ;
    usersRegistered =  uniqUsers;

  }
  async updateUserFromJSONfile(userIn: User): Promise<User> {
    console.log(" updateUserFormJSON File  ....")

    console.log(" updateUserFormJSON File  ....")
    let userFond = null;
     if(typeof file !== "undefined" || file !== null) {
        console.log("userRegisteredJson file is read ")
        if( usersRegistered instanceof Object && Array.isArray(usersRegistered)){
          console.log("userRegistered is array ")
           console.log("lookup for:  "+JSON.stringify(userIn))
          this.resyncUSERSandRegisteredUser();
            // check user already in array
             userFond = usersRegistered.find(user => user.email === userIn.email);
            // user not found so add the user
            if(typeof userFond === undefined || typeof userFond === null ) {
             /* fs.writeFile(fileName, JSON.stringify(userIn), function writeJSON(err:any) {
                if (err) return console.log(err);
                console.log(JSON.stringify(userIn));
               console.log('writing to ' + fileName);
              });
              */
              fs.readFile(fileName, function (err:any, data:any) {
	          const json = JSON.parse(data);
	          console.log("updateUserFromJSONfile users "+JSON.stringify(json))
	          json.push( userIn);
	          fs.writeFile("results.json", JSON.stringify(json), function(err:any){
	            if (err) throw err;
	            console.log('The user appended to registered json file!');
	          });
	          console.log("updated users "+JSON.stringify(json))
	      })
	      usersRegistered = readUserRegisteredJSON();
              this.resyncUSERSandRegisteredUser();
            }
            else {
              // check user present in In-memonry Array
              const userInM = USERS.find(user => user.email === userIn.email);
              if(typeof userInM === undefined || typeof userInM === null) {
                 console.log('new signup added to ImMeomry ' + fileName);

              }
              else {
                   console.log('new signup already to ImMeomry ');
                   userFond = userInM
              }

            }

        }

     }
    return Promise.resolve(userFond);
   /* fs.writeFile(fileName, JSON.stringify(file), function writeJSON(err:any) {
      if (err) return console.log(err);
        console.log(JSON.stringify(file));
        console.log('writing to ' + fileName);
    });*/


  }
  assertUserWithExternalIdNotExist(provider: string, externalId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getUserByExternalId(provider, externalId)
        .then((user) => reject('User already exists'))
        .catch(() => resolve());
    });
  }

  getUsers(accountId: Id): Promise<User[]> {
    const users = USERS.filter(user => user.accountId === accountId)
    return Promise.resolve(users);
  }

 async createUser(user: User): Promise<Id> {
    user.id = (USERS.length + 1).toString();
    USERS.push(user);
    return Promise.resolve(user.id);
  }

  deleteUser(id: Id): Promise<void> {
    USERS = USERS.filter(user => user.id !== id);
    return Promise.resolve();
  }

  patchUser(id: Id, data: User): Promise<User> {
    return this.getUserById(id)
      .then(userToPatch => Object.assign(userToPatch, data));
  }

}

let USERS: User[] = [
  {
    id: '1',
    email: 'admin@app.com',
    password: '$2y$10$k.58cTqd/rRbAOc8zc3nCupCC6QkfamoSoO2Hxq6HVs0iXe7uvS3e', // '123'
    role: 'ADMIN',
    confirmed: true,
    createdWith: 'password'
  },
  {
    id: '2',
    accountId: '1',
    email: 'bartosz@app.com',
    password: '$2y$10$k.58cTqd/rRbAOc8zc3nCupCC6QkfamoSoO2Hxq6HVs0iXe7uvS3e', // '123'
    role: 'OWNER',
    confirmed: true,
    createdWith: 'password',
    tfa: true,
    tfaSecret: 'FB2S2HQLIE2UIZQDGYLCMS3SNZMXQDSK'
  },
  {
    id: '3',
    accountId: '2',
    email: 'john@app.com',
    password: '$2y$10$k.58cTqd/rRbAOc8zc3nCupCC6QkfamoSoO2Hxq6HVs0iXe7uvS3e', // '123'
    role: 'OWNER',
    confirmed: true,
    createdWith: 'password'
  },
  {
    id: '4',
    accountId: '2',
    email: 'mike@app.com',
    password: '$2y$10$k.58cTqd/rRbAOc8zc3nCupCC6QkfamoSoO2Hxq6HVs0iXe7uvS3e', // '123'
    role: 'READER',
    confirmed: true,
    createdWith: 'password'
  },
  {
    id: '5',
    accountId: '1',
    email: 'hi@bartosz.io',
    role: 'OWNER',
    confirmed: true,
    externalId: {
      github: '8076187'
    },
    createdWith: 'github'
  },
  {
    id: '6',
    accountId: '1',
    email: 'vickyscab24@gmail.com',
    role: 'OWNER',
    confirmed: true,
    externalId: {
      google: '111013284878009413865'
    },
    createdWith: 'password'
  },
  {
    id: '8',
    accountId: '1',
    email: 'fairvinay@gmail.com',
    role: 'OWNER',
    password:'$2a$10$cybQQz2tlSQm5fpn8dyv8ebDxaN/PCrHwt6hIH2nbkNrr2aQuWM9q', // 12345
    confirmed: true,
    externalId: {
      google: '108114016982917227438'
    },
    createdWith: 'password'
  },
   // 116215353782290208356
    {
    id: '7',
    accountId: '1',
    email: 'anvekar.v.anandi@gmail.com',
    role: 'OWNER',
    confirmed: true,
    externalId: {
      google: '116215353782290208356'
    },
    createdWith: 'password'
  }
];
