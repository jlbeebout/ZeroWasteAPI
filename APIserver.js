var express = require('express');
var app = express();
var bodyParser  = require('body-parser');

// Api Router Handler
var api = express.Router();

const db = 'WebLoadDataSource';

//2017 Spring Quarter dates (approx 60 days)
//https://registrar.ucsc.edu/calendar/key-dates/index.html
const springStart = `'2017-04-03'`;
const springEnd = `'2017-06-15'`;

//2017 Fall Quarter dates
//https://registrar.ucsc.edu/calendar/archive/2016-17calendar-two-pages.pdf
const fallStart = `'2017-09-23'`;
const fallEnd = `'2017-12-15'`;

const querySpring = `SELECT * FROM ${db} WHERE PickupTime BETWEEN ${springStart} AND DATEADD(day, 1, ${springEnd}) ORDER BY PickupTime ASC`;
const queryFall = `SELECT * FROM ${db} WHERE PickupTime BETWEEN ${fallStart} AND DATEADD(day, 1, ${fallEnd}) ORDER BY PickupTime ASC`;
const queryLast100Pickups = `SELECT * FROM (SELECT TOP(100) * FROM ${db} ORDER BY PickupTime DESC) ORDER BY PickupTime ASC`;
const query1day = `SELECT * FROM ${db} WHERE PickupTime >= DATEADD(day,-1, GETDATE()) ORDER BY PickupTime ASC`;
const query15days = `SELECT * FROM ${db} WHERE PickupTime >= DATEADD(day,-15, GETDATE()) ORDER BY PickupTime ASC`;
const query30days = `SELECT * FROM ${db} WHERE PickupTime >= DATEADD(day,-30, GETDATE()) ORDER BY PickupTime ASC`;
const query45days = `SELECT * FROM ${db} WHERE PickupTime >= DATEADD(day,-45, GETDATE()) ORDER BY PickupTime ASC`;
const query60days = `SELECT * FROM ${db} WHERE PickupTime >= DATEADD(day,-60, GETDATE()) ORDER BY PickupTime ASC`;
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

const createConnectionPool = function(query) {
  return function(req, res){
    const pool = new sql.ConnectionPool(sql.config, err => {
      pool.request()
      .query(query, (error, result) => {
        // ... error checks
        res.json(result.recordset);
      });
    });
    pool.on('error', err => {
        // ... error handler
        console.log("error response");
        res.json(err);
    });
  };
};

// new sql.ConnectionPool(sql.config).connect().then(pool => {
//   return pool.query(query);
// }).then(result => {
//   console.log("success response");
//   res.json(result);
// }).catch(err => {
//   console.log("error response");
//   // res.json(err);
// });

api.get('/db', createConnectionPool(query60days));
api.get('/days/today', createConnectionPool(query1day));
api.get('/days/15', createConnectionPool(query15days));
api.get('/days/30', createConnectionPool(query30days));
api.get('/days/45', createConnectionPool(query45days));
api.get('/days/60', createConnectionPool(query60days));
api.get('/2017/fall', createConnectionPool(queryFall));
api.get('/2017/spring', createConnectionPool(querySpring));

app.get('/', function(req, res){
  res.send("Zero Waste Api 1.0.0");
});

app.use('/api', api);
console.log(process.env);
app.listen(3001);
