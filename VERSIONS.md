# Website checkpoints

- **1.0** (`v1.0`) is the original website, before the interactive 3D hero.
- **2.0** (`v2.0`) is the current version, with the animated, drag-to-rotate perfume bottle.

Both checkpoints are saved as Git tags in this repository. To preview a checkpoint locally, run `git switch --detach v1.0` or `git switch --detach v2.0`. To return to the latest website code, run `git switch main`.

When asking for a change, say “use version 1.0” or “use version 2.0”; I can work from that checkpoint and preserve the other one.

The 3D bottle uses Three.js from jsDelivr. If WebGL or that CDN is unavailable, the original hero artwork remains as a fallback.
