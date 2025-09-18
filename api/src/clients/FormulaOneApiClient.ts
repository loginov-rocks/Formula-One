export interface EventTrackerResponse {
  race: {
    meetingCountryCode: string;
    meetingCountryName: string;
    meetingLocation: string;
    meetingName: string;
    meetingOfficialName: string;
  };
  seasonContext: {
    timetables: Array<{
      gmtOffset: string;
      shortName: string;
      startTime: string;
      state: 'upcoming';
    }>;
  };
}

interface Options {
  apiKey: string;
  apiUrl: string;
  locale: string;
}

export class FormulaOneApiClient {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly locale: string;

  constructor({ apiKey, apiUrl, locale }: Options) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
    this.locale = locale;
  }

  public async getEventTracker(): Promise<EventTrackerResponse> {
    console.log('[FormulaOneApiClient] Fetching event tracker data');

    let response: Response;
    try {
      response = await fetch(`${this.apiUrl}/event-tracker`, {
        headers: {
          ApiKey: this.apiKey,
          Locale: this.locale,
        },
      });
    } catch (error) {
      console.error('[FormulaOneApiClient] Network error:', error instanceof Error ? error.message : String(error));
      throw new Error('[FormulaOneApiClient] Network connection failed');
    }

    if (!response.ok) {
      console.error(`[FormulaOneApiClient] HTTP error: ${response.status} ${response.statusText}`);
      throw new Error(`[FormulaOneApiClient] Request failed with status ${response.status}`);
    }

    let data: EventTrackerResponse;
    try {
      data = await response.json();
    } catch (error) {
      console.error('[FormulaOneApiClient] JSON parse error:', error instanceof Error ? error.message : String(error));
      throw new Error('[FormulaOneApiClient] Invalid response format');
    }

    console.log('[FormulaOneApiClient] Event tracker data fetched successfully');

    return data;
  }
}
