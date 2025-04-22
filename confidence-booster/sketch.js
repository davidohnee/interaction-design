if (annyang) {
  const commands = {
    'ähm': triggerVibration,
    'uhm': triggerVibration,
    'ehmm': triggerVibration,
    'ehh': triggerVibration,
    'hello': triggerVibration
  };

  annyang.addCommands(commands);
  annyang.start();

  console.log('Voice recognition started...');
}

function triggerVibration() {
  fetch('http://localhost:3000/trigger', {
    method: 'POST'
  }).then(() => console.log('Vibration ausgelöst!'))
      .catch(err => console.error('Fehler beim Senden:', err));
}

