import { FormulaOneApiClient } from '../clients/FormulaOneApiClient';

interface UpcomingEvent {
  meetingCountryCode: string;
  meetingCountryName: string;
  meetingLocation: string;
  meetingName: string;
  meetingOfficialName: string;
  sessionShortName: string;
  sessionStart: string;
  sessionState: string;
}

interface Options {
  apiClient: FormulaOneApiClient;
}

export class FormulaOneApiService {
  private readonly apiClient: FormulaOneApiClient;

  constructor({ apiClient }: Options) {
    this.apiClient = apiClient;
  }

  public async getUpcomingEvent(): Promise<UpcomingEvent> {
    const eventTrackerResponse = await this.apiClient.getEventTracker();
    const { race } = eventTrackerResponse;

    // TODO: Implement proper session selection logic based on event state (upcoming/current/past). Need to examine API
    // responses during live events to understand how states change. Currently selecting first session only.
    const session = eventTrackerResponse.seasonContext.timetables[0];

    console.log(`[FormulaOneApiService] Processing event: ${race.meetingName} - ${session.shortName}`);

    return {
      meetingCountryCode: race.meetingCountryCode,
      meetingCountryName: race.meetingCountryName,
      meetingLocation: race.meetingLocation,
      meetingName: race.meetingName,
      meetingOfficialName: race.meetingOfficialName,
      sessionShortName: session.shortName,
      sessionStart: new Date(session.startTime + session.gmtOffset).toISOString(),
      sessionState: session.state,
    };
  }
}
