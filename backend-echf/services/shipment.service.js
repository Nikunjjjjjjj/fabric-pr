const { newGatewayConnection, channelName, chaincodeName } = require('../config/connection');

async function createShipment(data) {

  const gateway = await newGatewayConnection();
  const network = gateway.getNetwork(channelName);
  const contract = network.getContract(chaincodeName);

  const result = await contract.submitTransaction(
    'CreateShipment',
    data.id,
    data.orderID,
    data.productID,
    data.quantity.toString(),
    data.origin,
    data.destination
  );

  await gateway.close();
  console.log(result.toString())
  return result.toString();
}
// //peer chaincode invoke \
// -o localhost:7050 \
// --ordererTLSHostnameOverride orderer.example.com \
// --tls \
// --cafile $ORDERER_CA \
// -C mychannel \
// -n basic \
// --peerAddresses $CORE_PEER_ADDRESS \
// --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE \
// --waitForEvent \
// -c '{"Args":["UpdateShipmentStatus","SHIP10","PICKED_UP"]}'
module.exports = { createShipment };