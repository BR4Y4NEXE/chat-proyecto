const express = require('express');
const path = require('path');


const app = express();
const webPort = 3000;
const chatPort = 3001;

// Configurar EJS como motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para renderizar la vista chat.ejs
app.get('/', (req, res) => {
    res.render('chat');
});

// Iniciar servidor web
const webServer = app.listen(webPort, () => {
    console.log(`Servidor web escuchando en http://localhost:${webPort}`);
});

// Crear WebSocket Server
const wss = new WebSocket.Server({ port: chatPort });
const clients = new Set();

wss.on('connection', (ws) => {
    ws.username = 'Anónimo'; // Asignar un nombre de usuario por defecto
    clients.add(ws);
    console.log('Nuevo cliente conectado');

    // Enviar lista de usuarios conectados al nuevo cliente
    updateClients();

    ws.on('message', (message) => {
        const msgData = JSON.parse(message);
        if (msgData.type === 'message') {
            // Enviar el mensaje a todos los clientes excepto al remitente
            clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'message',
                        sender: msgData.sender,
                        message: msgData.message
                    }));
                }
            });
        } else if (msgData.type === 'connect') {
            ws.username = msgData.username; // Guardar el nombre de usuario
            console.log(`${ws.username} se ha conectado`);
            updateClients();
        }
    });

    ws.on('close', () => {
        console.log(`${ws.username} se ha desconectado`);
        clients.delete(ws);
        updateClients();
    });
});

// Función para actualizar la lista de usuarios conectados
function updateClients() {
    const userNames = [...clients].map(client => client.username); // Obtener nombres de usuario
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'users',
                users: userNames
            }));
        }
    });
}
