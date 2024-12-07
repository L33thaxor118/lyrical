export interface Authenticator {
    getAccessToken(): Promise<string>
}