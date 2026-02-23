package services

import (
	"chaincode/models"
	"chaincode/utils"
	"chaincode/validators"
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type ShipmentService struct{}

func (s *ShipmentService) CreateShipment(
	ctx contractapi.TransactionContextInterface,
	id string,
	orderID string,
	productID string,
	quantity int,
	origin string,
	destination string,
) error {

	mspID, err := utils.GetClientMSPID(ctx)
	if err != nil {
		return err
	}

	// Only Org1MSP allowed to create
	if mspID != "Org1MSP" {
		return fmt.Errorf("only manufacturer org can create shipment")
	}

	existing, err := ctx.GetStub().GetState(id)
	if err != nil {
		return err
	}
	if existing != nil {
		return fmt.Errorf("shipment already exists")
	}

	shipment := models.Shipment{
		ID:            id,
		OrderID:       orderID,
		ProductID:     productID,
		Quantity:      quantity,
		CurrentOwner:  mspID,
		CurrentStatus: "ORDER_CREATED",
		Origin:        origin,
		Destination:   destination,
		CreatedAt:     time.Now().Format(time.RFC3339),
		UpdatedAt:     time.Now().Format(time.RFC3339),
		Metadata:      map[string]string{},
		Version:       1,
	}

	bytes, err := json.Marshal(shipment)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(id, bytes)
	if err != nil {
		return err
	}

	return ctx.GetStub().SetEvent("ShipmentCreated", bytes)
}

func (s *ShipmentService) UpdateShipmentStatus(
	ctx contractapi.TransactionContextInterface,
	id string,
	newStatus string,
) error {

	data, err := ctx.GetStub().GetState(id)
	if err != nil {
		return err
	}
	if data == nil {
		return fmt.Errorf("shipment not found")
	}

	var shipment models.Shipment
	err = json.Unmarshal(data, &shipment)
	if err != nil {
		return err
	}

	// Validate transition
	err = validators.ValidateStatusTransition(shipment.CurrentStatus, newStatus)
	if err != nil {
		return err
	}

	mspID, err := utils.GetClientMSPID(ctx)
	if err != nil {
		return err
	}

	// Simple ownership guard
	if shipment.CurrentOwner != mspID {
		return fmt.Errorf("only current owner can update shipment")
	}

	shipment.CurrentStatus = newStatus
	shipment.CurrentOwner = mspID
	shipment.UpdatedAt = time.Now().Format(time.RFC3339)
	shipment.Version++

	updatedBytes, err := json.Marshal(shipment)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(id, updatedBytes)
	if err != nil {
		return err
	}

	return ctx.GetStub().SetEvent("ShipmentStatusUpdated", updatedBytes)
}
