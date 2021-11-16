const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {

    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    Object.keys(cluster.workers).forEach(function (id) {
        // master监听message事件，接收来自worker的消息
        cluster.workers[id].on('message', function (msg) {
            console.log('[master] ' + 'received msg:' + msg + 'from worker' + id);
        });
    });

    function eachWorker(callback) {
        for (var id in cluster.workers) {
            callback(cluster.workers[id]);
        }
    }

    var i = 0;
    setTimeout(function () {
        //master 向每个worker发消息
        eachWorker(function (worker) {
            i++;
            worker.send('[master] ' + 'send msg ' + i + ' to worker' + worker.id);
        });
    }, 1000);
} else if (cluster.isWorker) {
    console.log('[worker] ' + "worker" + cluster.worker.id + " started, pid:" + process.pid);
// worker监听message事件，接收来自master的消息
    process.on('message', function (msg) {
        console.log('[worker] worker' + cluster.worker.id + ' received msg:' + msg);
        // worker向master发送消息
        process.send('[worker] send msg ' + cluster.worker.id + ' to master.');
    });

    http.createServer(function (req, res) {
        var response = 'worker received request, id:' + cluster.worker.id + ',pid:' + process.pid;
        console.log(response);
        res.writeHead(200, { "content-type": "text/html" });
        res.end(response);
    }).listen(5000);

}