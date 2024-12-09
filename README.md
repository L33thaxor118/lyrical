<pre>
<span style="color: lime">
▗▖   ▄   ▄  ▄▄▄ ▄ ▗▞▀▘▗▞▀▜▌█ 
▐▌   █   █ █    ▄ ▝▚▄▖▝▚▄▟▌█ 
▐▌    ▀▀▀█ █    █          █ 
▐▙▄▄▖▄   █      █          █ 
      ▀▀▀                    
</span>
</pre>

Command-line tool that lets you connect to your Spotify playlists and discover songs with lyrics that match the meaning of your queries. Leveraging the capabilities of a large language model, Lyrical analyzes the semantic meaning of your input to find songs with lyrics that resonate with your query.

## Prerequisites
1. Node v18.0.0+
2. Docker

## Run
1. Install dependencies: `npm i`
2. Build required services: `npm run buildservices`
3. Start required services: `npm run startservices` 
    1. Give the `lyrical_nlp_server` container some time to start up. It may take a few minutes before its ready to handle requests.
4. To test on mock data: `npm test`
5. To run: `npm start`

## Notes
- I have included a jupyter notebook called `test.ipynb` so you can play around with the python code which does lyrics preprocessing and encoding work with an LLM.
- If you don't wait a few minutes when starting the docker containers (see 3.i above), you might get the following error: `Error: socket hang up. Shutting down.`