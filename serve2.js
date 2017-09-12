var express = require('express');
var app = express();
var bodyParser  = require('body-parser');

// Api Router Handler
var api = express.Router();

const db = 'WebLoadDataSource';
// const db2 = 'ExportLoadData';

//2017 Spring Quarter dates (approx 60 days)
//https://registrar.ucsc.edu/calendar/key-dates/index.html
const springStart = `'2017-04-03'`;
const springEnd = `'2017-06-15'`;

//2017 Fall Quarter dates
//https://registrar.ucsc.edu/calendar/archive/2016-17calendar-two-pages.pdf
const fallStart = `'2017-08-23'`;
const fallEnd = `'2017-12-15'`;

const querySpring = `SELECT * FROM ${db} WHERE PickupTime BETWEEN ${springStart} AND ${springEnd} ORDER BY PickupTime ASC`;
const queryFall = `SELECT * FROM ${db} WHERE PickupTime BETWEEN ${fallStart} AND ${fallEnd} ORDER BY PickupTime ASC`;
const query30days = `SELECT * FROM ${db} WHERE PickupTime >= DATEADD(day,-30, GETDATE()) ORDER BY PickupTime ASC`;
const query45days = `SELECT * FROM ${db} WHERE PickupTime >= DATEADD(day,-45, GETDATE()) ORDER BY PickupTime ASC`;
const query60days = `SELECT * FROM ${db} WHERE PickupTime >= DATEADD(day,-60, GETDATE()) ORDER BY PickupTime ASC`;
// const queryFall = `SELECT * FROM ${db} WHERE PickupTime >= ${fallStart} ORDER BY PickupTime ASC`;
// const sqlQuery = `SELECT * FROM (SELECT *, ROW_NUMBER() OVER (ORDER BY Record DESC) as row FROM ${db1}) a WHERE PickupTime >= DATEADD(day,-30, GETDATE())`;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var sql = require("mssql");
sql.config = {
  server: process.env.MSSQL_IP,
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASS,
  database: process.env.MSSQL_DATABASE
};

const createPools = function(query) {
  return function(req, res){
    const pool1 = new sql.ConnectionPool(sql.config, err => {
      pool1.request() // or: new sql.Request(pool1)
      .query(query, (error, result) => {
          res.json(result);
        });
    });
    const pool2 = new sql.ConnectionPool(sql.config, err => {
        pool2.request() // or: new sql.Request(pool2)
        .query(query, (error, result) => {
      // ... error checks
      });
    });
  };
};

api.get('/db', createPools(query60days));
api.get('/2017/fall', createPools(queryFall));
api.get('/2017/spring', createPools(querySpring));

app.get('/', function(req, res){
  res.send("Zero Waste Api 1.0.0");
});

app.use('/api', api);
console.log(process.env);
app.listen(3001);