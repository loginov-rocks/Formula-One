import mqtt from 'mqtt';

interface Options {
  brokerUrl: string;
}

export class MqttClient {
  private readonly client: mqtt.MqttClient;

  private isConnected: boolean = false;

  constructor({ brokerUrl }: Options) {
    this.client = mqtt.connect(brokerUrl);

    this.client.on('connect', () => {
      console.log('[MqttClient] Connected to broker');
      this.isConnected = true;
    });

    this.client.on('error', (error) => {
      console.error('[MqttClient] Connection error:', error.message);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      console.log('[MqttClient] Connection closed');
      this.isConnected = false;
    });

    this.client.on('reconnect', () => {
      console.log('[MqttClient] Attempting to reconnect');
    });

    this.client.on('offline', () => {
      console.warn('[MqttClient] Client offline');
      this.isConnected = false;
    });
  }

  public disconnect(): void {
    this.client.end();
    this.isConnected = false;
    console.log('[MqttClient] Client disconnected');
  }

  public async publish(topic: string, data: unknown): Promise<void> {
    if (!this.isConnected) {
      throw new Error('[MqttClient] Client not connected');
    }

    const message = JSON.stringify(data);

    return new Promise((resolve, reject) => {
      this.client.publish(topic, message, (error) => {
        if (error) {
          console.error(`[MqttClient] Publish failed for topic '${topic}':`, error.message);
          reject(error);
        } else {
          console.log(`[MqttClient] Published to topic '${topic}'`);
          resolve();
        }
      });
    });
  }
}
