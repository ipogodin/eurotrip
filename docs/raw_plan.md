# Raw plan (original request, verbatim)

Captured 2026-10-08. This is the user's unedited first message for the voting +
trip hub feature. The structured plan derived from it is in
`docs/plan-voting.md` and `docs/voting-spec.md`.

---

we are going to create additional feature to this site.

plan can be stored at docs as plan and we also can create a supplemental docs if we need

how this is going to work: our site will expose the voting system to vote for the location of rent the villa, I will provide 6-10 options that people can vote for .
Each person get it's own authentication token that will be 2 words with the dash in it. In total we have 8 people. Each person that authenticate though the link to the app gets requested to enter the invite phrase, and once the phrase is typed the cookie is placed that authenticate this person in the system.

Somewhere in config we will have a static unexposed map of the name -> secret words. The system will check these words.
Each person will have X points to vote, presumably 6, they can vote for each property up to 3 times. so 1 person can give the property 3 points max, let's say person decided to vote for the property 1 : 3 points and for the property 2 : 1 point and so on. Each property will have the number of votes from each person. The votes will be public and you can see for which properties person voted and visa versa. so we will have the view for the property and who voted for that and visa versa. person -> fav properties.
I think we can place it in a single view, just add filters on the top.

Voting will last until certain date and time, presumably this Sat 9:30 am PST time.
Once time is up, no one allowed to vote.

On the winner selection admin: me. Can select the winner property even if it does not have the most votes. But it is likely we will select the winner. It is done as new circumstances might appear during the final call.

Once the property is selected by admin, the 2nd phase of the site kicks in:
Booking and planning.

Admin have to book the property and set the dates and infor about the move in move out other plans etc.

For this time in the phase 2 I expect that every user that come to our site and authorizes can see what property is selected, what is the approximate dates, if those was no beein changed, the map of the propperty, amenities, photoes, number of bedrooms, closest beaches, attaraction and cafes ( walking and driving distances). In a separate tab probably we need to have the list of planes that is possible to book to reach this place and leave this place in / from London, Warsaw, and Frankfurt

Ask the questions.

We are creating the plan first and then going with the implementation of it, so in case of a failure nothign is lost.
Consider, and add this to agents.md, each medium size step track in files so I can stop and start claude session at any time and the work wont loose the track and we continue from the place we stopped

---

## Clarifications — 2026-10-08 (second message, verbatim)

> I just set up the plan for development, my original idea is presented in docs/raw_plan.md
> can you please review it and create an implementation plan for the site moving forward
>
> clarificaitons: yes, I will be an admin for this site, so there should be a way to mark me, Illia Pogodin as an admin in the system
>
> let me know if you have an additional questions. All documents in /docs
>
> I do not need an island selection plan after this part is implemented, the initial page should be changed to something relatable, just the note.
>
> I am expecting a good design on this site.

## Answers to follow-up questions — 2026-10-08 (verbatim)

- **Deadline if launch slips:** "Admin can extend/close"
- **Old island report:** "We remove the island selection pages and replace them with the property selection pages on the island. User might check it out on a map or in the list. The view should be renderable in the browser on mobile phone."
- **Home page:** "We have to have some tropical background, and suggestion to enter the secret code. The suggestion should contain the javascript approach that will prevent hacking the code via providing a lot of options . Tropical background should be related to canary, I can record some video or whatever necessary"
- **Design direction:** "Modern app UI"

Earlier answers (first round): storage = Upstash Redis; votes editable until
deadline and public live; phase 2 data in config files + redeploy; whole site
behind login.
