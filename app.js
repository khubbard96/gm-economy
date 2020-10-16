const loadJsonFile = require('load-json-file');

(async () => {
    var http, director, bot, router, server, port;

    http        = require('http');
    director    = require('director');
    bot         = require('./bot.js');

    let config = await loadJsonFile("config.json");
    port = config.server_port;
    
    router = new director.http.Router({
      '/' : {
        post: bot.respond,
        get: ping
      }
    });
    
    server = http.createServer(function (req, res) {
      req.chunks = [];
      req.on('data', function (chunk) {
        req.chunks.push(chunk.toString());
      });
    
      router.dispatch(req, res, function(err) {
        res.writeHead(err.status, {"Content-Type": "text/plain"});
        res.end(err.message);
      });
    });
    
    server.listen(port);
    console.log("Server listening on " + port);
    
    function ping() {
      this.res.writeHead(200);
      this.res.end("I'm the DPsi gm balance bot!");
    }
})();
