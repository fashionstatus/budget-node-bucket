/*import mongoose = require('mongoose')
const Schema = mongoose.Schema;
const exerciseSchema = new Schema({
  username: {
    type:String,
    required :true},
  description: { type:String ,required :true},
  duration:{type :Number, required: true},
  date: { type:Date, required: true }

}, { timestamps: true, });
const Exercise  = mongoose.model('Exercise',exerciseSchema);
 export default  Exercise;
*/

const Exercise =  {
  username: {
    type:String,
    required :true},
  description: { type:String ,required :true},
  duration:{type :Number, required: true},
  date: { type:Date, required: true }

}
export default  Exercise;