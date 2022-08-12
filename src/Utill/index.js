const LEVEL_0 = "GO";
let LEVEL_1 = "IN";
let LEVEL_2 = '';
let LEVEL_3 = ''
const APP_BASE_URL = 'http://localhost:3001/api';
const APP_BASE_URL_V = 'http://localhost:3001';

const UPLOAD_URL = 'http://localhost:3001'

const schoolCodeGen = (isLocal,stateCityCode,totalRow, countryCode) => {
	if(parseInt(stateCityCode) && stateCityCode < 10) {
		LEVEL_2 = `0${stateCityCode}`
	} else {
		LEVEL_2 = `${stateCityCode}`
	}

	let digitLen = `${totalRow + 1}`.length;
	totalRow = parseInt(totalRow) + 1;
	if(digitLen == 1) {
		LEVEL_3 = `000${totalRow}`
	} else if(digitLen === 2 ) {
		LEVEL_3 = `00${totalRow}`

	} else if(digitLen === 3 ) {
		LEVEL_3 = `0${totalRow}`
	} else if(digitLen > 3) {
		LEVEL_3 = totalRow;
	}
	if(!isLocal) {
		LEVEL_1 = countryCode;
	} else {
		LEVEL_1 = "IN";
	}
	return LEVEL_0 + LEVEL_1 + LEVEL_2 + LEVEL_3;
}


const studantRollNumber = (id,totalRow) => {
	let idArray = id.split('');
	let countryCode = idArray.slice(2).slice(0,2).join('');
	let citycode = idArray.slice(4).slice(0,2).join('');
	let studantID = idArray.slice(6).slice(0,Infinity).join('');
	let year = new Date().getFullYear().toString().substr(2,2);
	let staticRoll = countryCode + year + citycode + studantID;
	return staticRoll;
}

const generatePassword = () =>{
	var chars = "0123456789abcdefghijklmnopqrstuvwxyz@#$%^&ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	 var passwordLength = 8;
	 var password = "";
	 for (var i = 0; i <= passwordLength; i++) {
   var randomNumber = Math.floor(Math.random() * chars.length);
   password += chars.substring(randomNumber, randomNumber +1);
  }
  return password
}
function ExcelDateToJSDate(serial) {
   console.log('serial',serial)
   var utc_days  = Math.floor(serial - 25569);
   var utc_value = utc_days * 86400;                                        
   var date_info = new Date(utc_value * 1000);

   var fractional_day = serial - Math.floor(serial) + 0.0000001;

   var total_seconds = Math.floor(86400 * fractional_day);

   var seconds = total_seconds % 60;

   total_seconds -= seconds;

   var hours = Math.floor(total_seconds / (60 * 60));
   var minutes = Math.floor(total_seconds / 60) % 60;

   return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
}

const FIRST = 'GO';
const THIRD = new Date().getFullYear().toString().substr(2,2);
const FIVE = '9999';
const FOURTH =''
const indStudantRollNumber = (stateCode, countryCode,running) => {
	let lev = ''
	if(parseInt(stateCode) && stateCode < 10) {
		lev = `0${stateCode}`
	} else {
		lev = `${stateCode}`
	}
	const SECOND = countryCode;
	const FOURTH = lev;
	return FIRST + SECOND + THIRD + FOURTH + FIVE + running;
}
module.exports = {
	schoolCodeGen,
	generatePassword,
	ExcelDateToJSDate,
	studantRollNumber,
	APP_BASE_URL,
	indStudantRollNumber,
	UPLOAD_URL
}