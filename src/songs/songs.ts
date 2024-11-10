import express from "express";
import axios from "axios";
import querystring from "querystring";
import openUrl from 'open';

const CLIENT_ID = "02300507b975448daab576cb6243a18c";
const CLIENT_SECRET = "a7b9f7252ea6439288a183d5d77e7daf";
const REDIRECT_URI = "http://localhost:8888/callback";

const app = express();
const port = 8888;

export interface SpotifyPlaylist {
  name: string,
  id: string,
  tracks: {
    href: string,
    count: number
  }
}

export const authorizeUser = (): Promise<string> => {
  return new Promise((resolve, reject)=>{
    app.get("/callback", async (req: any, res: any) => {
      const code = req.query.code || null;
      
      if (!code) {
        res.send("Authorization failed. No code received.");
        reject("failed!")
        return;
      }
    
      // Step 2: Exchange code for an access token
      try {
        const tokenResponse = await axios.post("https://accounts.spotify.com/api/token", querystring.stringify({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        }));
    
        const accessToken = tokenResponse.data.access_token;
        res.send("Authorization complete. You can close this window.");
        resolve(accessToken)
      } catch (error) {
        console.error("Error fetching access token:", error);
        res.send("Error fetching access token.");
        reject("failed!")
      }
    });

    app.listen(port, () => {
      console.log(`Listening on port ${port}`);
      const scope = "playlist-read-private";
      const authUrl = `https://accounts.spotify.com/authorize?${querystring.stringify({
        client_id: CLIENT_ID,
        response_type: "code",
        redirect_uri: REDIRECT_URI,
        scope: scope,
      })}`;
      
      console.log("Opening Spotify authorization URL...");
      openUrl(authUrl);
    });
  })
}

export const getUserPlaylists = async (accessToken: string): Promise<Array<SpotifyPlaylist>> => {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.status === 200) {
      return response.data.items
    } else {
      throw new Error(`Error: ${response.status} - ${response.statusText}`)
    }
  } catch (error) {
      throw error
  }
}