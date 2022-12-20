const uuid = require('uuid').v4
module.exports = () => {

    process.on('message', ({msg}) => {
        console.log( `Worker ${process.env.workerName} ${process.pid} ACK MSG ${msg}`);
    })

    setInterval( () => {
        if ( process.env.broadcaster === 'true') {
            process.send({msg: `${process.env.workerName} ${process.pid} ${uuid()}`})
        }
    }, Number.parseInt(process.env.timerOffset,10) )


}
