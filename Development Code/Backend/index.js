const express = require('express');
const app = express();
const port = 3001;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hospital & Medicine Services Backend is running!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
