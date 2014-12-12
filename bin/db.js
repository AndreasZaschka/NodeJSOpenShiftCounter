/**
 * Created by Andreas on 11.12.2014.
 */
var cc = require('config-multipaas'),
    pg = require('pg')

var table_counters = 'COUNTERS',
    table_counter_detail = 'COUNTER_DETAILS',
    table_counter_history = 'COUNTER_HISTORY'

var conString = "postgresql://admin2efblhn:eupljg6eQRSH@$OPENSHIFT_POSTGRESQL_DB_HOST:$OPENSHIFT_POSTGRESQL_DB_PORT/counter";
if (process.env.OPENSHIFT_POSTGRESQL_DB_URL) {
    conString = process.env.OPENSHIFT_POSTGRESQL_DB_URL + '/counter';
}
var client = new pg.Client(conString);
client.connect();

var error_response = "data already exists - bypassing db initialization step\n";

function createDBSchema(err, rows, next) {
    if (err && err.code == "ECONNREFUSED") {
        return console.error("DB connection unavailable, see README notes for setup assistance\n", err);
    }

    // TABLE COUNTERS
    var query = "CREATE TABLE IF NOT EXISTS " + table_counters + " (" +
        "id serial NOT NULL, " +
        "name character varying(14) NOT NULL, " +
        "amount integer NOT NULL," +
        "PRIMARY KEY (id)" +
        ");";
    console.log(query);
    var pg = client.query(query);
    pg.on("row", function (row, result) {
        result.addRow(row);
    });
    pg.on("end", function (result) {
        console.log(result.rows + ' rows were received');
    });

    //TABLE COUNTER_DETAILS
    var query = "CREATE TABLE IF NOT EXISTS " + table_counter_detail + " (" +
        "id serial NOT NULL REFERENCES " + table_counters + "(id), " +
        "name character varying(14) NOT NULL, " +
        "amount integer NOT NULL," +
        "mod_date timestamp DEFAULT CURRENT_TIMESTAMP," +
        "mod_username character varying(14) DEFAULT 'anonymous'" +
        ");";
    console.log(query);
    var pg = client.query(query);
    pg.on("row", function (row, result) {
        result.addRow(row);
    });
    pg.on("end", function (result) {
        console.log(result.rows + ' rows were received');
    });

    //TABLE COUNTER_HISTORY
    var query = "CREATE TABLE IF NOT EXISTS " + table_counter_history + " (" +
        "id serial NOT NULL REFERENCES " + table_counters + "(id), " +
        "name character varying(14) NOT NULL, " +
        "amount integer NOT NULL," +
        "mod_date timestamp DEFAULT CURRENT_TIMESTAMP," +
        "mod_username character varying(14) DEFAULT 'anonymous'" +
        ");";
    console.log(query);
    var pg = client.query(query);
    pg.on("row", function (row, result) {
        result.addRow(row);
    });
    pg.on("end", function (result) {
        console.log(result.rows + ' rows were received');
    });

    client.end();
};

function init_db() {
    createDBSchema();
}

function flush_db() {
    pg('DROP TABLE ' + table_counters + ';', function (err, rows, result) {
        var response = 'Database ' + table_counters + ' dropped!';
        console.log(response);
        return response;
    });
    pg('DROP TABLE ' + table_counter_detail + ';', function (err, rows, result) {
        var response = 'Database ' + table_counter_detail + ' dropped!';
        console.log(response);
        return response;
    });
    pg('DROP TABLE ' + table_counter_history + ';', function (err, rows, result) {
        var response = 'Database ' + table_counter_history + ' dropped!';
        console.log(response);
        return response;
    });
}

function select_all(req, res, next) {
    var query = 'SELECT * FROM ' + table_counters + ';';
    console.log(query);
    var pg = client.query(query);
    pg.on("row", function (row, result) {
        result.addRow(row);
    });
    pg.on("end", function (result) {
        console.log(result.rows + ' rows were received');
        res.send(result);
        client.end();
    });
};

function select_one(req, res, next) {
    var id = req.params.id;
    var query = 'SELECT * FROM ' + table_counter_detail + ' WHERE id=' + id + ';';
    console.log(query);
    var pg = client.query(query);
    pg.on("row", function (row, result) {
        result.addRow(row);
    });
    pg.on("end", function (result) {
        console.log(result.rows + ' rows were received');
        res.send(result);
        client.end();
    });
}

function insert_dummy(req, res, next) {
    var query = "INSERT INTO ' + table_counters + ' (name, amount) VALUES ('MATE', 37),('IPhone', 1);";
    var query2 = 'INSERT INTO ' + table_counter_detail + ' (id, name, amount, mod_username) VALUES (1, "MATE", 37, "Andreas Zaschka"),(2, "IPhone", 1, "Markus Heider");';
    console.log(query);
    var pg = client.query(query);
    pg.on("row", function (row, result) {
        result.addRow(row);
    });
    pg.on("end", function (result) {
        console.log(result.rows + ' rows were received');
        res.send(result);
        client.end();
    });
}

module.exports = exports = {
    selectAll: select_all,
    selectOne: select_one,
    insertDummy: insert_dummy,
    flushDB: flush_db,
    initDB: init_db
};