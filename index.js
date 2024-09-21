const yargs = require('yargs')
const {hideBin} = require('yargs/helpers')
const express = require('express');
const app = express();
const server = require('http').Server(app);
var robot = require("robotjs");
const { url } = require('inspector');

const argv = yargs(hideBin(process.argv)) // Analyse des paramètres
  .option('url', {
    alias: 'u',
    default: 'localhost',
    description: 'Url du serveur à contacter'
  })
  .option('port', {
    alias: 'p',
    default: '3000',
    description: 'port à utiliser'
  })
  .help()
  .argv


const typesDef = {
    DIR_EVENT: 'direvent',
    CLICK_EVENT: 'clickevent',
  }
  
const users = {}
const clients = {}

const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

function moveMouse(x, y) {
    robot.moveMouse(x, y);
}
function simulateLeftClick() {
    robot.mouseClick();
}

function handleMessage(message, userId) {
    console.log(`Received message: ${message} , from ${userId}`);
    messageReceived = JSON.parse(message)
    if(messageReceived.type === "DIR_EVENT"){
        var mousePos = robot.getMousePos();
        const coord = {}
        coord["x"] = mousePos.x + messageReceived.x
        coord["y"] = mousePos.y + messageReceived.y
        users[userId]= coord
        moveMouse(users[userId].x, users[userId].y)
    }
    if(messageReceived.type === "CLICK_EVENT"){
        simulateLeftClick()
    }
  }
  
  
  function handleDisconnect(userId) {
    if (!userId){
      return 
    }
    console.log(`${userId} disconnected.`)
    delete clients[userId];
    delete users[userId];
    
  }

app.set('view engine', 'ejs');

app.get('/', (_, res) => {
    res.render('index',{url:argv.url,port:argv.port});
});

server.listen(argv.port,argv.url, async() => {
    console.log('Server is running on http://' + argv.url + ':' + argv.port);
});

io.on('connection', (socket) => {
    clients[socket.id] = socket;
    console.log(`${socket.id} connected.`);

    socket.on("message", (message) => handleMessage(message,socket.id));
    socket.on("disconnect", () => handleDisconnect(socket.id));
});


// const { exec } = require("child_process"); 
 
// exec("ipconfig /w", (err, outs, errs) => { 
// 	console.log(outs); 
// }); 