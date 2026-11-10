const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/leagues', require('./routes/leagues'));
app.use('/api/draft', require('./routes/draft'));
app.use('/api/players', require('./routes/players'));
app.use('/api/matchups', require('./routes/matchups'));
app.use('/api/standings', require('./routes/standings'));

app.get('/', (req, res) => {
  res.send('Dynasty Drafters API running');
});

const server = http.createServer(app);
require('./socket').start(server);

mongoose
  .connect(process.env.MONGO_URL || 'mongodb://localhost:27017/dynasty')
  .then(() => console.log('Mongo connected'))
  .catch((err) => console.log('Mongo error:', err.message));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('Server running on port', PORT);
});