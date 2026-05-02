const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const { Student } = require("../models/Student");
const { z } = require("zod");

const invoiceSchema = z.object({
  studentId: z.string(),
  title: z.string(),
  amount: z.number(),
  dueDate: z.string(), // ISO string
  items: z.array(
    z.object({
      description: z.string(),
      price: z.number(),
    })
  ),
});

exports.createInvoice = async (req, res) => {
  const validated = invoiceSchema.parse(req.body);
  
  // Find student to check for default discounts
  const student = await Student.findOne({ _id: validated.studentId });
  let discountAmount = 0;

  if (student && student.discountType !== "none") {
    if (student.discountType === "percentage") {
      discountAmount = (validated.amount * student.discountValue) / 100;
    } else if (student.discountType === "fixed") {
      discountAmount = student.discountValue;
    }
  }
  
  const invoice = await Invoice.create({
    student: validated.studentId,
    title: validated.title,
    amount: validated.amount,
    discountAmount: discountAmount,
    dueDate: new Date(validated.dueDate),
    items: validated.items,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: invoice });
};

exports.getInvoices = async (req, res) => {
  const { q, status } = req.query;
  const query = {};
  
  if (req.user.role === "student") {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ message: "Student profile not found" });
    query.student = student._id;
  } else if (q) {
    const User = require("../models/User");
    const users = await User.find({ name: { $regex: q, $options: "i" }, role: 'student' }).select("_id");
    const userIds = users.map(u => u._id);

    const students = await Student.find({
      $or: [
        { studentId: { $regex: q, $options: "i" } },
        { user: { $in: userIds } },
      ]
    }).select("_id");
    
    query.student = { $in: students.map(s => s._id) };
  }

  if (status) {
    query.status = status;
  }

  const invoices = await Invoice.find(query)
    .populate({
      path: "student",
      populate: { path: "user", select: "name" }
    })
    .sort("-createdAt");
    
  res.json({ success: true, data: invoices });
};

exports.recordPayment = async (req, res) => {
  const { invoiceId, amount, method, transactionId, date } = req.body;
  
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) return res.status(404).json({ message: "Invoice not found" });

  const payment = await Payment.create({
    invoice: invoiceId,
    student: invoice.student,
    amount: Number(amount),
    method,
    transactionId,
    date: date ? new Date(date) : Date.now(),
    createdBy: req.user._id,
  });

  // Calculate new total paid
  invoice.paidAmount = (invoice.paidAmount || 0) + Number(amount);
  
  const netAmount = invoice.amount - (invoice.discountAmount || 0);

  if (invoice.paidAmount >= netAmount) {
    invoice.status = "paid";
  } else if (invoice.paidAmount > 0) {
    invoice.status = "partial";
  }

  await invoice.save();

  res.status(201).json({ success: true, data: payment });
};

exports.getPayments = async (req, res) => {
  const query = {};
  if (req.user.role === "student") {
    const student = await Student.findOne({ user: req.user._id });
    query.student = student._id;
  }

  const payments = await Payment.find(query)
    .populate({
      path: "student",
      populate: { path: "user", select: "name" }
    })
    .populate("invoice")
    .sort("-date");

  res.json({ success: true, data: payments });
};

exports.getStats = async (req, res) => {
  const totalInvoiced = await Invoice.aggregate([{ $group: { _id: null, total: { $sum: "$amount" }, discount: { $sum: "$discountAmount" } } }]);
  const totalReceived = await Payment.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);
  
  const resInvoiced = totalInvoiced[0] || { total: 0, discount: 0 };
  const resReceived = totalReceived[0] || { total: 0 };

  const pendingAmount = resInvoiced.total - resInvoiced.discount - resReceived.total;

  res.json({
    success: true,
    data: {
      totalRevenue: resInvoiced.total - resInvoiced.discount,
      collected: resReceived.total,
      pending: pendingAmount > 0 ? pendingAmount : 0,
      collectedPercentage: resInvoiced.total > 0 ? Math.round((resReceived.total / (resInvoiced.total - resInvoiced.discount)) * 100) : 0
    }
  });
};
