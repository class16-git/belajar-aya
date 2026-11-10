# Slice C (part 1): age 4–5 and Kindergarten caregiver-led cards (review guide)

Status: **implemented, agent-checked, awaiting human content review.** Hidden in production until approved.

Every non-Islamic age 4–5 and Kindergarten objective now has a printable bilingual card, except the two
Kindergarten on-screen maths objectives (`math.k.bonds-20`, `math.k.tens-ones-intro`), which are part 2.

| Card | Objective |
|---|---|
| `lesson-prek-sound-letter-001` Touch-and-say letters | `mont.age4_5.sound-letter` |
| `lesson-prek-movable-letters-001` Build a word | `mont.age4_5.movable-letters` |
| `lesson-prek-world-cycles-001` Globe and seed-to-plant | `mont.age4_5.continents-life-cycles` |
| `lesson-prek-compose-10-001` Hiding hands | `math.age4_5.compose-10` |
| `lesson-prek-add-sub-objects-001` Toy bus stories | `math.age4_5.add-sub-objects` |
| `lesson-robo-prek-adult-robot-001` Program the grown-up robot | `robo.age4_5.adult-robot-algorithm` |
| `lesson-robo-prek-gears-001` Turning lids (physical safety flag) | `robo.age4_5.gears-building` |
| `lesson-k-read-words-001` Word and object match | `mont.k.read-simple-words` (offline first; on-screen reading needs audio/pictures) |
| `lesson-k-maps-plants-001` My room map and plant parts | `mont.k.maps-botany` |
| `lesson-k-routines-001` My day in order | `mont.k.time-routines` |
| `lesson-k-picture-problems-001` Draw the story | `math.k.picture-word-problems` |
| `lesson-robo-k-loops-001` Repeat dance | `robo.k.loops-repeat` |
| `lesson-robo-k-linkage-001` Card grabber arm (physical safety flag) | `robo.k.linkages` |

## Safety choices
No small parts (gears are large jar lids on a towel, not toy gears); adult does all cutting and handles paper
fasteners with legs folded flat; non-toxic, thorn-free plants and hand-washing; fine sandpaper only.

## Who sees them
Card suggestions follow age only after the parent confirms the age transition: 3 → toddler + age 3–4,
4 → age 3–4 + age 4–5, 5+ → age 4–5 + Kindergarten (`cardBandsFor`, unit- and E2E-tested). The card library shows
all reviewed cards to parents.

## Part 2 (next)
Kindergarten on-screen maths: number bonds to 20 and teen numbers as "ten and some ones". This needs a
Kindergarten interactive band (today Kindergarten uses the Grade 1 lessons), so it is a separate change.

## Approve when happy
`pnpm content:approve -- --reviewer "<initials>" --role parent lesson-prek-sound-letter-001 lesson-prek-movable-letters-001 lesson-prek-world-cycles-001 lesson-prek-compose-10-001 lesson-prek-add-sub-objects-001 lesson-robo-prek-adult-robot-001 lesson-robo-prek-gears-001 lesson-k-read-words-001 lesson-k-maps-plants-001 lesson-k-routines-001 lesson-k-picture-problems-001 lesson-robo-k-loops-001 lesson-robo-k-linkage-001`
