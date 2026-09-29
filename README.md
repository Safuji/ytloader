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

Use this only for content you have the right to download. YouTube's terms and copyright rules still apply.
