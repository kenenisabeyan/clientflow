const express = require('express');
const { 
  getInvoices, 
  getInvoiceById, 
  createInvoice, 
  updateInvoice, 
  deleteInvoice 
} = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getInvoices)
  .post(authorize('admin'), createInvoice);

router.route('/:id')
  .get(getInvoiceById)
  .put(authorize('admin'), updateInvoice)
  .delete(authorize('admin'), deleteInvoice);

module.exports = router;
