const connection = require('../Config/connnection');


const getTotalRows  = (req,res,next) => {
		const { tableName } = req.body
		let sqlQuery = '';
		sqlQuery = `SELECT COUNT(*) AS totalRows FROM ${tableName}`; 
	 	let totalrows = 0;
	 	connection.query(sqlQuery,function(err,data){
	 	if(err) {
	 		console.log("erro 00990",err);
	 		res.status(400).json({message:"please try again!",status: false})
	 	}
	 	totalrows = Array.from(data)[0].totalRows;
	 	res.status(200).json({message:"total rows",status: true, totalRows: totalrows})

	 }) 
	
}
const getLevelFromClass = (req,res,next) => {
	const { classname } = req.body;
	let sqlQuery = '';

	sqlQuery = `SELECT Level FROM Class WHERE Classname=${classname}`;
	try {
		connection.query(sqlQuery,function(err,data){
	 	if(err) {
	 		console.log("erro 00990",err);
	 		res.status(400).json({message:"please try again!",status: false})
	 	}
		if(data) {
			let totalrows = Array.from(data);
		 	if(totalrows.length > 0) {
		 		res.status(200).json({message:"total rows",status: true, level: totalrows[0]?.Level})
		 	} else {
		 		res.status(200).json({message:"'No level found for selected class'",status: false, level: null})	
		 	} 	
		} else {
	 		res.status(400).json({message:"bad request ",status: false})
		}
	 }) 
	} catch(e) {
	 	res.status(500).json({message:"please try again",status: false})

	}
	
}
const examType = (req,res,next)  => {
	const { stuType, code } = req.body;
	let sqlQuery = '';
	if(code === "IN") {
		//FeeIN
		sqlQuery = `SELECT ExamMode FROM FeeIN WHERE SubscriberType='${stuType}'`;

	} else {
		sqlQuery = `SELECT ExamMode FROM FeeINT `;

	}
	connection.query(sqlQuery, function(err,result) {
		if(err) {
			console.log("=====rtye",err)
			res.json({
				message: "please try again later",
				status: false
			})
		} else {
			if(result && Array.isArray(result)) {
				let list =  Array.from(result);
				res.json({
					message: "Exam type listed",
					data: list,
					status: true
				})	
			} else {
				res.json({
					message: "please try again",
					status: false
				})
			}
			
		}
	})
	// sqlQuery = `SELECT Level FROM Class WHERE Classname=${classname}`;
}
module.exports = {
	getTotalRows,
	getLevelFromClass,
	examType
}