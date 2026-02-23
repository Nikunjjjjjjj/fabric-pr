package validators

import "fmt"

var allowedTransitions = map[string][]string{
	"ORDER_CREATED":    {"PACKED"},
	"PACKED":           {"SHIPPED"},
	"SHIPPED":          {"IN_TRANSIT"},
	"IN_TRANSIT":       {"IN_WAREHOUSE"},
	"IN_WAREHOUSE":     {"OUT_FOR_DELIVERY"},
	"OUT_FOR_DELIVERY": {"DELIVERED"},
}

func ValidateStatusTransition(oldStatus, newStatus string) error {

	allowed, exists := allowedTransitions[oldStatus]
	if !exists {
		return fmt.Errorf("invalid current status: %s", oldStatus)
	}

	for _, status := range allowed {
		if status == newStatus {
			return nil
		}
	}

	return fmt.Errorf("illegal status transition from %s to %s", oldStatus, newStatus)
}
