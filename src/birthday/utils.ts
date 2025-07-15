import { TFile, App } from 'obsidian';
import type { BirthdayEntry } from '../types/birthday';

export const BIRTHDAY_TAG_REGEX = /#birthday\/(\d{2,4})?(?:\/)?(\d{2})\/(\d{2})/g;

/**
 * Extracts birthday entries from a list of markdown files.
 * 
 * @param files Array of TFile objects
 * @param app Obsidian App instance
 * @returns Array of BirthdayEntry
 */
export async function extractBirthdaysFromFiles(files: readonly TFile[], app: App): Promise<readonly BirthdayEntry[]> {
  const birthdays: BirthdayEntry[] = [];
  for (const file of files) {
    const content = await app.vault.read(file);
    let match: RegExpExecArray | null;
    BIRTHDAY_TAG_REGEX.lastIndex = 0;
	
    while ((match = BIRTHDAY_TAG_REGEX.exec(content)) !== null) {
      const [, year, mm, dd] = match;
      const displayDate = window.moment(`${mm}-${dd}`, 'MM-DD');
      birthdays.push({ date: displayDate.format('MMM DD'), note: file.basename, year });
    }
  }
  return birthdays;
}

/**
 * Sorts birthday entries by date (month and day).
 * 
 * @param birthdays Array of BirthdayEntry
 * @returns Sorted array of BirthdayEntry
 */
export function sortBirthdays(birthdays: readonly BirthdayEntry[]): BirthdayEntry[] {
  return [...birthdays].sort((a, b) => window.moment(a.date, 'MMM DD').diff(window.moment(b.date, 'MMM DD')));
} 
