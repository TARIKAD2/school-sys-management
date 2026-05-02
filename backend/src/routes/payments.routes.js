const express = require("express");
const router = express.Router();
const paymentsController = require("../controllers/payments.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth);

router
  .route("/invoices")
  .get(paymentsController.getInvoices)
  .post(requireRole("admin", "secretary"), paymentsController.createInvoice);

router
  .route("/record")
  .post(requireRole("admin", "secretary"), paymentsController.recordPayment);

router
  .route("/stats")
  .get(requireRole("admin", "secretary"), paymentsController.getStats);

router
  .route("/")
  .get(paymentsController.getPayments);

module.exports = router;
