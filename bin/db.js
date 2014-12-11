/**
 * Created by Andreas on 11.12.2014.
 */
var cc = require('config-multipaas'),
    pg = require('pg-query')

var table_counters = 'COUNTERS',
    table_counter_detail = 'COUNTER_DETAILS',
    table_counter_history = 'COUNTER_HISTORY'

var config = cc({
    table_name: process.env.TABLE_NAME || process.env.OPENSHIFT_APP_NAME || 'counter'
})
var pg_config = config.get('POSTGRESQL_DB_URL');

var error_response = "data already exists - bypassing db initialization step\n";

function createDBSchema(err, rows, result) {
    if (err && err.code == "ECONNREFUSED") {
        return console.error("DB connection unavailable, see README notes for setup assistance\n", err);
    }

    // TABLE COUNTERS
    pg.connectionParameters = pg_config + '/' + table_counters;
    console.log(pg_config + '/' + table_counters);
    var query = "CREATE TABLE " + table_counters + " (" +
        "id serial NOT NULL, " +
        "name character varying(14) NOT NULL, " +
        "amount integer NOT NULL," +
        "PRIMARY KEY (id)" +
        ");";
    pg(query);

    //TABLE COUNTER_DETAILS
    pg.connectionParameters = pg_config + '/' + table_counter_detail;
    console.log(pg_config + '/' + table_counter_detail);
    var query = "CREATE TABLE " + table_counter_detail + " (" +
        "id serial NOT NULL REFERENCES " + table_counters + "(id), " +
        "name character varying(14) NOT NULL, " +
        "amount integer NOT NULL," +
        "mod_date timestamp DEFAULT CURRENT_TIMESTAMP," +
        "mod_username character varying(14) DEFAULT 'anonymous'" +
        ");";
    pg(query);

    //TABLE COUNTER_HISTORY
    pg.connectionParameters = pg_config + '/' + table_counter_history;
    console.log(pg_config + '/' + table_counter_history);
    var query = "CREATE TABLE " + table_counter_history + " (" +
        "id serial NOT NULL REFERENCES " + table_counters + "(id), " +
        "name character varying(14) NOT NULL, " +
        "amount integer NOT NULL," +
        "mod_date timestamp DEFAULT CURRENT_TIMESTAMP," +
        "mod_username character varying(14) DEFAULT 'anonymous'" +
        ");";
    pg(query);
};

function init_db() {
    pg(createDBSchema);
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
    console.log(pg);
    pg('SELECT * FROM ' + table_counters + ';', function (err, rows, result) {
        console.log(config);
        if (err) {
            res.send(500, {http_status: 500, error_msg: err})
            return console.error('error running query', err);
        }
        res.send(result);
        return rows;
    });
};

function select_one(req, res, next) {
    var id = req.params.id;
    console.log(pg);
    pg('SELECT * FROM ' + table_counter_detail + ' WHERE id=' + id + ';', function (err, rows, result) {
        console.log(config);
        if (err) {
            res.send(500, {http_status: 500, error_msg: err})
            return consile.error('error running query', err);
        }
        res.send(result);
        return rows;
    });
}

function insert_dummy(req, res, next) {
    console.log(pg);
    pg('INSERT INTO ' + table_counters + ' (name, amount) VALUES ("MATE", 37),("IPhone", 1));', function (err, rows, result) {
        console.log(config);
        if (err) {
            res.send(500, {http_status: 500, error_msg: err})
            return consile.error('error running query', err);
        }
        res.send(result);
        return rows;
    });
}

module.exports = exports = {
    selectAll: select_all,
    selectOne: select_one,
    insertDummy: insert_dummy,
    flushDB: flush_db,
    initDB: init_db
};