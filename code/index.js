require('express-async-errors');
//require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const helmet = require('helmet');
const scanRouter = require('./routes/scan');
const errorHandler = require('./middlewares/errorHandler');

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error);
    throw error;
});

var httpPort = parseInt(process.env.HTTPPort);
httpPort = httpPort ? httpPort : 3380;

//const interfaces = networkInterfaces();
//console.log(JSON.stringify(interfaces, null, 4))

app.use(helmet());    //protects from security vulnerabilities
app.use(express.json());    //Body Parser
app.use(morgan('tiny'));    //Request Logger
app.use('/', scanRouter);
app.use(errorHandler);

// For Unhandled URL goes here..
app.use((req, res, next) => {
    res.status(403).json({ "message": "forbidden" })
})

app.listen(httpPort, () => {
    console.log(`Application listening on port ${httpPort}...`);
});