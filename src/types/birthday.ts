export interface BirthdayEntry {
  date: string;
  note: string;
  year?: string;
}

export interface GetUpcomingBirthdaysOptions {
  all?: boolean;
} 
