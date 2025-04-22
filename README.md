# Interaction Design (IxD)


# Prototype 1
[emotional-support-mirror](emotional-support-mirror)
using:
- [p5js](https://p5js.org/)
- [ml5js](https://ml5js.org/)
- [annyang!](https://www.talater.com/annyang/)

# 🤖 Confidence Booster

Der Confidence Booster erkennt unsichere Sprachmuster wie "ähm", "vielleicht" oder "ich glaube" während einer Präsentation und gibt sofort haptisches Feedback (Vibration) über einen mit dem Laptop verbundenen Arduino.

---

## 📦 Voraussetzungen

### Software:
- [Node.js](https://nodejs.org/) (getestet mit v18 oder neuer)
- npm (Node Package Manager)
- Google Chrome (für Sprach-API)

### Hardware:
- Arduino Nano (oder vergleichbar)
- Vibrationsmodul (z. B. Grove Vibration Motor Module)
- USB-Kabel

---

## 🔧 Setup

1. **Projekt klonen**
```bash
   git clone <repo-url>
   cd confidence-booster
```

2. **Node-Dependencies installieren**
```bash
   npm install
```

3. **Arduino Code hochladen**
- Öffne die Datei `arduino/vibration_control.ino`
- Lade den Code via Arduino IDE auf den Arduino hoch

4. **Node.js-Server starten**
```bash
   node server.js
```
- Der Server öffnet Port `3000` und leitet POST-Befehle an den Arduino weiter

5. **Frontend starten**
- Öffne `index.html` **in Chrome** (lokal oder über Live Server)
- Erlaube den Zugriff auf das Mikrofon

---

## 🗣 Bedienung

1. Im Frontend kannst du:
    - Neue Trigger-Wörter eingeben (z. B. "ähm", "ich glaube")
    - Eine Reaktion wählen:
        - "1x vibrieren"
        - "2x vibrieren"
        - "2 Sekunden vibrieren"
    - Den Eintrag speichern

2. Sobald das Wort erkannt wird, löst dein Arduino das entsprechende Vibrationsmuster aus.

---

## 📡 Kommunikation

- Das Frontend sendet `POST` an `http://localhost:3000/trigger`
- Der Server übersetzt die Aktion in ein Signal:
    - `1` → 1x vibrieren
    - `2` → 2x vibrieren
    - `L` → lang (2 Sekunden)
- Der Arduino liest das Signal über die serielle Verbindung

---

## ✅ Beispielhafte Trigger
| Wort/Satz     | Aktion              |
|---------------|---------------------|
| "ähm"         | 1x vibrieren        |
| "ich denke"   | 2x vibrieren        |
| "vielleicht"  | 2 Sekunden vibrieren|

---

## 🧪 Testen
- Sag „ähm“ oder dein definiertes Triggerwort in dein Mikrofon
- Der Vibrationsmotor gibt Feedback 🚨

---

## 🙋‍♂️ Probleme?
- Stelle sicher, dass du Chrome benutzt
- Die Arduino IDE darf beim Starten von `server.js` **nicht** offen sein (sie blockiert den Port)
- Prüfe die Konsole (F12) auf Fehler bei Sprachzugriff oder CORS

---

## ✨ Idee & Umsetzung
Dieses Projekt wurde im Rahmen des Interaction Design Moduls umgesetzt.

Mit ❤️ von [deinem Namen hier einfügen]