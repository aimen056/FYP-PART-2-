#include "MQ7.h"
#include <MQ131.h>
#include <WiFi.h>
#include <HTTPClient.h>


#define MQ7_A_PIN 35
#define MQ131_A_PIN 34
#define MQ131_HEATER_PIN 99  // Dummy heater pin for MQ131
#define VOLTAGE 5.0

const char* ssid = "AMJAD";
const char* password = "Mo000813";
const char* serverURL = "http://192.168.18.7:5002/api/aqi-sensor";

MQ7 mq7(MQ7_A_PIN, VOLTAGE);

HardwareSerial sds(1);  // Use UART1

#define SDS_RX 16  // SDS011 TX -> ESP32 RX
#define SDS_TX 17  // SDS011 RX -> ESP32 TX

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected to WiFi");
  delay(2000);

  // MQ7 uses hardcoded R0 = 10.0

  // Initialize MQ131
  MQ131.begin(MQ131_HEATER_PIN, MQ131_A_PIN, HIGH_CONCENTRATION, 1000000);
  MQ131.setR0(500);  // Approximate/calibrated R0
  MQ131.setTimeToRead(1);

  sds.begin(9600, SERIAL_8N1, SDS_RX, SDS_TX);
}

void loop() {
  float co_ppm = mq7.readPpm();
  float o3_voltage = (analogRead(MQ131_A_PIN) / 4095.0) * 3.3;
  float o3_ppm = o3_voltage * 0.3;  // Approximate conversion

  // SDS011 read
  while (sds.available() && sds.read() != 0xAA) {}

  if (sds.available()) {
    byte buffer[10];
    buffer[0] = 0xAA;

    if (sds.available() >= 9) {
      sds.readBytes(&buffer[1], 9);

      if (buffer[9] == 0xAB) {
        int pm25int = (buffer[3] << 8) | buffer[2];
        int pm10int = (buffer[5] << 8) | buffer[4];
        float pm2_5 = pm25int / 10.0;
        float pm10 = pm10int / 10.0;

        sendData(pm2_5, pm10, co_ppm, o3_ppm);
        Serial.print("PM2.5: ");
        Serial.print(pm2_5, 1);
        Serial.print(" µg/m³   PM10: ");
        Serial.print(pm10, 1);
        Serial.print(" µg/m³   CO PPM: ");
        Serial.print(co_ppm, 4);
        Serial.print(" | O3 PPM: ");
        Serial.println(o3_ppm, 4);
      } else {
        Serial.println("Invalid SDS011 end byte.");
      }
    } else {
      Serial.println("Not enough SDS011 data.");
    }
  }

  delay(6000);  // Delay between readings
}
void sendData(float pm2_5, float pm10, float co, float o3) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");

    String payload = String("{") + "\"zone\":\"Zone 1\"," + "\"locationName\":\"Central Sensor\"," + "\"pm2_5\":" + pm2_5 + "," + "\"pm10\":" + pm10 + "," + "\"co\":" + co + "," + "\"o3\":" + o3 + "}";

    int httpCode = http.POST(payload);

    if (httpCode > 0) {
      // Serial.printf("HTTP Response code: %d\n", httpCode);
    } else {
      // Serial.printf("HTTP Error: %s\n", http.errorToString(httpCode).c_str());
    }
    http.end();
  }
}
