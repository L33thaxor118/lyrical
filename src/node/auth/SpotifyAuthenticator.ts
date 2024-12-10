import axios from "axios"
import express from "express"
import http from 'http'
import querystring from "querystring"
import openUrl from 'open'
import { Authenticator } from "./Authenticator.js"
import pkceChallenge from "pkce-challenge"

export class SpotifyAuthenticator implements Authenticator {

    private callbackPort = 8888
    private clientId = "02300507b975448daab576cb6243a18c"

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
        if (this.accessToken != null) {
            return this.accessToken
        }
        const challenge = await pkceChallenge(64)
        return new Promise((resolve, reject)=>{
            this.waitForCodeOnCallbackServer().then((code)=>{
                axios.post("https://accounts.spotify.com/api/token", querystring.stringify({
                    grant_type: "authorization_code",
                    code: code,
                    redirect_uri: `http://localhost:${this.callbackPort}/callback`,
                    client_id: this.clientId,
                    code_verifier: challenge.code_verifier
                })).then((response)=>{
                    this.accessToken = response.data.access_token
                    resolve(response.data.access_token)
                }).catch((e)=>{
                    console.log(e)
                    reject("Failed to authenticate!")
                })
            })
            const authUrl = `https://accounts.spotify.com/authorize?${querystring.stringify({
                client_id: this.clientId,
                response_type: "code",
                redirect_uri: `http://localhost:${this.callbackPort}/callback`,
                scope: "playlist-read-private",
                code_challenge_method: 'S256',
                code_challenge: challenge.code_challenge,
            })}`
            openUrl(authUrl)
        })
    }
}

export { Authenticator }
