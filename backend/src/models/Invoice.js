const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "partial", "paid", "overdue", "cancelled"],
      default: "pending",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    items: [
      {
        description: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

invoiceSchema.virtual("remainingBalance").get(function () {
  return this.amount - this.discountAmount - this.paidAmount;
});

invoiceSchema.set("toJSON", { virtuals: true });
invoiceSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Invoice", invoiceSchema);
