import { App, PluginSettingTab } from 'obsidian';
import type MyPlugin from '../main';

export class SettingsTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    const infoSection = containerEl.createDiv();
    infoSection.classList.add('birthday-settings-info');

    const heading = infoSection.createEl('h3', { text: 'Simple Birthday Plugin' });
    heading.classList.add('birthday-settings-info__heading');

    const version = (this.plugin.manifest && this.plugin.manifest.version) ? this.plugin.manifest.version : 'unknown';
    const versionBlock = infoSection.createEl('pre');
    versionBlock.classList.add('birthday-settings-info__version-block');
	
    const versionCode = versionBlock.createEl('code', { text: `Version: ${version}` });
    versionCode.classList.add('birthday-settings-info__version-code');

    infoSection.createEl('p', { text: 'This plugin scans your vault for birthday tags and shows upcoming birthdays in a sidebar panel.' }).classList.add('birthday-settings-info__paragraph');
    infoSection.createEl('p', { text: 'To add a birthday, use a tag in your note in one of the following formats:' }).classList.add('birthday-settings-info__paragraph');

    const codeBlock = infoSection.createEl('pre');
    codeBlock.classList.add('birthday-settings-info__code-block');

    const syntaxCode = codeBlock.createEl('code', { text: `#birthday/MM/DD\n#birthday/YY/MM/DD\n#birthday/YYYY/MM/DD` });
    syntaxCode.classList.add('birthday-settings-info__syntax-code');

    infoSection.createEl('div', { text: 'e.g. #birthday/07/11, #birthday/86/07/11, #birthday/1986/07/11' }).classList.add('birthday-settings-info__paragraph');
    infoSection.createEl('p', { text: 'The plugin will show the person’s name as the note title, and calculate their age if a year is provided.' });
  }
} 
