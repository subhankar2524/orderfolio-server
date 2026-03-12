const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema(
  {
    awbNumber: {
      type: String,
      required: true,
      unique: true
    },

    deliveryAddress: {
      type: String,
      required: true
    },

    receiverEmail: {
      type: String,
      required: true
    },

    riderEmail: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: [
        "created",
        "picked",
        "in_transit",
        "out_for_delivery",
        "delivered"
      ],
      default: "created"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shipment", shipmentSchema);
