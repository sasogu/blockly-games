# Blockly Games for Edutictac

This repository is an Edutictac-maintained fork/deployment of
[Google Blockly Games](https://github.com/google/blockly-games), a set of
educational games that teach programming with Blockly blocks.

Production site:

- Edutictac deployment: <https://blockly.edutictac.es/>
- Upstream Blockly Games: <https://blockly.games/>
- Upstream developer docs: <https://github.com/google/blockly-games/wiki>

## Repository Layout

- `appengine/`: static site files served in production.
- `appengine/*.html`: top-level game entry points, for example `maze.html`.
- `appengine/<game>/`: generated assets and per-game static files.
- `appengine/<game>/index.html`: Edutictac static-host redirect for `/game/`
  URLs.
- `build/`: build and compression scripts.
- `json/` and `messages.json`: translation sources.
- `Makefile`: build targets for individual games and all games.
- `deploy.sh`: compiles and uploads `appengine/` to the Edutictac server.

## Requirements

The Makefile expects these tools to be available:

```sh
svn
wget
java
python
```

The deployment script also requires `rsync` and SSH access to the Edutictac
server.

## Build

Build all games:

```sh
make games
```

Build a single game:

```sh
make maze
make dance
make music
```

The generated bundles are written under `appengine/<game>/generated/`.

## Deploy

Deploy everything:

```sh
./deploy.sh
```

Deploy a single game:

```sh
./deploy.sh maze
```

The script compiles the requested target, then uploads `appengine/` to:

```text
samgua@100.69.168.122:/var/www/blockly/
```

Only Catalan, English, and Spanish generated message files are included during
upload:

```text
ca.js
en.js
es.js
```

## Static URL Handling

Blockly's original App Engine layout uses top-level entry files such as
`maze.html`, while each game also has an asset directory with the same basename,
such as `maze/`.

On nginx static hosting, `/maze/` resolves to the directory. If that directory
has no `index.html`, nginx returns `403 Forbidden`. To keep both URL styles
working, this fork includes small redirect files:

```text
appengine/dance/index.html
appengine/puzzle/index.html
appengine/maze/index.html
appengine/bird/index.html
appengine/turtle/index.html
appengine/movie/index.html
appengine/music/index.html
appengine/pond-tutor/index.html
appengine/pond-duck/index.html
```

Each redirect preserves the query string and hash, so:

```text
https://blockly.edutictac.es/maze/?lang=en
```

loads:

```text
https://blockly.edutictac.es/maze.html?lang=en
```

Do not remove these files unless nginx is changed to rewrite `/game/` URLs to
`/game.html`.

## Verification

After deployment, verify the public game URLs:

```sh
for game in dance puzzle maze bird turtle movie music pond-tutor pond-duck; do
  curl -sS -o /dev/null -w "$game/ %{http_code}\n" \
    "https://blockly.edutictac.es/$game/?lang=en"
done
```

Expected result:

```text
dance/ 200
puzzle/ 200
maze/ 200
bird/ 200
turtle/ 200
movie/ 200
music/ 200
pond-tutor/ 200
pond-duck/ 200
```

Also check the direct `.html` entry points if a game fails to load:

```sh
curl -I "https://blockly.edutictac.es/maze.html?lang=en"
```

## Notes

- Keep changes scoped to this fork unless syncing intentionally from upstream.
- The production deployment is static nginx hosting, not Google App Engine.
- Avoid committing generated or downloaded dependencies unless they are already
  part of the repository's expected layout.
