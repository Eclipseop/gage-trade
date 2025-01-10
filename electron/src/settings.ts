import fs from "node:fs";
import path from "node:path";

interface Settings {
  league: "standard" | "standard-hc";
  keybind: string;
}

const DEFAULT_SETTINGS: Settings = {
  league: "standard",
  keybind: "D",
};

export class SettingsManager {
  private settingsPath: string;
  private settings: Settings;

  constructor(userDataPath: string) {
    this.settingsPath = path.join(userDataPath, "settings.json");
    this.settings = this.loadSettings();
  }

  private loadSettings(): Settings {
    try {
      if (!fs.existsSync(this.settingsPath)) {
        fs.writeFileSync(
          this.settingsPath,
          JSON.stringify(DEFAULT_SETTINGS, null, 2),
        );
        return DEFAULT_SETTINGS;
      }
      return JSON.parse(fs.readFileSync(this.settingsPath, "utf-8"));
    } catch (error) {
      return DEFAULT_SETTINGS;
    }
  }

  public getSettings(): Settings {
    return this.settings;
  }

  public updateSettings(newSettings: Partial<Settings>): void {
    this.settings = { ...this.settings, ...newSettings };
    fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2));
  }
}
