const cluster = require('cluster')
const events = require('events')
const worker = require('./worker')
const {randomNumber} = require('../utils')

const workers = {};

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    // Create an Event Emitter locally.
    //   This emitter will broadcast messages to all workers.
    //   workers will listen for messages on this emitter.
    const eventEmitter = new events.EventEmitter();

    cluster.on('fork', (worker) => {
        console.log(`       worker started pid ${worker.process.pid}`);
    });

    const workerNames = ['A', 'B', 'C']
    workerNames.forEach(workerName => {
        // send a timerOffset value to each worker
        //    This value will be used to set up the interval
        //    which will be used to call the event emitter.
        const processEnv = {
            workerName,
            timerOffset: randomNumber(1000, 1500),
            broadcaster: workerName === 'B'
        }
        const worker = cluster.fork(processEnv)
        workers[worker.process.pid] = [worker, processEnv];
    })

    // This allows workers to send messages back
    // to the master process.... and in this case
    // we re-transmit the message to all workers
    // via the eventEmitter.
    //
    // Side Effect, even the worker that sent the message
    // will receive the message.
    //
    // Edit this to suite your needs.
    //     worker ---> master ---> event-emitter ---> workers
    //
    cluster.on('message', (worker, msg) => {
        console.log(`Master REC msg frm worker pid ${worker.process.pid} worker id ${worker.id}`);
        eventEmitter.emit('broadcast', {originWorkerProcessId: worker.id, msg})
    })

    // Allows the message from one worker to be broadcast to all
    // workers. Edit this to suite your needs.
    eventEmitter.on('broadcast', ({originWorkerProcessId, msg}) => {
        console.log(`       broadcast msg via eventEmitter worked id ${originWorkerProcessId}`, msg);
        for (const id in cluster.workers) {
            // Tracking the Origin Process ID to prevent,
            // re broadcasting the message to the origin
            // process that created the message.
            if (originWorkerProcessId !==  Number.parseInt(id,10)) {
                cluster.workers[id].send(msg)
            }
        }
    })

} else {
    worker()
}
