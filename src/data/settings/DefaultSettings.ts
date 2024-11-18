import { Settings, SettingsRepository } from "./SettingsRepository";

export class DefaultSettings implements SettingsRepository {
    getSettings(): Promise<Settings> {
        throw new Error("Method not implemented.");
    }
    updateSettings(newSettings: Settings): Promise<Settings> {
        throw new Error("Method not implemented.");
    }
}