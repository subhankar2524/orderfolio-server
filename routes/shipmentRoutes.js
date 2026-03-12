const express = require("express");
const router = express.Router();

const {
  createShipment,
  updateShipmentStatus,
  updateShipmentStatusByAwb,
  getAllShipments,
  getMyShipments,
  getAssignedShipments
} = require("../controllers/shipmentController");

const { verifyToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

router.post(
  "/create",
  verifyToken,
  authorizeRoles("admin"),
  createShipment
);

router.put(
  "/update/:id",
  verifyToken,
  authorizeRoles("rider"),
  updateShipmentStatus
);

router.put(
  "/update-by-awb/:awbNumber",
  verifyToken,
  authorizeRoles("rider"),
  updateShipmentStatusByAwb
);

router.get(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  getAllShipments
);

router.get(
  "/me",
  verifyToken,
  authorizeRoles("user"),
  getMyShipments
);

router.get(
  "/assigned",
  verifyToken,
  authorizeRoles("rider"),
  getAssignedShipments
);

module.exports = router;
