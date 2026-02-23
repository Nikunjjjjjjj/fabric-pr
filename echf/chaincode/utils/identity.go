package utils

import (
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func GetClientMSPID(ctx contractapi.TransactionContextInterface) (string, error) {

	mspID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return "", fmt.Errorf("failed to get MSP ID: %v", err)
	}

	return mspID, nil
}
