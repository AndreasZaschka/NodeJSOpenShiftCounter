/**
 * Created by Andreas on 17.12.2014.
 */
var restify = require('restify');
var mongojs = require("mongojs");

//  Get the environment variables we need.
var ip_addr = process.env.OPENSHIFT_NODEJS_IP;
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

var connection_string = 'mongodb://admin:IUcck8-z3pIK@$OPENSHIFT_MONGODB_DB_HOST:$OPENSHIFT_MONGODB_DB_PORT/counter';
var db = mongojs(connection_string, ['counter']);
var counters = db.collection("counters");
var counter_details = db.collection("counter_details");

var server = restify.createServer({
    name: "counter"
});

server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());

var COUNTER = '/counters'
server.get({path: PATH}, findAllCounters);
server.get({path: PATH + '/:counterId'}, findCounter);
server.post({path: PATH}, postNewCounter);
server.del({path: PATH + '/:counterId'}, deleteCounter);

server.listen(port, ip_addr, function () {
    console.log('%s listening at %s ', server.name, server.url);
});

function findAllCounters(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    counters.find().limit(20).sort({name: -1}, function (err, success) {
        console.log('Response success ' + success);
        console.log('Response error ' + err);
        if (success) {
            res.send(200, success);
            return next();
        } else {
            return next(err);
        }

    });

}

function findCounter(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    counters.findOne({_id: mongojs.ObjectId(req.params.counterId)}, function (err, success) {
        console.log('Response success ' + success);
        console.log('Response error ' + err);
        if (success) {
            res.send(200, success);
            return next();
        }
        return next(err);
    })
}

function postNewCounter(req, res, next) {
    var counter = {};
    counter.name = req.params.name;
    counter.amount = 0;

    var counter_detail = {};
    counter_detail.name = req.params.name;
    counter_detail.amount = 0;
    counter_detail.modDate = new Date();
    counter_detail.modUser = req.params.user;

    res.setHeader('Access-Control-Allow-Origin', '*');

    counter_details.save(counter_detail, function (err, success) {
        console.log('Response success ' + success);
        console.log('Response error ' + err);
    });

    counters.save(counter, function (err, success) {
        console.log('Response success ' + success);
        console.log('Response error ' + err);
        if (success) {
            res.send(201, counter);
            return next();
        } else {
            return next(err);
        }
    });
}

function deleteCounter(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    counters.remove({_id: mongojs.ObjectId(req.params.counterId)}, function (err, success) {
        console.log('Response success ' + success);
        console.log('Response error ' + err);
        if (success) {
            res.send(204);
            return next();
        } else {
            return next(err);
        }
    })

}

