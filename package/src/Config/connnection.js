var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'shooolnyt'
});

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


