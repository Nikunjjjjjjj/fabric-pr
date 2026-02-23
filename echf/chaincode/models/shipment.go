package models

type Shipment struct {
	ID            string            `json:"id"`
	OrderID       string            `json:"order_id"`
	ProductID     string            `json:"product_id"`
	Quantity      int               `json:"quantity"`
	CurrentOwner  string            `json:"current_owner"`
	CurrentStatus string            `json:"current_status"`
	Origin        string            `json:"origin"`
	Destination   string            `json:"destination"`
	CreatedAt     string            `json:"created_at"`
	UpdatedAt     string            `json:"updated_at"`
	Metadata      map[string]string `json:"metadata"`
	Version       int               `json:"version"`
}
