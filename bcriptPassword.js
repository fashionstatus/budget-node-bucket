const bcrypt = require('bcryptjs');

const args = process.argv;
console.log(args);

// 2nd arg is the user passwrd 
const salt = '$2a$10$f8.SA/84vLuIqChGu4Y/6u'

console.log(`type of args[2] ${args[2]} `); 

bcrypt.genSalt(10).then(salt => {
    bcrypt.hash(args[2], salt)
      .then(hash => console.log({ salt, hash }));
  });

