import { FORMULA_ONE_API_KEY, FORMULA_ONE_API_LOCALE, FORMULA_ONE_API_URL, MQTT_BROKER_URL, MQTT_TOPIC_UPCOMING_EVENT, PUBLISH_UPCOMING_EVENT_INTERVAL_MS } from './constants';

import { FormulaOneApiClient } from './clients/FormulaOneApiClient';
import { MqttClient } from './clients/MqttClient';
import { FormulaOneApiService } from './services/FormulaOneApiService';

let formulaOneApiService: FormulaOneApiService;
let mqttClient: MqttClient;
let publishUpcomingEventInterval: NodeJS.Timeout;

async function startApplication(): Promise<void> {
  console.log('[app] Starting Formula One API service');

  const formulaOneApiClient = new FormulaOneApiClient({
    apiKey: FORMULA_ONE_API_KEY,
    apiUrl: FORMULA_ONE_API_URL,
    locale: FORMULA_ONE_API_LOCALE,
  });

  formulaOneApiService = new FormulaOneApiService({
    apiClient: formulaOneApiClient,
  });

  mqttClient = new MqttClient({
    brokerUrl: MQTT_BROKER_URL,
  });

  console.log(`[app] Starting event publisher (interval: ${PUBLISH_UPCOMING_EVENT_INTERVAL_MS}ms)`);

  const publishUpcomingEvent = async () => {
    try {
      const upcomingEvent = await formulaOneApiService.getUpcomingEvent();
      await mqttClient.publish(MQTT_TOPIC_UPCOMING_EVENT, upcomingEvent);
    } catch (error) {
      console.error('[app] Failed to publish upcoming event:', error instanceof Error ? error.message : String(error));
    }
  };

  await publishUpcomingEvent();

  publishUpcomingEventInterval = setInterval(publishUpcomingEvent, PUBLISH_UPCOMING_EVENT_INTERVAL_MS);

  console.log('[app] Service started successfully');
}

async function stopApplication(): Promise<void> {
  console.log('[app] Shutting down gracefully...');

  if (publishUpcomingEventInterval) {
    clearInterval(publishUpcomingEventInterval);
    console.log('[app] Event publisher stopped');
  }

  if (mqttClient) {
    mqttClient.disconnect();
  }

  console.log('[app] Application stopped');
}

startApplication().catch((error) => {
  console.error('[app] Startup failed:', error.message);
  process.exit(1);
});

process.on('SIGINT', async () => {
  await stopApplication();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await stopApplication();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('[app] Uncaught exception:', error.message);
  stopApplication().finally(() => process.exit(1));
});

process.on('unhandledRejection', (reason) => {
  console.error('[app] Unhandled rejection:', reason);
  stopApplication().finally(() => process.exit(1));
});
