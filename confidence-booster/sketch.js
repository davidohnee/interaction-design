new Vue({
            el: '#app',
            vuetify: new Vuetify(),
            data: {
                wordActions: [
                    { phrase: 'ähm', type: '1', saved: true },
                    { phrase: 'ich denke', type: '2', saved: true },
                    { phrase: 'vielleicht', type: 'L', saved: true }
                ],
                vibratingTypes: [
                    { text: '1x vibrieren', value: '1' },
                    { text: '2x vibrieren', value: '2' },
                    { text: '2 Sekunden vibrieren', value: 'L' }
                ]
            },
            mounted() {
                if (annyang) {
                    annyang.setLanguage('de-DE');
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
                    this.wordActions.push({ phrase: '', type: '1', saved: false });
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
                    if (!phrase || !item.type) return;
                    item.saved = true;
                    if (annyang) {
                        const command = {};
                        command[phrase] = () => this.triggerVibration(item.type);
                        annyang.addCommands(command);
                        console.log(`Gespeichert: "${phrase}" → ${item.type}`);
                    }
                },
                triggerVibration(type) {
                    fetch('http://localhost:3000/trigger', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type }) // direkt: '1', '2', 'L'
                    })
                        .then(() => console.log('Vibration ausgelöst!'))
                        .catch(err => console.error('Fehler beim Senden:', err));
                }
            }
        });
