const int vibPin = 9;

void setup() {
  Serial.begin(9600);
  pinMode(vibPin, OUTPUT);
}

void loop() {
  if (Serial.available() > 0) {
    char signal = Serial.read();

    if (signal == '1') {
      // 1x vibrieren
      digitalWrite(vibPin, HIGH);
      delay(300);
      digitalWrite(vibPin, LOW);
    }

    else if (signal == '2') {
      // 2x kurz vibrieren
      for (int i = 0; i < 2; i++) {
        digitalWrite(vibPin, HIGH);
        delay(200);
        digitalWrite(vibPin, LOW);
        delay(200);
      }
    }

    else if (signal == 'L') {
      // 2 Sekunden lang vibrieren
      digitalWrite(vibPin, HIGH);
      delay(2000);
      digitalWrite(vibPin, LOW);
    }
  }
}
