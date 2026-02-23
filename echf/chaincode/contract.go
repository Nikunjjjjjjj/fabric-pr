// package chaincode

//	type ShipmentContract struct {
//	    contractapi.Contract
//	}
package main

import (
	"chaincode/services"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type ShipmentContract struct {
	contractapi.Contract
}

var shipmentService = new(services.ShipmentService)

func (c *ShipmentContract) CreateShipment(
	ctx contractapi.TransactionContextInterface,
	id string,
	orderID string,
	productID string,
	quantity int,
	origin string,
	destination string,
) error {
	return shipmentService.CreateShipment(ctx, id, orderID, productID, quantity, origin, destination)
}

func (c *ShipmentContract) UpdateShipmentStatus(
	ctx contractapi.TransactionContextInterface,
	id string,
	newStatus string,
) error {
	return shipmentService.UpdateShipmentStatus(ctx, id, newStatus)
}

func main() {
	chaincode, err := contractapi.NewChaincode(new(ShipmentContract))
	if err != nil {
		panic(err.Error())
	}

	if err := chaincode.Start(); err != nil {
		panic(err.Error())
	}
}
