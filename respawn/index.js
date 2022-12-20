const cluster = require('cluster')
const worker = require('./worker')
const { randomNumber } = require('../utils')

const workers = {}

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`)

    const workerNames = [ 'A', 'B', 'C' ]
    workerNames.forEach(workerName => {
        // send a timerOffset value to each worker
        //    This value will be used to set up the interval
        //    which will be used to call the event emitter.
        const processEnv = {
            workerName,
            timerOffset: randomNumber(1000,1500)
        }
        const worker = cluster.fork( processEnv )
        workers[worker.process.pid] = [ worker, processEnv ]
    })
    cluster.on('exit', (deadWorker, code, signal) => {
        const [ , processEnv ] = workers[deadWorker.process.pid]
        delete workers[deadWorker.process.pid] // wow, I forgot to add this. Without, it is a memory leak
        console.error( `Worker "${deadWorker.process.pid}" died with code="${code}" signal="${signal}" env="${JSON.stringify(processEnv)}"`)
        const worker = cluster.fork( processEnv )
        workers[worker.process.pid] = [ worker, processEnv ]
        console.error( `Replacement worker spawned pid="${worker.process.pid}" env="${JSON.stringify(processEnv)}"`)
    })
} else {
    worker()
}
