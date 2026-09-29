# Clipwell

A local YouTube MP3 download helper for audio you own or are authorized to save.

## Requirements

- Docker and Docker Compose

## Run

```sh
cp .env.example .env
docker compose up -d --build
```

Open http://localhost:3000 in your browser. Completed MP3 files are saved in the `downloads/` folder and are not sent back to the browser.

Set `DOWNLOAD_DIR` to change the output folder. With Docker Compose, update both the environment value and the volume destination if you want to use a different mounted folder:

```yaml
environment:
	DOWNLOAD_DIR: /app/downloads
volumes:
	- /srv/clipwell-audio:/app/downloads
```

View logs with:

```sh
docker compose logs -f
```

The Docker image installs yt-dlp with its EJS challenge scripts and uses the included Node.js runtime for YouTube JavaScript challenges. If YouTube asks for sign-in or reports that the request is from a bot, provide cookies from an account that is authorized to access the content. Export them in Netscape format, mount the file read-only, and set the cookie path in Compose:

```yaml
services:
	clipwell:
		environment:
			YT_DLP_COOKIES: /app/secrets/youtube-cookies.txt
		volumes:
			- ./downloads:/app/downloads
			- ./youtube-cookies.txt:/app/secrets/youtube-cookies.txt:ro
```

Keep the cookies file out of Git and do not expose it through the web server. Cookies can expire, and YouTube may still reject requests from a datacenter IP even when valid cookies are supplied.

Use this only for content you have the right to download. YouTube's terms and copyright rules still apply.
