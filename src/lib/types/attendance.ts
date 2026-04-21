export type AttendanceStatus = "Registered" | "Checked In" | "Checked Out";

/** Per-session timestamps inside attendance_logs JSONB */
export type SessionLog = {
  checkin?: string | null;
  checkout?: string | null;
};

export type AttendanceLogs = Record<string, SessionLog>;

export type HackathonAttendanceRow = {
  id: string;
  name: string;
  email: string;
  status: AttendanceStatus;
  attendance_logs: AttendanceLogs;
};

export type ManageAction = "CHECKIN" | "CHECKOUT" | "UNDO";
