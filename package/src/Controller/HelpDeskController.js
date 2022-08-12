const connection = require('../Config/connnection');
const axios = require("axios");
const Utill = require('../Utill');
const dayjs = require('dayjs')
const getCategory = (req,res,next) => {
	let sqlQuery = `SELECT * FROM HelpCategory`;
	// connection.connect(function(err){})
	try {
		connection.query(sqlQuery, function(error, results, fields) {
			// connection.end();
			if(error){
				res.status(500).json({ status: false, message:"please try again"})
			} else {
				res.json({ status: true,message:"all HelpCategory listed  ", list: Array.from(results).filter(n => n.Name !== "") })
			}
		})
		} catch(e) {
			// connection.end();
			res.status(500).json({ status: false, message:"please try again"})
	}
}
const createTicket = async (req,res,next) => {
	console.log('file',req.file)
	let sqlQuery = `SELECT * FROM HelpCategory`;
	let { category, message, subject, registrationNumber=null, ticket_date} = req.body;
	try {
		const data = await axios.post(`${Utill.APP_BASE_URL}/get-row-count`,{ tableName: 'HelpDeskTickets' });
	
		if(data && data?.data?.status) {
			connection.query(sqlQuery, function async (error, results, fields) {
			
			if(error){
				
				res.status(500).json({ status: false, message:"please try again"})
			} else {
				function n(n){
				  if(n <= 9) {
				    return '000' + n
				  } if(n > 9 && n <=99) {
				    return '00' + n
				  } else if( n >= 100 && n <= 999) {
				     return '0' + n
				  } 
				  return n  
				}
				let helpDeskID = "HELPDESK" + n(data.data.totalRows + 1 );

				sqlQuery = `INSERT INTO HelpDeskTickets (helpdeskTicketId, category, message, status, subject, registrationNumber, ticket_date,replyDate) 
				VALUES ('${helpDeskID}', "${category}", "${message}", 'open', "${subject}", '${registrationNumber}', '${ticket_date}','${new Date().toDateString()}')`
				connection.query(sqlQuery,async function(err,reslut) {
					if(err) {
						console.log("Error",err);
						res.json({
							status: false,
							message: "please try again"
						})
					}
					try {
							const saveQueryResponse = await axios.post(`${Utill.APP_BASE_URL}/submit-query-response`,{
												 	"helpdeskTicketId":helpDeskID,
												    "query": message,
												    "replay":"",
												    "status":"open",
												    "submitedBy": registrationNumber
												})
					console.log('saveQueryResponse',saveQueryResponse)
					res.json({
						status: true,
						message: "ticket is created",
					})
					} catch(e) {
						console.log("Error submit queyr",e)
						res.status(500).json({
							status: false,
							message:"please try again!"
						})
					}
					
					
				})
			}
			})
		} else {
			res.status(500).json({ status: false, message:"please try again"})
		}
		
	} catch(e) {
		console.log("====test",e)
		res.status(500).json({ status: false, message:"please try again"})
	}

}
const getTicketsById = (req,res,next) => {
	let sqlQuery = '';

	try {
		let { id='' }  = req.body
		if(id === '' || !id ) {
			const Er = Error('Bad request !');
			next(Er);
			return
		}

		sqlQuery =`SELECT * FROM HelpDeskTickets WHERE registrationNumber='${id}';`
		connection.query(sqlQuery, function (err,result) {
			if(err) {
				res.status(400).json({ status: false,message:"please try again"})
			}
			if(Array.from(result).length > 0 ) {
				res.status(200).json({
					status: true,
					list: Array.from(result)
				})
			} else {
				res.status(200).json({
					status: false,
					message:" no ticket found for this id"
				})
			}
		})


	} catch(e) {
		res.status(500).json({
			status: false,
			message: "pelase try again!"
		})
	}
}
const saveQueryResponse = (req,res,next) => {
	let sqlQuery = '';
	let currentTime = dayjs(new Date()).format('YYYY-MM-DD HH:mm');
	if(typeof req.body !== 'undefined') {
		const {
			helpdeskTicketId,query,replay,status,submitedBy
		}  = req.body
		if(!(helpdeskTicketId)) {
			res.status(400).json({ status: false,message:"bad request"})
		}
		sqlQuery = `SELECT EXISTS(SELECT * FROM HelpDeskTickets WHERE helpdeskTicketId = '${helpdeskTicketId}') AS isTicketFound`
		connection.query(sqlQuery,function(error,isHelpDeskID) {
			if(error) {
				res.status(400).json({ status: false,message:"bad request"});
				return;
			}
			if(Array.isArray(isHelpDeskID) && isHelpDeskID.length > 0 && Array.from(isHelpDeskID)[0].isTicketFound === 1) {
				sqlQuery =`INSERT INTO QueryResponse (id, helpdeskTicketId, query, replay, status, Date, submitedBy) 
				VALUES (NULL, '${helpdeskTicketId}', '${query}', '${replay}', '0', '${currentTime}','${submitedBy}');`
				connection.query(sqlQuery,function(err,result) {
					console.log(err)
					if(err) {
						console.log('Error in save query ',err);
						res.status(400).json({
							message: "bad request",
							status: false
						})
						return
					}
					res.json({status:true,message: "query | response submitted!"})
				})
			} else {
					res.json({status:false,message: "ticket id not exist"})

			}
			
		})
		

	} else {
		res.status(500).json({status:false,message: "please try again"})

	}


	



}
const changeTicketStatus = (req, res, next) => {

	const { isAdmin='', status='', helpdeskTicketId='', registrationNumber = 'ADMIN' } = req.body;
	let sqlQuery = ''
	if(isAdmin === '' || status === '' || helpdeskTicketId === '' ) {
		res.status(400).json({ status: false, message:"bad request"})
	} else {
		if(isAdmin === 'YES') {
			sqlQuery = `UPDATE HelpDeskTickets SET status='${status}' WHERE helpdeskTicketId='${helpdeskTicketId}'`

		} else if( registrationNumber !== '') {

			sqlQuery = `UPDATE HelpDeskTickets SET status='${status}' WHERE helpdeskTicketId='${helpdeskTicketId}' AND registrationNumber='${registrationNumber}'`

		}  else {
			return res.status(400).json({ status: false, message:"bad request"})
		}
		try {
			connection.query(sqlQuery,function (error,result) {
				if(error) {
					console.log('Error in updating table ');
					res.json({ status: false, message:"please try again"})
				}
				
				if(typeof result.affectedRows !== "undefined" && result.affectedRows > 0) {
					res.json({message: 'ticket status changed',status: true})
				} else {
					res.json({message: 'ticket status could not be changed',status: false})
				}
				

			})

		} catch(e) {
			res.json({
				status: false,
				message: 'Please try again'
			})
			console.log(`Error is happened `, e)
		}
		
	}

}
const getTicketHistory = (req,res,nxet) =>{
	const { helpdeskTicketId }  = req.body;
	let sqlQuery = ''
	sqlQuery = `SELECT * FROM QueryResponse WHERE helpdeskTicketId = '${helpdeskTicketId}' ORDER BY Date`;
	connection.query(sqlQuery,function(err,result) {
		if(err){
			res.json({ status: false,message: 'Bad credentails!'})
			return
		} 
		if(Array.from(result).length > 0 ){
			res.json({ status: true, message:"tickets listed",list: Array.from(result)})
			return

		} else {
			res.json({ status: true, message:"tickets list is empty"})
			return
		}

	})

}

module.exports = {
	getCategory,
	createTicket,
	getTicketsById,
	changeTicketStatus,
	saveQueryResponse,
	getTicketHistory
	

}
 