const { randomNumber } = require('../utils')
module.exports = () => {

    setInterval( () => {
        console.log(`Worker ${process.env.workerName} ${process.pid} heartbeat`);
        // with this code we will test the ability of the master
        // to recreate the worker
        if (randomNumber(1, 10) === 5) {
            console.log(`Worker ${process.env.workerName} ${process.pid} stopping with process.exit`);
            process.exit(0)
        }
        if (randomNumber(1, 10) === 6) {
            console.log(`Worker ${process.env.workerName} ${process.pid} stopping with exception`);
            throw new Error('boom')
        }
    }, process.env.timerOffset )

}
