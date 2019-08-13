import express from 'express';
import http from 'http';
import WebSocket from 'ws';

const app = express();
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'html');

app.get('/console', (req, res) => {
  res.render('index.html');
});

//initialize a simple http server
const server = http.createServer(app);

const PORT = process.env.PORT || 8999;

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket) => {

  //connection is up, let's add a simple simple event
  ws.on('message', (message: string) => {

    //log the received message and send it back to the client
    console.log('received: %s', message);

    const broadcastRegex = /^broadcast\:/;

    if (broadcastRegex.test(message)) {
      message = message.replace(broadcastRegex, '');

      //send back the message to the other clients
      wss.clients
        .forEach(client => {
          if (client != ws) {
            client.send(`Hello, broadcast message -> ${message}`);
          }    
        });   
    } else {
      ws.send(`Hello, you sent -> ${message}`);
    }
  });

  //send immediatly a feedback to the incoming connection    
  ws.send('WebSocket server iniciado');
});

//start our server
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});