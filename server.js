const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname,'public')));

const server = app.listen(PORT, ()=>console.log(`Server running at http://localhost:${PORT}`));

const wss = new WebSocket.Server({ server });

wss.on('connection', ws=>{
    ws.on('message', message=>{
        wss.clients.forEach(client=>{
            if(client.readyState===WebSocket.OPEN){
                client.send(message);
            }
        });
    });
    ws.on('close', ()=>console.log('A user disconnected'));
});
