var mysql      = require('mysql');

// var connection = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'root',
//   password : '',
//   database : 'store'
// });

var connection = mysql.createConnection({
  host     : 'sql6.freemysqlhosting.net',
  user     : 'sql6512359',
  password : 'MkWpqf2KFq',
  database : 'sql6512359'
});
// Server: sql6.freemysqlhosting.net
// Name: sql6512359
// Username: sql6512359
// Password: MkWpqf2KFq
// Port number: 3306
// var connection = mysql.createConnection({
//   host     : '162.241.85.161',
//   user     : 'demoapit_teri_user',
//   password : 'Teri@321',
//   database : 'demoapit_teri'
// });
connection.connect(function(err) {
  // body...
  if(err){
    console.log('errr',err)
  }
})

module.exports = connection;