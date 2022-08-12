const express = require('express');
const router = express.Router();

const Static = require('../Controller/Static')
const StudantController = require('../Controller/StudantController')
const FileController = require('../Controller/FileController')
const SlotController = require('../Controller/SlotController')
const HelpDeskController = require('../Controller/HelpDeskController')
const CommonController = require('../Controller/CommonController')
router.get('/country',Static.getCountry);
router.get('/indian-state',Static.getIndianState);
router.post('/search-indian-school',Static.searchSchool);
router.get('/international-cities',Static.getINternationalCity);
router.get('/international-cities',Static.getINternationalCity);
router.post('/search-international-school',Static.searchInterNationSchool);
router.post('/school-detail',Static.schoolDetail);
router.post('/upload/:id',StudantController.uploadStudantRecord);
router.post('/get-studant', StudantController.getStudantData);
router.post('/update-payment',StudantController.updatePaymentStatus);
router.post('/update-studant-slot',StudantController.upadateStudantTableSlots);
router.post('/get-studant-status',StudantController.getStudantFormStatus);
router.post('/update-indivi-studant',StudantController.updateIndiStudantData);
router.post('/get-indiv-payment',StudantController.getIdiviPayment);
router.post('/book-indv-studant-slot',StudantController.updateStudantWithTime)
router.post('/get-slot',SlotController.getSlots);
router.post('/update-slot',SlotController.updateSlot);
router.post('/get-row-count',CommonController.getTotalRows)
router.post('/get-level',CommonController.getLevelFromClass)
router.post('/get-examp-type',CommonController.examType);

router.get('/get-category',HelpDeskController.getCategory);
router.post('/create-help-ticket',HelpDeskController.createTicket);
router.post('/upload',FileController.uploadDB,HelpDeskController.createTicket);
router.post('/get-ticket-by-id',HelpDeskController.getTicketsById);
router.post('/change-ticket-status',HelpDeskController.changeTicketStatus);
router.post('/submit-query-response',HelpDeskController.saveQueryResponse);
router.post('/get-ticket-history',HelpDeskController.getTicketHistory)





router.get('/',(req,res,next) =>{
	res.send("tetsing ")
})
router.get('/',(req,res,next) =>{
	res.send("tetsing ")
})






module.exports = router;