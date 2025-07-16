import { ItemView, WorkspaceLeaf, setIcon } from 'obsidian';
import type SimpleBirthdayPlugin from '../main';
import { extractBirthdaysFromFiles, sortBirthdays } from './utils';
import type { BirthdayEntry } from '../types/birthday';

export const BIRTHDAY_VIEW_TYPE = 'birthday-sidebar-view';

export class View extends ItemView {
  readonly plugin: SimpleBirthdayPlugin;
  static instance: View | null = null;
  private _todayRow: HTMLTableRowElement | null = null;

  birthdayListEl: HTMLElement | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: SimpleBirthdayPlugin) {
    super(leaf);
	
    this.plugin = plugin;
    View.instance = this;
  }

  getViewType(): string {
    return BIRTHDAY_VIEW_TYPE;
  }

  getDisplayText(): string {
    return 'Upcoming Birthdays';
  }

  getIcon(): string {
    return 'calendar-with-checkmark';
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1] as HTMLElement | undefined;
    if (!container) return;
    container.empty();

    // Sticky action bar (outside scroll area)
    const actionBar = container.createDiv();
    actionBar.classList.add('birthday-action-bar');

    const label = actionBar.createDiv({ text: 'Birthdays' });
    label.classList.add('birthday-action-bar__label');

    const actions = actionBar.createDiv();
    actions.classList.add('birthday-action-bar__actions');

    const updateBtn = actions.createEl('button', { attr: { 'aria-label': 'Update' } }) as HTMLButtonElement;
    setIcon(updateBtn, 'refresh-ccw');
    updateBtn.onclick = (): void => {
      this.renderBirthdays();
    };

    const gotoTodayBtn = actions.createEl('button', { attr: { 'aria-label': 'Go to Today' } }) as HTMLButtonElement;
    setIcon(gotoTodayBtn, 'arrow-down-circle');
    gotoTodayBtn.onclick = (): void => {
      this.scrollToToday();
    };

    this.birthdayListEl = container.createDiv();
    this.birthdayListEl.classList.add('birthday-list');
    this.renderBirthdays();
  }

  async renderBirthdays(): Promise<void> {
    if (!this.birthdayListEl) {
		return;
	}

    this.birthdayListEl.empty();

	const files = this.plugin.app.vault.getMarkdownFiles();
    const birthdays = await extractBirthdaysFromFiles(files, this.plugin.app);
    const sortedBirthdays = sortBirthdays(birthdays);

    if (sortedBirthdays.length === 0) {
      this.birthdayListEl.createDiv({ text: 'No upcoming birthdays found.' });
      
	  return;
    }

    const flexContainer = this.birthdayListEl.createDiv();
    flexContainer.classList.add('birthday-list__flex');

    const scrollContainer = flexContainer.createDiv();
    scrollContainer.classList.add('birthday-list__scroll');

    const table = scrollContainer.createEl('table');
    table.classList.add('birthday-table');
    const tbody = table.createEl('tbody');

    let lastMonth: string | null = null;
    const todayMoment = window.moment();
    let todayRow: HTMLTableRowElement | null = null;
    let todayRowInserted = false;

    sortedBirthdays.forEach((b: BirthdayEntry) => {
      const [month, day] = b.date.split(' ');
      const bdayMoment = window.moment(b.date, 'MMM DD');
      const isPast = bdayMoment.isBefore(todayMoment, 'day');
      const isCurrentMonth = bdayMoment.month() === todayMoment.month();

      if (lastMonth !== month) {
        const monthRow = tbody.createEl('tr');
        const monthHeader = monthRow.createEl('td', { text: month });

        monthHeader.colSpan = 3;
        monthHeader.classList.add('birthday-table__month-header');

        if (isPast && !isCurrentMonth) {
          monthHeader.classList.add('birthday-table__month-header--past');
        } else {
          monthHeader.classList.add('birthday-table__month-header--current');
        }

        monthRow.classList.add('birthday-table__month-row');
        lastMonth = month;
      }
      
	  // Insert fictitious today row if not already inserted and this is the first birthday >= today
      if (!todayRowInserted && bdayMoment.isSameOrAfter(todayMoment, 'day')) {
        todayRow = tbody.createEl('tr') as HTMLTableRowElement;
        todayRow.classList.add('birthday-table__today-marker', 'birthday-today-marker');

        const markerCell = todayRow.createEl('td', { text: `${todayMoment.format('MMM DD')} (Today)` });

        markerCell.colSpan = 3;
        markerCell.classList.add('birthday-table__today-marker-cell');
        todayRowInserted = true;
      }

      const row = tbody.createEl('tr') as HTMLTableRowElement;
      
	  const todayStr = todayMoment.format('MMM DD');
	  if (b.date === todayStr) {
        row.classList.add('birthday-table__row--today');
      } else if (isPast) {
        row.classList.add('birthday-table__row--past');
      }

      row.createEl('td', { text: b.date });
      
	  // Show age if year is present
      let ageText = '';
      if (b.year) {
        let birthYear = b.year.length === 2 ? (parseInt(b.year) > 30 ? 1900 + parseInt(b.year) : 2000 + parseInt(b.year)) : parseInt(b.year);
        const thisYear = todayMoment.year();
        ageText = `${thisYear - birthYear} years`;
      }
	  
      row.createEl('td', { text: ageText });

      const noteCell = row.createEl('td');
      noteCell.classList.add('birthday-table__note-cell');
      
	  const link = noteCell.createEl('a', { text: b.note });
      link.href = '#';
      link.classList.add('birthday-table__note-link');
      
	  if (b.date === todayStr) {
        link.classList.add('birthday-table__note-link--today');
      }
      
	  link.onclick = (e: MouseEvent): void => {
        e.preventDefault();
        this.plugin.app.workspace.openLinkText(b.note, '/', false);
      };
    });

    // If today row wasn't inserted (all birthdays are in the past), add it at the end
    if (!todayRowInserted) {
      todayRow = tbody.createEl('tr') as HTMLTableRowElement;
      todayRow.classList.add('birthday-table__today-marker', 'birthday-today-marker');

      const markerCell = todayRow.createEl('td', { text: `${todayMoment.format('MMM DD')} (Today)` });
	  
      markerCell.colSpan = 3;
      markerCell.classList.add('birthday-table__today-marker-cell');
    }

    this._todayRow = todayRow;
  }

  /**
   * Scrolls the birthday list to the 'today' marker row.
   */
  scrollToToday(): void {
    if (this._todayRow) {
      this._todayRow.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  /**
   * Called when the view is closed. Cleans up the DOM.
   */
  async onClose(): Promise<void> {
    View.instance = null;
    this.containerEl.empty();
  }
} 
