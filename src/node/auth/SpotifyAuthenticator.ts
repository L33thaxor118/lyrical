import axios from "axios"
import express from "express"
import http from 'http'
import querystring from "querystring"
import openUrl from 'open'
import { Authenticator } from "./Authenticator"

export class SpotifyAuthenticator implements Authenticator {

    private callbackPort = 8888

    private accessToken: string | null = null

    private async waitForCodeOnCallbackServer(): Promise<string> {
        return new Promise((resolve, reject)=>{
            const expressApp = express()
            const callbackServer = http.createServer(expressApp)
            expressApp.get("/callback", async (req: any, res: any) => {
                callbackServer.close()
                const code = req.query.code || null
                if (!code) {
                    res.send("Authorization failed. No code received.")
                    reject("failed to get authorization code")
                } else {
                    res.send("Authorization complete. You can close this window.")
                    resolve(code)
                }
            })
            callbackServer.listen(this.callbackPort)
        })
    }

    async getAccessToken(): Promise<string> {
        return new Promise((resolve, reject)=>{
            if (this.accessToken != null) {
                resolve(this.accessToken)
                return
            }
            if (process.env.SPOTIFY_CLIENT_ID == null || process.env.SPOTIFY_CLIENT_SECRET == null) {
                reject("SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET environment variables haven't been set!")
                return
            }
            this.waitForCodeOnCallbackServer().then((code)=>{
                axios.post("https://accounts.spotify.com/api/token", querystring.stringify({
                    grant_type: "authorization_code",
                    code: code,
                    redirect_uri: `http://localhost:${this.callbackPort}/callback`,
                    client_id: process.env.SPOTIFY_CLIENT_ID,
                    client_secret: process.env.SPOTIFY_CLIENT_SECRET,
                })).then((response)=>{
                    this.accessToken = response.data.access_token
                    resolve(response.data.access_token)
                }).catch(()=>{
                    reject("Failed to authenticate!")
                })
            })
            const authUrl = `https://accounts.spotify.com/authorize?${querystring.stringify({
                client_id: process.env.SPOTIFY_CLIENT_ID,
                response_type: "code",
                redirect_uri: `http://localhost:${this.callbackPort}/callback`,
                scope: "playlist-read-private",
            })}`
            openUrl(authUrl)
        })
    }
}

export { Authenticator }
