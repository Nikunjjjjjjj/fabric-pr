const express = require('express');
const shipmentRoutes = require('./routes/shipment.routes');

const app = express();
app.use(express.json());
app.use('/api', shipmentRoutes);

app.listen(3000, () => {
  console.log('Backend running on port 3000');
});