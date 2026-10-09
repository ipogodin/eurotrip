# Member photos (private)

Drop the photos here. **Everything in this folder except this README is
ignored by git**, because the repo is public: member photos are never
committed, and are never served from `static/`. In the app they will be
stored privately and shown only to signed-in members.

## Names

Two photos per member, named with the member's `id` from `members.json`:

| File                       | What it is                                                  |
| -------------------------- | ----------------------------------------------------------- |
| `avatars/<member-id>_1.<ext>` | The member's own photo. **This is the default avatar.**  |
| `avatars/<member-id>_2.<ext>` | The replacement photo for the "neh, this one is better" prank |

Example: `avatars/anna_1.jpg` and `avatars/anna_2.png`.

- `<member-id>` is written exactly as in `members.json` (lowercase).
- `<ext>`: `jpg`, `jpeg`, `png` or `webp`; the two files may differ. iPhone
  photos are often HEIC: export or share them as JPG first.
- Exactly one `_1` and one `_2` per member, and they must be different pictures.

## Good photos

- Face in the middle, roughly square. We crop to a circle from the centre.
- At least 256 px on the short side (512+ is sharper in the large view). Under 10 MB.

## Check

```bash
npm run avatars:check
```
