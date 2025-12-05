import { google } from "googleapis";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CalendarEvent {
  id: string;
  summary: string;
  start: Date;
  end: Date;
}

export class GoogleCalendarAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleCalendarAuthError";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Google Calendar client
// ─────────────────────────────────────────────────────────────────────────────

function getCalendarClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  return google.calendar({ version: "v3", auth });
}

// ─────────────────────────────────────────────────────────────────────────────
// Date utilities
// ─────────────────────────────────────────────────────────────────────────────

function getMonthBoundsISO(
  year: number,
  month: number
): { timeMin: string; timeMax: string } {
  // Start of month: first day at 00:00:00
  const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);

  // End of month: last day at 23:59:59
  const lastDay = new Date(year, month, 0).getDate();
  const endOfMonth = new Date(year, month - 1, lastDay, 23, 59, 59, 999);

  return {
    timeMin: startOfMonth.toISOString(),
    timeMax: endOfMonth.toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main function: List events for a given month
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches all events from the user's primary Google Calendar for a specific month.
 *
 * @param year - The year (e.g., 2024)
 * @param month - The month (1-12)
 * @param accessToken - The user's Google OAuth access token
 * @returns Array of calendar events with id, summary, start, and end dates
 */
export async function listEventsForMonth(
  year: number,
  month: number,
  accessToken: string
): Promise<CalendarEvent[]> {
  const calendar = getCalendarClient(accessToken);
  const { timeMin, timeMax } = getMonthBoundsISO(year, month);

  try {
    const response = await calendar.events.list({
      calendarId: "primary", // Use the user's primary calendar
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
      // Trim payload size to only what we need for import
      fields: "items(id,summary,start,end)",
      maxResults: 500,
    });

    const events = response.data.items || [];

    // Map to our simplified CalendarEvent type
    return events
      .filter((event) => {
        // Only include events that have an id and some form of start/end
        return event.id && (event.start?.dateTime || event.start?.date);
      })
      .map((event) => {
        // Handle both dateTime (regular events) and date (all-day events)
        const startDateStr = event.start?.dateTime || event.start?.date;
        const endDateStr = event.end?.dateTime || event.end?.date;

        // For all-day events (date only), parse at midnight
        const start = startDateStr
          ? new Date(startDateStr)
          : new Date();
        const end = endDateStr
          ? new Date(endDateStr)
          : start;

        return {
          id: event.id!,
          summary: event.summary || "אירוע ללא שם",
          start,
          end,
        };
      });
  } catch (error) {
    console.error("Failed to fetch Google Calendar events:", error);
    const status =
      (error as { code?: number; response?: { status?: number } })?.code ??
      (error as { code?: number; response?: { status?: number } })?.response?.status;
    if (status === 401 || status === 403) {
      throw new GoogleCalendarAuthError("Google access token is expired or revoked");
    }
    throw new Error(
      `Failed to fetch calendar events: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
