const { connect, signers } = require('@hyperledger/fabric-gateway');
const grpc = require('@grpc/grpc-js');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const channelName = 'mychannel';
const chaincodeName = 'logistics';//'basic';
const mspId = 'Org1MSP';

async function newGatewayConnection() {

  const tlsCertPath = path.resolve(
    '../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem'
  );

  const tlsCert = fs.readFileSync(tlsCertPath);

  const client = new grpc.Client(
    'localhost:7051',
    grpc.credentials.createSsl(tlsCert)
  );

  const certPath = path.resolve(
    '../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts/cert.pem'
  );
//Admin@org1.example.com-cert
//../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts/Admin@org1.example.com-cert.pem
//../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts/cert.pem
  const keyPath = path.resolve(
    '../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/'
  );

  const cert = fs.readFileSync(certPath);
  const keyFiles = fs.readdirSync(keyPath);
  const key = fs.readFileSync(path.join(keyPath, keyFiles[0]));

  const identity = {
    mspId,
    credentials: cert,
  };

  const signer = signers.newPrivateKeySigner(
    crypto.createPrivateKey(key)
  );

  const gateway = connect({
    client,
    identity,
    signer,
  });

  return gateway;
}

module.exports = {
  newGatewayConnection,
  channelName,
  chaincodeName
};