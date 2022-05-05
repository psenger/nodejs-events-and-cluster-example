const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const events = require('events')

const isNill = (value) => value === null || value === undefined;

/**
 * fires off every second till `duration` is counted down to zero
 **/
function timer(options = {duration: 90, frequency: 1000}, cb) {
    if (typeof options === 'function') {
        cb = options;
        options = null;
    }
    const duration = isNill(options) || isNill(options.duration) ? 90 : options.duration;
    const frequency = isNill(options) || isNill(options.frequency) ? 1000 : options.frequency;
    let remainingTime = duration;
    setTimeout(function () {
        cb();
        if (remainingTime > 0) {
            remainingTime--;
            timer({seconds: remainingTime, frequency}, cb);
        }
    }, frequency); // fires off every frequency milliseconds, until duration is zero
}

const buildIncrementer = function incrementCountClosure(emitter) {
    return function incrementCount() {
        incrementCount.count = incrementCount.count || 0;
        incrementCount.count++;
        emitter.emit('incremented', incrementCount.count);
    }
}

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    const em = new events.EventEmitter();

    const userCount = buildIncrementer(em);

    timer({duration: Number.MAX_SAFE_INTEGER, frequency: 1000}, userCount);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('fork', (worker) => {
        console.log('worker is dead:', worker.isDead());
    });

    cluster.on('exit', (worker, code, signal) => {
        console.log('worker is dead:', worker.isDead());
    });

    em.on('incremented', function (data) {
        Object.values(cluster.workers).forEach(worker => {
            worker.send({count: data})
        });
    });


} else {
    require('./server')(cluster);
}
