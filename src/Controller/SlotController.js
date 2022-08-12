const connection = require('../Config/connnection')
const getSlots = (req,res,next) => {
	let sqlQuery = `SELECT * FROM Slot`;
	// connection.connect(function(err){})
	try {
		connection.query(sqlQuery, function(error, results, fields) {
			// connection.end();
			if(error){
				res.status(500).json({ status: false, message:"please try again"})
			} else {
				res.json({ status: true,message:"all time slots  ", list: Array.from(results) })
			}
		})
		} catch(e) {
			// connection.end();
			res.status(500).json({ status: false, message:"please try again"})
	}
}
const AllotSlots = (req,res,next) => {
	let sqlQuery = '';
	try{

		
	}catch(e){
		res.status(500).json({
			status:false,
			message: "please try again !"
		})
	}
}
const updateSlot = (req,res,next) => {  
	
	let ids = [-1,-2,-3];  
	let mp = new Map();
	let d_ = req.body.timing;
	d_.map(s => mp.set(s.slotID,s.seatCount))
	d_.map((s,i) => { ids[i] = s?.slotID } );
	let isAvailable = true; 
	
	 sqlQuery = `SELECT SlotID,TotalSeat, SeatAvailable FROM Slot`;
	 connection.query(sqlQuery,function(er,result) {
	 	if(er) {
	 		console.log("tests",er)
	 	} else {
	 		let totalArray = Array.from(result);
	 		totalArray.map(to => {
	 			if(mp.has(to.SlotID)) {
	 				if(to.SeatAvailable - mp.get(to.SlotID) < 0) {
						isAvailable = false;
	 				}
	 				mp.set(to.SlotID,to.SeatAvailable - mp.get(to.SlotID))
	 			} else {

	 			}
	 		})
	 	
	 		sqlQuery = `UPDATE Slot
					SET SeatAvailable = CASE WHEN SlotID = "${ids[0]}" THEN ${mp.get(ids[0]) ?? null} 
      					WHEN SlotID = "${ids[1]}" THEN ${mp.get(ids[1]) ?? null}
      					WHEN SlotID = "${ids[2]}" THEN ${mp.get(ids[2]) ?? null}
      					ELSE SeatAvailable
 					END
			`;
	 	
			if(!isAvailable) {
				res.json({ status: false, message:"please check seat availbility " });
				return
			}
			try {
				connection.query(sqlQuery, function(error, results, fields) {
					
					if(error){
						console.log("erro",error)
						res.status(500).json({ status: false, message:"please try again"})
					} else {
						res.json({ status: true,message:"all time slots  ", list: Array.from(results) })
					}
				})
				} catch(e) {
				console.log("erro",error)
				res.status(500).json({ status: false, message:"please try again"})
			}

	 	}
	 })
	
	 
}
module.exports = {
	getSlots,
	updateSlot
}