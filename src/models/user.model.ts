/*import mongoose = require('mongoose')
const Schema = mongoose.Schema;
const userSchema = new Schema({
  username: {
    type:String,
    required :true,
    unique:true,
    trim: true,
    minLength:3
  },

  id: {      // '1',
    type:String,

    unique:true,
    trim: true,
    minLength:1
   },

  email: {    // 'admin@app.com',
    type:String,
    trim: true,
    maxLength:60
  },
  password:{      // '$2y$10$k.58cTqd/rRbAOc8zc3nCupCC6QkfamoSoO2Hxq6HVs0iXe7uvS3e', // '123'
    type:String,

    trim: true,
    minLength:1
   },

 role: {      // ADMIN ,
    type:String,
    trim: true,
    minLength:4
   },

   confirmed: {      // true ,
    type:String,
    required :false,
    trim: true,
    minLength:4
   },

  createdWith: {      // password ,
    type:String,
   trim: true,
    minLength:4
   }


}, { timestamps: true, });
const User  = mongoose.model('User', userSchema);
export default User;
*/
const User =  {
  username: {
    type:String,
    required :true,
    unique:true,
    trim: true,
    minLength:3
  },

  id: {      // '1',
    type:String,

    unique:true,
    trim: true,
    minLength:1
   },

  email: {    // 'admin@app.com',
    type:String,
    trim: true,
    maxLength:60
  },
  password:{      // '$2y$10$k.58cTqd/rRbAOc8zc3nCupCC6QkfamoSoO2Hxq6HVs0iXe7uvS3e', // '123'
    type:String,

    trim: true,
    minLength:1
   },

 role: {      // ADMIN ,
    type:String,
    trim: true,
    minLength:4
   },

   confirmed: {      // true ,
    type:String,
    required :false,
    trim: true,
    minLength:4
   },

  createdWith: {      // password ,
    type:String,
   trim: true,
    minLength:4
   }


}
export default  User ;