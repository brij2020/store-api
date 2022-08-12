const connection = require('../Config/connnection')
const readXlsxFile = require('read-excel-file/node');
const xlsx =  require('node-xlsx');
const dayjs = require('dayjs')
const Utill = require('../Utill');
const axios = require("axios");


function calculateFee(data=[],id,srollNumber,totalrows,res) {
	let themeCollection = new Map([
	  ['ESD',0],
	  ['ESDGREEN',0]
	]);
	let optMock = new Map([
	  ['ESD',0],
	  ['ESDGREEN',0]
	])
	let result = []
	data.map( row => {
	  if(themeCollection.has(row[4])) {
	    themeCollection.set(row[4], themeCollection.get(row[4]) +1 )
	  }
	  if(optMock.has(row[4]) && row[5].toLowerCase() === 'yes') {
	    optMock.set(row[4], optMock.get(row[4]) +1 )
		}
		 result =   [{
		  	theme: 'ESD',
		  	totalCount: themeCollection.get('ESD'),
		  	optMock: optMock.get('ESD')
		  },
		  {
		  	theme: 'ESDGREEN',
		  	totalCount: themeCollection.get('ESDGREEN'),
		  	optMock: optMock.get('ESDGREEN')
		  },

	  ]
	})
	let sql = '';
	let country = id.split('').slice(2).slice(0,2).join('');
	if(country === 'IN') {
		sql = `SELECT * FROM FeeIN WHERE SubscriberType='SCHL' OR SubscriberType='MOCK';`

	} else {
		sql = `SELECT * FROM FeeINT `

	}
	connection.query(sql,(err,packet) => {
		if(err) {
			console.log('issue',err)
			return []
		} else {
			console.log('packet',Array.from(packet))
			let ESDFEE,ESDGREENFEE, MOCKFEE=0
			Array.from(packet).map(fee => {
				if(fee.ExamMode === 'ESD') {
					ESDFEE = fee.Fee
				} else if(fee.ExamMode === 'ESDGREEN') {
					ESDGREENFEE = fee.Fee
				} else if(fee?.SubscriberType === 'MOCK' || fee?.ExamMode === 'MOCK') {
					MOCKFEE = fee.Fee

				}
			})
			let priceCalculation = result.map(resq => {
				if(resq.theme === 'ESD') {
					resq.themefee = ESDFEE,
					resq.mockfee = MOCKFEE
				} else {
					resq.themefee = ESDGREENFEE,
					resq.mockfee = MOCKFEE
				}
				return resq
			}
			)
			/// test

			sqlQuery = `SELECT * FROM Class`;
		 	connection.query(sqlQuery, function (err,packet) {
		 		// body...
		 		if(err) {

		 		}
		 		let classLevel = Array.from(packet);
		 		let classMap = new Map();
		 		classLevel.map(cls => classMap.set(cls.Classname,cls.Level))
		 		let studantID = id.split('').slice(6).slice(0,Infinity).join('');
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
				

				let x = data.map((row,i) => {

					row.push(n(totalrows===0 ?  totalrows+1+i : totalrows+i));
					row.push(classMap.get(`${row[2]}`))
					// row[10] = classLevel[row[10]]
					return row;
				})
				// console.log(x);

				// res.json({
				// 	test: 'tets'
				// })
				// return;	
				const cb = Utill.generatePassword;
				let dbData = data.map((d,i)=> [`${id}`,`${d[6]}`,`${srollNumber}${d[6]}`,`${cb()}`,...d.slice(0,6),...d.slice(7),...Array.apply(null, Array(7)).fill(null)]);
				if(dbData.length > 0) {
					sqlQuery = `INSERT INTO InternationalStudants (SchoolID, StudentID, Rollno, Password, Name, DOB, Class, Section, ExamTheme, DemoExam,ExamLevel, ExamSlotDateTime, DemoSlotDateTime, Createdby, Createdon, Modby, Modon, paymentStatus) 
					VALUES ?`;
					connection.query(sqlQuery,[dbData] ,function(err,result) {
						
						if(err) {
							res.status(400).json({
								message: 'Please try again!',
								status: false
							})
						} else {
							res.json({
								message: 'file uploaded successfully!',
								status: true,
								data: priceCalculation
							})
						}
					})
				} 
		 	});

			//end test
			return result
			
		}
	})

	
	console.log("test data",result)
	// body...
}

const uploadStudantRecord = async(req,res,next) => {

	try {
		let  { id }  = req.params;
		let sqlQuery = ''
		// console.log('twte',schid);
		// res.json({
		// 	test:'false'
		// })
		// return;
		
		sqlQuery = `SELECT COUNT(*) AS totalRows FROM InternationalStudants`;
	 	let totalrows = 0;
	 	connection.query(sqlQuery,function(err,data){
		 	if(err) {
		 		console.log("erro 00990",err);
		 		res.status(500).json({ message : 'please try again ', status: false})
		 	}

	 		totalrows = Array.from(data)[0].totalRows;
	 		
	 		let srollNumber = Utill.studantRollNumber(id,totalrows)
	 		// console.log("InternationalStudants",totalrows)

	 		let totalData = JSON.parse(req.body.fileData);
	 		let clientData = calculateFee(totalData,id,srollNumber,totalrows,res);

			// let idArray = id.split('');
			// let countryCode = idArray.slice(2).slice(0,2).join('');
			// let citycode = idArray.slice(4).slice(0,2).join('');
			
			
	 	})

		
	} catch(e) {
		console.log('error',e)
		res.status(500).json({ status: false,message:"Please try again!"})

	}
	// res.json({ test: 'erro'})
	// const filePath = process.env.PWD +'/uploads/'+req.file.filename;
	// const workSheetsFromFile = xlsx.parse(`${filePath}`);
	// let totalData = workSheetsFromFile[0].data.filter(row => row.length > 0);
	
	// totalData.shift();
	// let dbData = totalData.map(d => [null,null,null,null,...d,...Array.apply(null, Array(7)).fill(null)]);
    // let correctData = dbData.map((exData, i) => [...exData.slice(0,5),dayjs(Utill.ExcelDateToJSDate(exData[5])).format('YYYY-MM-DD'),...exData.slice(6,20)]);
	
	
}

const getStudantData = (req,res,next) =>{
	let sqlQuery = '';
	let { SchoolID } = req.body;
	sqlQuery = `SELECT Name, DOB, Class, Section, ExamTheme, DemoExam FROM InternationalStudants WHERE SchoolID='${SchoolID}'`;
	connection.query(sqlQuery,function(err,result){
		if(err) {
			console.log('Error',err);
			res.json({
				status: false,
				message: "please try again!"
			})
		} else {
			res.json({
				data: result,
				status: true,
				message: "data fetched successfully!"
			})
		}
	})
}
const updatePaymentStatus = (req,res,next) => {
	let sqlQuery = '';
	let { SchoolID,isINDV= false } = req.body;
	if(isINDV) {
		sqlQuery = `UPDATE IndiGo4Student SET paymentStatus = true WHERE Rollno ='${SchoolID}'`;

	} else {
	sqlQuery = `UPDATE InternationalStudants SET paymentStatus = true WHERE SchoolID ='${SchoolID}'`;

	}
	connection.query(sqlQuery,function(err,result){
		if(err) {

			console.log('Error',err);
			res.json({
				status: false,
				message: "please try again!"
			})
		} else {
			res.json({
				data: result,
				status: true,
				message: "paymentStatus changhed for studants"
			})
		}
	})
}
const upadateStudantTableSlots = (req,res,next) =>{
	let sqlQuery = '';
	let { SchoolID, timing } = req.body;
	let timeESD = '';
	let timeESDGREEN = '';
	let timeESDMOCK = ''
	let ESDTheme = ''
	let ESDGREENTheme = ''
	let isMOCK = 'NO'
	let total = 0
	timing.map(t => {
		
		total = total + t?.seatCount;
		if(t?.theme ==="ESD") {
			timeESD = t?.time;
			ESDTheme = 'ESD'
		} else if(t?.theme === "ESDGREEN") {
			timeESDGREEN = t?.time;
			ESDGREENTheme = 'ESDGREEN'
		} 
	
		if(t?.theme == "MOCK") {
			timeESDMOCK = t?.time
			isMOCK  = 'YES'
		}
	})

	

	sqlQuery  = `
				UPDATE InternationalStudants SET ExamSlotDateTime = (CASE 
					WHEN ExamTheme='${ESDTheme}' AND ExamSlotDateTime IS NULL THEN '${timeESD}' 
					WHEN ExamTheme = '${ESDGREENTheme}' AND ExamSlotDateTime IS NULL THEN '${timeESDGREEN}' 
					ELSE ExamSlotDateTime END),
					DemoSlotDateTime =(CASE WHEN DemoExam = '${isMOCK}' AND DemoSlotDateTime IS NULL THEN '${timeESDMOCK}' 
					ELSE DemoSlotDateTime END ) 
					WHERE SchoolID = '${SchoolID}' AND paymentStatus=true;`

	connection.query(sqlQuery,async function(err,result){

		if(err) {
			console.log('Error',err);

			res.json({
				status: false,
				message: "please try again!"
			})
		} else {
			try {
				const da = await axios.post(`${Utill.APP_BASE_URL}/update-slot`,{timing:timing})	

			} catch(e) {
				console.log(e,'Errror')
				res.json({
					message:"please try again",
					status: false
				})
			}
			
			res.json({
				data: result,
				status: true,
				message: "paymentStatus changhed for studants"
			})
		}
	})
}
const getStudantFormStatus = (req,res,next) => {
	const { SchoolID } = req.body;
	let sqlQuery = '';
	sqlQuery = `SELECT Name, DOB, Class, Section, ExamLevel, ExamTheme, DemoExam, ExamSlotDateTime, DemoSlotDateTime,Rollno, paymentStatus FROM InternationalStudants
	WHERE SchoolID='${SchoolID}'`;
	connection.query(sqlQuery,async function(err,result){
		if(err) {
			console.log(`Error in `,err)
		} 
		res.json({
			data: result,
			status: true,
			message: "Studants fetched successfully!"
		})
	})
}
const updateIndiStudantData = (req,res,next) => {
	try {
		const {
			  ExamLevel = null,
		      Gender =  null,
		      School = null,
		      Section = null,
		      stuStd = null,
		      pin = null,
		      Pgname = null,
		      Pgemail = null,
		      Pgmobile = null,
		      examTheme=null,
		      studantRoll=null,
		      isoptMock= null,
		      Address=null
		 } = req.body;
		 let sqlQuery = '';
		 sqlQuery = `UPDATE IndiGo4Student SET 
						Address='${Address}',	
						School='${School}',
						Class='${stuStd}',
						Section	= '${Section}',
						Pgname	= '${Pgname}',
						Pgemail	= '${Pgemail}',
						Pgmobile= '${Pgmobile}',	
						ExamLevel= '${ExamLevel}',	
						ExamTheme='${examTheme}',
						DemoExam='${isoptMock}',
						Gender='${Gender}'
						WHERE Rollno = '${studantRoll}'
						`
			connection.query(sqlQuery,async function(err,result) {
			if(err) {
				console.log(err)
				res.json({
				message:" please try again",
				data: [],
				status: false
			})
			}
			
			const payLoad = {
			    "examTheme": examTheme,
			    "SubscriberType":"INDV",
			    "code":studantRoll?.split('')?.slice(2,4).join(''),
			    "isMock": isoptMock
			} 
			try {
				const paymentStatus = await axios.post(`${Utill.APP_BASE_URL}/get-indiv-payment`,payLoad)
					
				if(paymentStatus && paymentStatus?.data && paymentStatus?.data?.status) {
					res.json({
					message:" data updated successfully!",
					data: { ...paymentStatus?.data,...{examTheme:examTheme,ExamLevel: ExamLevel, isDemo:isoptMock, studantRoll: studantRoll }},
					status: true
				})
				} else {
					res.json({
					message:" payment calculation error",
					data: [],
					status: false
				})
				}
			} catch(e) {
				console.log("e",e)
				next(new Error('Some thing bad happen'))
				res.json({
					message:" please try again",
					data: [],
					status: false
				})
			}
			res.json({
				message:"true",
				status: true
			})
			
		})


	} catch(e) {
		console.log("eeror",e)
		res.json({
				message:" please try again",
				data: [],
				status: false
			})
		

	}
	//res.json({ test : 'on going '})
}
const getIdiviPayment = (req,res,next) => {
	const { examTheme, code, isMock, SubscriberType } = req.body;
	
	let sqlQuery = '';
	if(code === "IN") {
		sqlQuery = `SELECT * FROM FeeIN`

	} else {
		sqlQuery = `SELECT * FROM FeeINT`
	}
		try {
			connection.query(sqlQuery, function(err,result) {
		if(err) {
			
			res.json({ message: "please try again ", status: false})
		}
		let total = 0
		const feeData = Array.from(result);
		if(code === "IN")  {
			feeData.map(p => {
			    
			    if(p.SubscriberType === SubscriberType && p.ExamMode === examTheme ) {
			        total = total + p.Fee;
			    }
			    if(isMock && p.SubscriberType === "MOCK") {
			        total = total + p.Fee;
			    }
			    
			})
		} else {
			feeData.map(p => {
				if(p.ExamMode === examTheme) {
					total = p.Fee + total;
				}
				if(isMock && p.ExamMode === "MOCK") {
					total = p.Fee + total;

				}
			})
		}
		
		res.json({
			message: "total fee calculated !",
			total: total,
			status: true,
			currency: code === "IN" ? "INR" :"$"
			})
		})
		} catch(e) {
			res.json({
				message: "please try again!",
				status: false
			})
		}
		
}
const updateStudantWithTime = (req,res,next) => {
	
	const { rollID, time } = req.body;
	let sqlQuery = '';
	let timeESD = '';
	let timeESDGREEN = '';
	let timeESDMOCK = ''
	let ESDTheme = ''
	let ESDGREENTheme = ''
	let isMOCK = 'NO'
	let total = 0
	time.map(t => {
		
		total = total + t?.seatCount;
		if(t?.theme ==="ESD") {
			timeESD = t?.time;
			ESDTheme = 'ESD'
		} else if(t?.theme === "ESDGREEN") {
			timeESDGREEN = t?.time;
			ESDGREENTheme = 'ESDGREEN'
		} 
	
		if(t?.theme == "MOCK") {
			timeESDMOCK = t?.time
			isMOCK  = 'YES'
		}
	})
	if(time.length <=0 ) {
		res.json({
			message:"please check seat availbility!",
			status: false
		})
	}
	

	sqlQuery  = `UPDATE IndiGo4Student SET ExamSlotDateTime = (CASE 
					WHEN ExamTheme='${ESDTheme}' AND ExamSlotDateTime IS NULL THEN '${timeESD}' 
					WHEN ExamTheme = '${ESDGREENTheme}' AND DemoSlotDateTime IS NULL THEN '${timeESDGREEN}' 
					ELSE ExamSlotDateTime END),
					DemoSlotDateTime =(CASE WHEN DemoExam = '${isMOCK ? "1" :"0"}' AND DemoSlotDateTime IS NULL THEN '${timeESDMOCK}' 
					ELSE DemoSlotDateTime END ) 
					WHERE Rollno = '${rollID}' AND paymentStatus=true;`
				connection.query(sqlQuery, async function(err,result) {
				try {
					
					const da = await axios.post(`${Utill.APP_BASE_URL}/update-slot`,{timing:time});
					if(da && da?.data && da.data.status) {
						res.json({
							message:"update done",
							status: true
						})
					} else {
						res.json({
							message: da.data.message,
							status: false
						})
					}
					} catch(e) {
						console.log(e,'Errror')
						res.json({
							message:"please try again",
							status: false
						})
					}

			})
			

}
const registerIndividualStudant = (req,res,next) => {

}

module.exports = {
	uploadStudantRecord,
	getStudantData,
	updatePaymentStatus,
	upadateStudantTableSlots,
	getStudantFormStatus,
	updateIndiStudantData,
	getIdiviPayment,
	updateStudantWithTime

}