'use strict';

const { Wallets, Gateway } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

async function registerUser(userId, role) {
    try {

        // Load connection profile
        const ccpPath = path.resolve(
            __dirname,
            '../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json'
        );

        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create CA client
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(
            caInfo.url,
            { trustedRoots: caTLSCACerts, verify: false },
            caInfo.caName
        );

        // Create wallet
        const walletPath = path.join(__dirname, 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        console.log(`Wallet path: ${walletPath}`);

        // Check if user already exists
        const userIdentity = await wallet.get(userId);
        if (userIdentity) {
            console.log(`User ${userId} already exists in wallet`);
            return;
        }

        // Check admin exists
        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            console.log('Admin identity not found. Run registerAdmin.js first');
            return;
        }

        // Create gateway for admin
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: 'admin',
            discovery: { enabled: true, asLocalhost: true }
        });

        const caClient = ca;
        //const adminUser = await gateway.getCurrentIdentity();
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUserContext = await provider.getUserContext(adminIdentity, 'admin');

        // const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        // const adminUserContext = await provider.getUserContext(adminIdentity, 'admin');

        // Register user with role attribute
        const secret = await caClient.register(
            {
                affiliation: 'org1.department1',
                enrollmentID: userId,
                role: 'client',
                attrs: [
                    {
                        name: 'role',
                        value: role,
                        ecert: true
                    }
                ]
            },
            adminUserContext
        );

        // Enroll user
        const enrollment = await caClient.enroll({
            enrollmentID: userId,
            enrollmentSecret: secret
        });

        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };

        await wallet.put(userId, x509Identity);

        console.log(`✅ Successfully registered user: ${userId} with role: ${role}`);

        await gateway.disconnect();

    } catch (error) {
        console.error(`❌ Error registering user: ${error}`);
    }
}

// ---- CLI Execution ----
const userId = process.argv[2];
const role = process.argv[3];

if (!userId || !role) {
    console.log("Usage: node registerUser.js <userId> <role>");
    process.exit(1);
}

registerUser(userId, role);
