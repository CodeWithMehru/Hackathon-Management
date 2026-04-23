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
  phone_number?: string | null;
  college?: string | null;
  semester?: string | null;
  roll_number?: string | null;
  status: AttendanceStatus;
  attendance_logs: AttendanceLogs;
};

export type ManageAction = "CHECKIN" | "CHECKOUT" | "UNDO";
