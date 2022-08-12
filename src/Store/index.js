const express = require('express');
const router = express.Router();
const Store = require('../Controller/Store.Controller')
router.get('/store-list',Store.getAllInventory);
router.post('/store-update',Store.insertAndUpdate);
router.post('/store-updatev2',Store.insertAndUpdateV2);

router.get('/store-search',Store.searchProduct);
router.get('/store-get-invoice',Store.getInvoiceList);
router.post('/store-update-invoice',Store.saveInvoice);



module.exports = router;