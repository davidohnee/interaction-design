new Vue({
            el: '#app',
            vuetify: new Vuetify(),
            data: {
                wordActions: [
                    { phrase: 'ähm', type: '1x vibrieren', saved: true },
                    { phrase: 'ich denke', type: '2x vibrieren', saved: true },
                    { phrase: 'vielleicht', type: '2 Sekunden vibrieren', saved: true }
                ]
            },
            mounted() {
                if (annyang) {
                    annyang.setLanguage('de-DE');

                    // Nur gespeicherte Einträge registrieren
                    const initialCommands = {};
                    this.wordActions.forEach(item => {
                        if (item.saved && item.phrase.trim()) {
                            initialCommands[item.phrase.trim()] = () => this.triggerVibration(item.type);
                        }
                    });
                    annyang.addCommands(initialCommands);

                    annyang.start();
                    console.log('Voice recognition started...');
                }
            },

            methods: {
                addEntry() {
                    this.wordActions.push({phrase: '', type: '1x vibrieren', saved: false});
                },
                removeEntry(index) {
                    const phrase = this.wordActions[index].phrase.trim();
                    this.wordActions.splice(index, 1);
                    if (annyang) {
                        annyang.removeCommands([phrase]);
                    }
                },
                saveEntry(index) {
                    const item = this.wordActions[index];
                    const phrase = item.phrase.trim();
                    if (!phrase || !item.type) {
                        return;
                    }

                    item.saved = true;

                    if (annyang) {
                        const command = {};
                        command[phrase] = () => this.triggerVibration(item.type);
                        annyang.addCommands(command);
                        console.log(`Gespeichert: "${phrase}" → ${item.type}`);
                    }
                },
                triggerVibration(type) {
                    // Schicke den „sprechenden“ Typ wie „1x vibrieren“ – Server übernimmt das Mapping
                    fetch('http://localhost:3000/trigger', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type }) // ← sende: „1x vibrieren“ oder „2 Sekunden vibrieren“
                    })
                        .then(() => console.log('Vibration ausgelöst!'))
                        .catch(err => console.error('Fehler beim Senden:', err));
                }

            }
        });