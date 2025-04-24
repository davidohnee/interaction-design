const express = require('express');
const { SerialPort } = require('serialport');
const app = express();
const port = 3000;
const cors = require('cors');

// CORS aktivieren
app.use(cors());
app.use(express.json());

const arduino = new SerialPort({
                                   path: '/dev/cu.usbmodem1301',
                                   baudRate: 9600
                               });

app.use(express.json());
app.post('/trigger', (req, res) => {
    const signal = req.body?.type || '1';

    arduino.write(signal, (err) => {
        if (err) return res.status(500).send('Error');
        res.sendStatus(200);
    });
});




app.listen(port, () => {
    console.log(`Node-Server läuft auf http://localhost:${port}`);
});
