const net = require('net');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Pedir la IP del servidor
rl.question('Ingresa la IP del servidor: ', (serverIP) => {
    rl.question('Ingresa tu nombre de usuario: ', (username) => {
        const client = new net.Socket();
        const chatPort = 3001;

        client.connect(chatPort, serverIP, () => {
            console.log(`Conectado al servidor ${serverIP}:${chatPort}`);
            console.log('Escribe tus mensajes y presiona Enter para enviar');
            console.log('Para salir, escribe "exit" o presiona Ctrl+C');

            rl.setPrompt('> ');
            rl.prompt();
        });

        client.on('data', (data) => {
            console.log('\n' + data.toString().trim());
            rl.prompt();
        });

        client.on('close', () => {
            console.log('Conexión cerrada');
            rl.close();
            process.exit(0);
        });

        client.on('error', (err) => {
            console.log('Error de conexión:', err.message);
            rl.close();
            process.exit(1);
        });

        rl.on('line', (input) => {
            if (input.toLowerCase() === 'exit') {
                client.end();
                return;
            }
            client.write(`${username}: ${input}`);
            rl.prompt();
        });
    });
});
