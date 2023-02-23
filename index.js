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
const calendar = require('./routes/calendar');
const provincecity = require('./routes/province-city');
const log = require('./routes/log');
const membercard = require('./routes/membercard');

const theme = require('./routes/theme');
const broadcast = require('./routes/broadcast');
const occasion = require('./routes/occasion');
const point = require('./routes/point');
const tree = require('./routes/tree');

app.enable('trust proxy');
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

app.use('/api/admin', admin);
app.use('/api/user', user);
app.use('/api/banner', banner);
app.use('/api/bulletin', bulletin);
app.use('/api/calendar', calendar);
app.use('/api/province_city', provincecity);
app.use('/api/log', log);
app.use('/api/membercard', membercard);

app.use('/api/theme', theme);
app.use('/api/broadcast', broadcast);
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

let server = app.listen(port, () => {
  console.log('Marga server is listening to port ' + port);
}).on('error', (err) => {
  console.log('Error listening to port ' + port);
  console.log(err.name)
  console.log(err.message)
  console.log(err.stack);
});

console.log(process.env.MONGO_CONNECTION)
mongoose.connect(process.env.MONGO_CONNECTION, { 
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async() => {
  console.log('Database marga is connected');
}).catch(err => console.log('Error connecting database', err));

function close (type, err) {
  console.log(type);
  console.log('NAME ' + err.name);
  console.log('MESSAGE ' + err.message);
  console.log('MESSAGE ' + err.stack);
  server.close(() => {
    console.log('Server closed gracefully');
    process.exit(0);
  });
}

process.on('warning', (err) => {
  close('ERROR WARNING', err);
});

process.on('unhandledRejection', (err) => {
  close('UNHANDLED REJECTION', err);
});

process.on('uncaughtException', (err) => {
  close('UNCAUGHT EXCEPTION', err);
});

process.on('SIGTERM', (signal) => {
  console.log('SIGTERM RECEIVED, shutting down gracefully');
  close('SIGTERM RECEIVED', {});
});

process.on('uncaughtExceptionMonitor', (err) => {
  close('UNHANDLED REJECTION MONITOR', err);
});