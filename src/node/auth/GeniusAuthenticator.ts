import { Authenticator } from "./Authenticator"
import axios from "axios"
import express from "express"
import http from 'http'
import querystring from "querystring"
import openUrl from 'open'

export class GeniusAuthenticator implements Authenticator {

    private callbackPort = 8889

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
            const geniusClientId = process.env.GENIUS_CLIENT_ID
            const geniusClientSecret = process.env.GENIUS_CLIENT_SECRET
            if (geniusClientId == null || geniusClientId == null) {
                reject("GENIUS_CLIENT_ID or GENIUS_CLIENT_SECRET environment variables haven't been set!")
                return
            }
            this.waitForCodeOnCallbackServer().then((code)=>{
                axios.post("https://api.genius.com/oauth/token", querystring.stringify({
                    grant_type: "authorization_code",
                    code: code,
                    redirect_uri: `http://localhost:${this.callbackPort}/callback`,
                    client_id: geniusClientId,
                    client_secret: geniusClientSecret,
                })).then((response)=>{
                    resolve(response.data.access_token)
                }).catch(()=>{
                    reject("Failed to authenticate!")
                })
            })
            const authUrl = `https://api.genius.com/oauth/authorize?${querystring.stringify({
                client_id: geniusClientId,
                response_type: "code",
                redirect_uri: `http://localhost:${this.callbackPort}/callback`,
                state: "whatever",
                scope: "me",
            })}`
            openUrl(authUrl)
        })
    }
}