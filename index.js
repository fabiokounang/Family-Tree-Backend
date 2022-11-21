const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const cors = require('cors');
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const compression = require('compression');
const mongoose = require('mongoose');

const port = process.env.PORT || 3000;

const admin = require('./routes/admin');
const user = require('./routes/user');
const bulletin = require('./routes/bulletin');
const banner = require('./routes/banner');
const theme = require('./routes/theme');
const calendar = require('./routes/calendar');
const provincecity = require('./routes/province-city');
const broadcast = require('./routes/broadcast');
const occasion = require('./routes/occasion');
const point = require('./routes/point');
const tree = require('./routes/tree');
const log = require('./routes/log');

app.enable('trust proxy');
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

app.use('/api/admin', admin);
app.use('/api/theme', theme);
app.use('/api/bulletin', bulletin);
app.use('/api/banner', banner);
app.use('/api/user', user);
app.use('/api/calendar', calendar);
app.use('/api/province_city', provincecity);
app.use('/api/broadcast', broadcast);
app.use('/api/log', log);
app.use('/api/occasion', occasion);
app.use('/api/point', point);
app.use('/api/tree', tree);

app.all('*', (req, res) => {
  res.send({
    status: false,
    data: [],
    error: [],
    pageNotFound: true
  });
});

let server;
mongoose.connect(process.env.MONGO_CONNECTION, { 
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async() => {
  console.log('Database marga is connected');
  server = app.listen(port, () => {
    console.log('Marga server is listening to port ' + port);
  });
}).catch(err => console.log('Error connecting database', err));

process.on('warning', (warning) => {
  console.log('WARNING name : ' + warning.name);
  console.warn('WARNING message : ' + warning.message);
  console.warn('WARNING stack : ' + warning.stack);
  server.close(() => {
    console.log('Server closed gracefully');
    process.exit();
  });
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION');
  console.log(err.name);
  console.log(err.message);
  server.close(() => {
    console.log('Server closed gracefully');
    process.exit();
  });
});

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION');
  console.log('NAME ' + err.name);
  console.log('MESSAGE ' + err.message);
  server.close(() => {
    console.log('Server closed gracefully');
    process.exit();
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED, shutting down gracefully');
  server.close(() => {
    console.log('Server closed gracefully');
    process.exit();
  });
});

// Tabel Parent Family Tree
// - id
// - name
// - gender
// - role

// Tabel Family Tree
// - id
// - name
// - gender
// - role
// - parentIdSuami
// - parentIdIstri


// 1. fabio
//    pria
//    suami

// 2. priska
//    wanita
//    istri

// 3. reno
//    pria
//    anak pertama dari fabio dan priska

// 4. chang
//    wanita
//    anak kedua dari fabio dan priska]
