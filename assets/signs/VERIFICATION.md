# Sign asset verification

Run the following from the repository root after editing a sign:

```bash
node tools/generate-sign-assets.mjs
node tools/verify-assets.mjs
```

The validation confirms that all 42 sign references in `index.html` resolve to
self-contained SVG files with a `viewBox` and accessible title. It also rejects
legacy PNG files because the previous set contained downloaded HTML error pages
rather than valid imagery.

See [SOURCE.md](SOURCE.md) for the illustration and content-verification scope.
