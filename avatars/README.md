# Member photos (private)

Drop the photos here. **Everything in this folder except this README is
ignored by git**, because the repo is public: member photos are never
committed, and are never served from `static/`. In the app they will be
stored privately and shown only to signed-in members.

## Names

| What                      | File                              | Example                  |
| ------------------------- | --------------------------------- | ------------------------ |
| A member's real photo     | `avatars/<member-id>.<ext>`       | `avatars/anna.jpg`       |
| "Neh, this one is better" | `avatars/pool/<number>.<ext>`     | `avatars/pool/1.jpg`     |
| …for one specific person  | `avatars/pool/<member-id>.<ext>`  | `avatars/pool/anna.jpg`  |

- `<member-id>` is the `id` of the person in `members.json` (lowercase, as
  written there). Run `npm run avatars:check` to see exactly which names the
  app expects and which are still missing.
- `<ext>`: `jpg`, `jpeg`, `png` or `webp`. iPhone photos are often HEIC: export
  or share them as JPG first.
- One photo per person per folder. Don't put both `anna.jpg` and `anna.png`.

## Good photos

- Face in the middle, roughly square. We crop to a circle from the centre.
- At least 512 x 512 px (bigger is fine; we resize). Under 10 MB.

## Check

```bash
npm run avatars:check
```
