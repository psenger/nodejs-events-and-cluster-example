const http = require('http');

module.exports = (cluster) => {
    let message = '';
    process.on('message', ({count}) => {
        message = `${count}`
    })
    http.createServer((req, res) => {
        res.writeHead(200);
        res.end(`Current process ${process.pid} \n ${message}`);
        // process.kill(process.pid);
    }).listen(8000);
}
