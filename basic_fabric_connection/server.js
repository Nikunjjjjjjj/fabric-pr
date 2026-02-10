const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Fabric SDK imports (we will use them in next steps)
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ================================
// BASIC TEST ROUTE
// ================================

app.get('/', (req, res) => {
    res.send('🚀 Supply Chain Fabric Backend Running');
});

// ================================
// FABRIC CONNECTION HELPER
// ================================

async function connectToFabric() {
    try {
        // Load connection profile
        const ccpPath = path.resolve(__dirname, 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create wallet
        const walletPath = path.join(__dirname, 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check if admin identity exists
        const identity = await wallet.get('admin');
        if (!identity) {
            throw new Error('Admin identity not found in wallet');
        }

        // Create gateway
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: 'admin',
            discovery: { enabled: true, asLocalhost: true }
        });

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('basic');

        return { gateway, contract };

    } catch (error) {
        console.error('Fabric connection error:', error);
        throw error;
    }
}

// ================================
// CREATE ASSET API
// ================================

app.post('/createAsset', async (req, res) => {
    try {
        const { id, color, size, owner, value } = req.body;

        const { gateway, contract } = await connectToFabric();

        await contract.submitTransaction('CreateAsset', id, color, size, owner, value);

        await gateway.disconnect();

        res.json({ success: true, message: 'Asset Created' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// ================================
// GET ALL ASSETS API
// ================================

app.get('/getAllAssets', async (req, res) => {
    try {
        const { gateway, contract } = await connectToFabric();

        const result = await contract.evaluateTransaction('GetAllAssets');

        await gateway.disconnect();

        res.json(JSON.parse(result.toString()));

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// ================================
// SERVER START
// ================================

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
