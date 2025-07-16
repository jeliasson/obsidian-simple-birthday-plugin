import { Plugin, WorkspaceLeaf } from 'obsidian';
import { View, BIRTHDAY_VIEW_TYPE } from './birthday/view';
import { SettingsTab } from './birthday/settings';
import { extractBirthdaysFromFiles, sortBirthdays } from './birthday/utils';
import type { BirthdayEntry, GetUpcomingBirthdaysOptions } from './types/birthday';

interface PluginSettings {}

const DEFAULT_SETTINGS: PluginSettings = {};

export default class SimpleBirthdayPlugin extends Plugin {
  settings: PluginSettings = {};

  async onload(): Promise<void> {
    await this.loadSettings();
    this.registerView(
      BIRTHDAY_VIEW_TYPE,
      (leaf: WorkspaceLeaf) => new View(leaf, this)
    );
	
    this.addRibbonIcon(View.prototype.getIcon(), 'Show Upcoming Birthdays', async () => {
      this.activateBirthdayView();
    });

    this.addSettingTab(new SettingsTab(this.app, this));

    this.registerEvent(this.app.vault.on('create', () => View.instance?.renderBirthdays()));
    this.registerEvent(this.app.vault.on('rename', () => View.instance?.renderBirthdays()));
    this.registerEvent(this.app.vault.on('delete', () => View.instance?.renderBirthdays()));
    this.registerEvent(this.app.vault.on('modify', () => View.instance?.renderBirthdays()));
  }

  onunload(): void {}

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async activateBirthdayView(): Promise<void> {
    let leaf = this.app.workspace.getLeavesOfType(BIRTHDAY_VIEW_TYPE)[0];
    if (!leaf) {
      leaf = (this.app.workspace.getRightLeaf(false) ?? this.app.workspace.getLeftLeaf(true)) as WorkspaceLeaf;
      await leaf.setViewState({ type: BIRTHDAY_VIEW_TYPE, active: true });
    }
    this.app.workspace.revealLeaf(leaf);
  }

  async getUpcomingBirthdays(opts?: GetUpcomingBirthdaysOptions): Promise<BirthdayEntry[]> {
    const files = this.app.vault.getMarkdownFiles();
    const birthdays = await extractBirthdaysFromFiles(files, this.app);
    const sortedBirthdays = sortBirthdays(birthdays);
    if (opts?.all) return [...sortedBirthdays];
    return sortedBirthdays.slice(0, 5);
  }
}
