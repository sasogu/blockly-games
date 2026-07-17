![Blockly Games](https://raw.githubusercontent.com/wiki/google/blockly-games/title.png)

Google's Blockly Games is a series of educational games that teach programming.
It is based on the [Blockly](https://developers.google.com/blockly/) library.
All code is free and open source.

**The games are available at https://blockly.games/**

**The developer's site is at https://github.com/google/blockly-games/wiki**

## Edutictac static deployment

The Edutictac deployment serves `appengine/` as static files from nginx at
`https://blockly.edutictac.es/`.

Each game has both a top-level HTML file, such as `maze.html`, and an asset
directory with the same basename, such as `maze/`.  On a plain static nginx
host, `/maze/` resolves to the directory and returns `403 Forbidden` unless the
directory contains an index file.  The small `index.html` files inside the game
directories redirect `/game/?lang=...` to `../game.html?lang=...`, preserving
query strings and hashes while keeping the legacy Blockly file layout intact.
