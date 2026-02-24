const express = require('express');
const { createShipment } = require('../services/shipment.service');

const router = express.Router();

router.post('/shipment', async (req, res) => {
  try {
    const result = await createShipment(req.body);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/shipments/:id/status", async (req, res) => {
    const { id } = req.params;
    const { newStatus, org } = req.body;

    try {
        const identity = org === "Org2MSP"
            ? "org2admin"
            : "org1admin";

        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity,
            discovery: { enabled: true, asLocalhost: true }
        });

        const network = await gateway.getNetwork("mychannel");
        const contract = network.getContract("basic");

        await contract.submitTransaction(
            "UpdateShipmentStatus",
            id,
            newStatus
        );

        res.json({ success: true });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;