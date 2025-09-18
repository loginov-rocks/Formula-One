#include <Arduino.h>
#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>

const char ssid[] = "Eliminator2";
const char password[] = "K9g5Xi78";

const char mqttServer[] = "192.168.0.112";
WiFiClient wiFiClient;
PubSubClient mqttClient(wiFiClient);

void simpleConnect()
{
  Serial.print("Using SSID \"");
  Serial.print(ssid);
  Serial.print("\" and password \"");
  Serial.print(password);
  Serial.print("\".");

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print('.');
  }

  Serial.println();
}

void callback(char *topic, byte *payload, unsigned int length)
{
  JsonDocument doc;
  DeserializationError error = deserializeJson(doc, payload);

  if (error)
  {
    Serial.print(F("deserializeJson() failed: "));
    Serial.println(error.f_str());
    return;
  }

  const char *meetingCountryCode = doc["meetingCountryCode"];
  const char *meetingCountryName = doc["meetingCountryName"];
  const char *meetingLocation = doc["meetingLocation"];
  const char *meetingName = doc["meetingName"];
  const char *meetingOfficialName = doc["meetingOfficialName"];
  const char *sessionShortName = doc["sessionShortName"];
  const char *sessionStart = doc["sessionStart"];
  const char *sessionState = doc["sessionState"];

  Serial.print("meetingCountryCode: ");
  Serial.println(meetingCountryCode);
  Serial.print("meetingCountryName: ");
  Serial.println(meetingCountryName);
  Serial.print("meetingLocation: ");
  Serial.println(meetingLocation);
  Serial.print("meetingName: ");
  Serial.println(meetingName);
  Serial.print("meetingOfficialName: ");
  Serial.println(meetingOfficialName);
  Serial.print("sessionShortName: ");
  Serial.println(sessionShortName);
  Serial.print("sessionStart: ");
  Serial.println(sessionStart);
  Serial.print("sessionState: ");
  Serial.println(sessionState);
}

void reconnect()
{
  // Loop until we're reconnected
  while (!mqttClient.connected())
  {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    // Attempt to connect
    if (mqttClient.connect(clientId.c_str()))
    {
      Serial.println("connected");
      // Once connected, publish an announcement...
      mqttClient.publish("outTopic", "hello world");
      // ... and resubscribe
      mqttClient.subscribe("formula1/upcoming-event");
    }
    else
    {
      Serial.print("failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void setup()
{
  Serial.begin(115200);

  Serial.println("Connecting to Wi-Fi...");

  simpleConnect();

  Serial.print("Successfully connected to Wi-Fi with the local IP address: ");
  Serial.println(WiFi.localIP());

  mqttClient.setBufferSize(1024);
  mqttClient.setCallback(callback);
  mqttClient.setServer(mqttServer, 1883);
}

void loop()
{
  if (!mqttClient.connected())
  {
    reconnect();
  }
  mqttClient.loop();
}
