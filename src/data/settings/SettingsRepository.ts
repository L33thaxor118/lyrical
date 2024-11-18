export interface SettingsRepository {
    getSettings(): Promise<Settings>
    updateSettings(newSettings: Settings): Promise<Settings>
}

export interface Settings {
    loadedPlaylistName?: String
}