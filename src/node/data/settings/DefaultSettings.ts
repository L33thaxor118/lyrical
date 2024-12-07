import { Settings } from "../../model/Settings.js"
import { AppDatabase } from "../db/AppDatabase.js"
import { SettingsRepository } from "./SettingsRepository.js"

export class DefaultSettings implements SettingsRepository {
    constructor(
        private database: AppDatabase
    ) {}  
    
    getSettings(): Promise<Settings> {
        return this.database.getSettings()
    }
    async updateSettings(newSettings: Settings) {
        await this.database.updateSettings(newSettings)
    }
}