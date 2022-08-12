
const bcrypt = require('bcryptjs');
const connection = require('../Config/connnection')
const Utill = require('../Utill');
const sendEmail  =  require('../Utill/sendEmail');
const jwt = require('jsonwebtoken');
const getAllUser = (req,res,next) => {
	res.json({ status: true,message:"all user listed here ", list:[]})
}
const register = async (req, res, next) => {
	let sqlQuery  = ''
	const { 
		schoolsCode='qab',
		principalname='',
		schoolname='',
		country='',
		state='',
		pincode='',
		mobile='',
		email='',
		ismobileVerified=false,
		isEmailVerified=false,
		isLocal,
      	stateCityCode,
      	countryCode
	} = req.body;
	 sqlQuery = `SELECT COUNT(*) AS totalRows FROM Schools` 
	 let totalrows = 0;
	 connection.query(sqlQuery,function(err,data){
	 	if(err) {
	 		console.log("erro 00990",err)
	 	}
	 	totalrows = Array.from(data)[0].totalRows;
	 	let uniqueSchoolCode = Utill.schoolCodeGen(isLocal,stateCityCode,totalrows,countryCode);
	 	sqlQuery = `SELECT * FROM Schools WHERE schoolsCode='${schoolsCode}'`
		connection.query(sqlQuery,function(error,result){
		if(error){

			res.status(500).json({ status: false, message:"Please try again!"})
		} else if(Array.from(result).length === 0) {
			let pass = Utill.generatePassword()
			sqlQuery = `INSERT INTO Schools (schoolsCode, principalname, schoolname, country, state, pincode, mobile, email, ismobileVerified, isEmailVerified,password) 
			VALUES ("${uniqueSchoolCode}", "${principalname}", "${schoolname}","${country}", "${state}", "${pincode}", "${mobile}", "${email}", ${ismobileVerified}, ${isEmailVerified},"${pass}")`
			connection.query(sqlQuery,function(error,response) {
				console.log("error",error)
				if(error){
					res.status(500).json({ status: false, message:"Please try again1"})
				} else {
					sendEmail(principalname,email,{ schoolCode: uniqueSchoolCode,pass: pass })
					res.status(200).json({ status: false, message:"User added to DB"})
				}
			})
		} else {
			res.status(200).json({ status: false, message:"School is already registered"})
		}
		})
	 });
}

const upDateSchool = async (req, res, next) => {
	let sqlQuery  = ''
	const { 
		postaladdress,
      	district,
      	coordinatingteacher,
      	phoneStd,
      	code
	} = req.body;
	if(!(code)) {
		res.status(400).json({ message: "Bad credentails", status: false})
	} else {
		sqlQuery = `
		UPDATE Schools
		SET coordinating_teacher = '${coordinatingteacher}', PostalAddress= '${postaladdress}', district='${district}',PhoneStd='${phoneStd}'
		WHERE schoolsCode = '${code}';`
		connection.query(sqlQuery,function(error,response) {
		if(error){
			console.log("error",error)
			res.status(500).json({ status: false, message:"Please try again1"})
		} else {
			res.status(200).json({ status: true, message:"User information updated!"})
		}
	})
	}
	
	
}

const login = (req,res,next) =>  {
	console.log("login ....")
	const { username, password, isIndi=false} = req.body;
	connection.on('error',function(err) {
		console.log("[mysql error]",err);
	})
	if(typeof username !== 'undefined' && typeof password !== 'undefined' && username !== "" && password !== "") {
		let sqlQuery = '';
		!isIndi ? sqlQuery = `SELECT COUNT(schoolname) AS count FROM Schools WHERE schoolsCode = "${username}" AND password = "${password}" LIMIT 0, 1;`: sqlQuery = `SELECT COUNT(StudentID) AS count FROM IndiGo4Student WHERE Rollno = "${username}" AND password = "${password}" LIMIT 0, 1;`	
		//sqlQuery = `SELECT COUNT(schoolname) AS count FROM Schools WHERE schoolsCode = "${username}" AND password = "${password}" LIMIT 0, 1;`	
		console.log('sqlQuery',sqlQuery)
		connection.query(sqlQuery, function(err,result) {
			if(err){
				console.log('error',err);
				res.json({
					status: false,
					message: "Please try again!"
				})
			} else {
				if(Array.from(result).length > 0 && Array.from(result)[0].count === 1) {
						
						!isIndi ? sqlQuery = `SELECT * FROM Schools WHERE schoolsCode = "${username}" AND password = "${password}"`:sqlQuery = `SELECT * FROM IndiGo4Student WHERE Rollno = "${username}" AND password = "${password}"`	
						
						connection.query(sqlQuery, function(err,result) {
						if(err) {

						} else {
							const  user =  Array.from(result)[0];
							try { delete user?.password } catch(e) { console.log('')} 
							try { delete user?.Password } catch(e) { console.log('')} 

							delete user.password;
							const token = jwt.sign({ 
								...user
							 },'ALPHA90009', { expiresIn: "2h" });
							
							res.json({
								data: user,
								status: true,
								token: token,
								message: "Login successfully!"
							})
						}
						})
					
				} else {

					res.json({
						message: "Bad credentails!",
						status: false
					})
				}
			}
		})
	} else {
		res.status(400).json({
			message: "Bad request!",
			status: false
		})
	}
	// res.status(500).json({
	// 				message: "test"
	// })
	 
	
	
}
const changePassword = (req,res,next) => {
	const { oldpasword , newpassword, userId, INDV=false } = req.body;
	if(!(oldpasword && newpassword && userId))  {
		const err  = new Error('Bad resuest')
		next(err)
		return

	} 
	let sqlQuery
	if(INDV) {
	 	sqlQuery = `SELECT * FROM IndiGo4Student WHERE Rollno='${userId}' AND Password='${oldpasword}'`;

	} else {

	 sqlQuery = `SELECT * FROM Schools WHERE schoolsCode='${userId}' AND password='${oldpasword}'`;
	}

	connection.query(sqlQuery,function(err,result){
		if(err) {
			console.log("errr",err);
			res.json({status: false,message: "please try again"})
		} 
	
			if(result && Array.from(result) && Array.from(result).length > 0 ) {
			if(INDV) {
				sqlQuery = `UPDATE IndiGo4Student SET Password='${newpassword}' WHERE Rollno='${userId}'`;

			} else {
				sqlQuery = `UPDATE Schools SET password='${newpassword}' WHERE schoolsCode='${userId}'`;

			}
			connection.query(sqlQuery,function(err,data) {
			if(err) {
			console.log("errr",err);

				res.json({status: false,message: "please try again"})

			}
			res.json({ status: true,message:"password changed successully!"})
			})
		} else {
			res.json({ status: false, message:"bad credentails!"})

		}
		
	})

}
const forgotPassword = (req,res,next) => {
	const { email , userId } = req.body;
	if(!(email && userId ))  {
		const err  = new Error('Bad resuest')
		next(err)
		return;
	} 
	let sqlQuery = `SELECT * FROM Schools WHERE schoolsCode='${userId}' AND email='${email}'`;
	connection.query(sqlQuery,function(err,result){
		if(err) {
			console.log("errr",err);
			res.json({status: false,message: "please try again1"})
		} 
		
		if(result && Array.from(result) && Array.from(result).length > 0 ) {
			let pass = Utill.generatePassword()
			// sqlQuery = `UPDATE Schools SET password='${newpassword}' WHERE schoolsCode='${userId}'`;
			// connection.query(sqlQuery,function(err,data) {
			// if(err) {
			// console.log("errr",err);

			// 	res.json({status: false,message: "please try again"})

			// }
			// res.json({ status: true,message:"password changed successully!"})
			// })
			sendEmail('Dear User',email,{ schoolCode: userId,pass: pass });
			res.json({ status: true, message:"password sent to email please check mail box"})

		} else {
			res.json({ status: false, message:"bad credentails!"})

		}
		
	})
}
const registerIndividualStudant = async (req, res, next) => {
	let sqlQuery  = ''
	const { 
		country='',
		state='',
		mobile='',
		email='',
		ismobileVerified=false,
		isEmailVerified=false,
		isLocal,
      	stateCityCode,
      	countryCode,
      	name,
      	dob,
      	city
	} = req.body;
	 sqlQuery = `SELECT COUNT(*) AS totalRows FROM IndiGo4Student` 
	 let totalrows = 0;
	 connection.query(sqlQuery,function(err,data){
	 	if(err) {
	 		console.log("erro 00990",err)
	 	}
	 	totalrows = Array.from(data)[0].totalRows;
	 	function n(n){
		  if(n <= 9) {
		    return '000' + n
		  } if(n > 9 && n <=99) {
		    return '00' + n
		  } else if( n >= 100 && n <= 999) {
		     return '0' + n
		  } 
		  return n  
		};
		let runningNumber = n(totalrows+1)
	 	let uniqueRollCode = Utill.indStudantRollNumber(stateCityCode, countryCode, runningNumber);
		let pass = Utill.generatePassword()

	 	sqlQuery = `SELECT * FROM IndiGo4Student WHERE Email='${email}'`
		connection.query(sqlQuery,function(error,result){
		if(error){
			res.status(500).json({ status: false, message:"Please try again!"})
		} else if(Array.from(result).length === 0) {
			let pass = Utill.generatePassword();
			sqlQuery = `INSERT INTO IndiGo4Student (StudentID, IndiGO, Rollno, Password, Name, DOB, Mobile, Email, Country, State) 
											VALUES ('${runningNumber}', "SADNKS", '${uniqueRollCode}', '${pass}', '${name}', '${dob}', '${mobile}', '${email}', '${country}', '${state}')`
			connection.query(sqlQuery,function(error,response) {
				console.log("error",error)
				if(error){
					res.status(500).json({ status: false, message:"Please try again1"})
				} else {
					sendEmail(name,email,{ schoolCode: uniqueRollCode,pass: pass })
					res.status(200).json({ status: true, message:"Studant added to DB"})
				}
			})
		} else {
			res.status(200).json({ status: false, message:"Studant  is already registered"})
		}
		})
	 });
}
module.exports = {
	getAllUser,
	login,
	register,
	upDateSchool,
	changePassword,
	forgotPassword,
	registerIndividualStudant

}