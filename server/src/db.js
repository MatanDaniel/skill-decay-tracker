//Role: Database connection module.
//Creates a PostgreSQL client/pool
//Exports a query() function you can use everywhere
//Goal: all DB connection logic is in one place.


// Pool = a managed set of DB connections, instead of creating a 
// new client for every query.
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
