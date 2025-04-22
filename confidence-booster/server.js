const express = require('express');
const { SerialPort } = require('serialport');
const app = express();
const port = 3000;
const cors = require('cors');

// CORS aktivieren
app.use(cors());
app.use(express.json());

const arduino = new SerialPort({
                                   path: '/dev/cu.usbmodem21301',
                                   baudRate: 9600
                               });

app.use(express.json());

app.post('/trigger', (req, res) => {
    if (!arduino.isOpen) {
        console.error('Port ist nicht geöffnet!');
        return res.status(500).send('Port geschlossen');
    }

    arduino.write('1', (err) => {
        if (err) {
            console.error('Fehler beim Senden:', err.message);
            return res.sendStatus(500);
        }
        console.log('Signal an Arduino gesendet');
        res.sendStatus(200);
    });
});


app.listen(port, () => {
    console.log(`Node-Server läuft auf http://localhost:${port}`);
});
