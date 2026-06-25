# Barons' War Builder

Single-file web app for building **retinues** (army lists) for the tabletop wargame *The Barons' War* (2nd Edition), set in Angevin-period England, c. 1200. Supports all seven factions from the Core book + the *King John Sourcebook*.

> **Open `barons-war-builder.html` in any modern browser.** No build step, no install.

## Features

- **All 7 factions** — Feudal European, Flemish, Poitevin, Mercenary, Scottish, Welsh, Outlaw (with Robin Hood and the Merry Men)
- **17 Dramatis Personae** grouped by allegiance (Royalist · Rebel · Outlaw)
- **Knight Commander Generator** for custom Barons / Lords
- **Two retinue slots** (Primary + Ally) with combined print
- **Live validation** — 30+ rules (commander caps, group sizes, ability gates, equipment slots, points budget, …)
- **Live A4 print preview** docked to the side
- **Parchment / Dusk theme toggle** with heraldic crests per faction
- **Undo / Redo** (30-step history), keyboard shortcuts, JSON export / import
- Persists to `localStorage` (Primary + Ally slots stored separately)

## Source rules

The data in this app is transcribed from:

- *The Barons' War: 2nd Edition* (Andy Hobday / Warhost / Wargames Atlantic)
- *The Barons' War: King John Sourcebook* (Benedict Coffin & Andy Hobday)

This is an unofficial, non-commercial companion tool. *The Barons' War* is © its respective publishers; please buy the rulebooks.

## Project layout

```
barons-war-builder.html   ← THE APP (single file)
assets/                   ← faction crests + ornamental SVGs
CLAUDE.md                 ← project context for AI assistants
CHANGELOG.md              ← version history
```

## Heraldry

Each faction has a heraldic shield drawn from period sources:

| Faction | Blazon |
|---|---|
| Feudal European | *Gules, three lions passant guardant Or* (Royal Arms of England — King John) |
| Poitevin | Lions Or on Gules (Lords of Aquitaine / Limoges) |
| Flemish | *Or, a lion rampant Sable* (Lion of Flanders) |
| Mercenary | Cinquefoil Gules on Argent (Faulkes de Breauté) |
| Scottish | *Or, a lion rampant Gules within a bordure* (Royal Lion of Scotland) |
| Welsh | Quarterly Or & Gules, four lions passant counterchanged (Llywelyn / Gwynedd) |
| Outlaw | *Vert, three arrows Or* (Robin Hood / the Greenwood) |

The header pairs King John's lions with Prince Louis's *Azure semé-de-lis Or* (Capetian France) — the two claimants to the English crown.

## Credits

Built with vanilla JS + CSS. No frameworks, no dependencies.
