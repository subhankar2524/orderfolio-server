const mongoose = require("mongoose");
const Shipment = require("../models/Shipment");

exports.createShipment = async (req, res) => {
  try {

    const { awbNumber, deliveryAddress, receiverEmail, riderEmail } = req.body;

    const payload = {
      awbNumber,
      deliveryAddress,
      receiverEmail,
      riderEmail
    };

    if (mongoose.isValidObjectId(req.user?.id)) {
      payload.createdBy = req.user.id;
    }

    const shipment = await Shipment.create(payload);

    res.status(201).json({
      success: true,
      message: "Shipment created",
      shipment
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateShipmentStatus = async (req, res) => {
  try {

    const { id } = req.params;
    const { status } = req.body;

    const update = { status };
    if (mongoose.isValidObjectId(req.user?.id)) {
      update.updatedBy = req.user.id;
    }

    const shipment = await Shipment.findByIdAndUpdate(
      id,
      update,
      { new: true, runValidators: true }
    );

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    res.json({
      success: true,
      message: "Shipment updated",
      shipment
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateShipmentStatusByAwb = async (req, res) => {
  try {

    const { awbNumber } = req.params;
    const { status } = req.body;

    const update = { status };
    if (mongoose.isValidObjectId(req.user?.id)) {
      update.updatedBy = req.user.id;
    }

    const shipment = await Shipment.findOneAndUpdate(
      { awbNumber },
      update,
      { new: true, runValidators: true }
    );

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    res.json({
      success: true,
      message: "Shipment updated",
      shipment
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: shipments.length,
      shipments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyShipments = async (req, res) => {
  try {
    if (!req.user?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const shipments = await Shipment.find({
      receiverEmail: req.user.email.toLowerCase()
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: shipments.length,
      shipments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAssignedShipments = async (req, res) => {
  try {
    if (!req.user?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const shipments = await Shipment.find({
      riderEmail: req.user.email.toLowerCase()
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: shipments.length,
      shipments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
