# Member photos (private)

Drop the photos here. **Everything in this folder except this README is
ignored by git**, because the repo is public: member photos are never
committed, and are never served from `static/`. In the app they will be
stored privately and shown only to signed-in members.

## Names

Photos are numbered versions, named with the member's `id` from `members.json`:

| File                          | What it is                                                      |
| ----------------------------- | --------------------------------------------------------------- |
| `avatars/<member-id>_1.<ext>` | The member's own photo. **This is the default avatar.**         |
| `avatars/<member-id>_2.<ext>` | The photo they get the first time they "update" their picture   |
| `avatars/<member-id>_3.<ext>` | (optional) what they get the next time, and so on               |

Every time a member "updates" their avatar they move up one version, and stay
on the last one when there are no more. Versions must run 1, 2, 3 … without
gaps. Example: `avatars/anna_1.jpg`, `avatars/anna_2.png`, `avatars/anna_3.jpg`.

- `<member-id>` is written exactly as in `members.json` (lowercase).
- `<ext>`: `jpg`, `jpeg`, `png` or `webp`; the two files may differ. iPhone
  photos are often HEIC: export or share them as JPG first.
- Exactly one file per version, and no two versions of a member may be the same picture.

## Good photos

- Face in the middle, roughly square. We crop to a circle from the centre.
- At least 256 px on the short side (512+ is sharper in the large view). Under 10 MB.

## Check

```bash
npm run avatars:check
```
