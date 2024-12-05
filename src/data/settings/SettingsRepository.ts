import { Settings } from "../../model/Settings.js"

export interface SettingsRepository {
    getSettings(): Promise<Settings>
    updateSettings(newSettings: Settings): Promise<void>
}