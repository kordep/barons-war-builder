# Barons' War Builder — Changelog

## v1.2.0 — KC Generator + Robin Hood + Allied slots (2026-05-28)

### Knight Commander Generator UI
- Botões "Custom Baron" e "Custom Lord" no left panel (Baron oculto pra Poitevin/Mercenary)
- `addKnightCommander(baseId)` cria commander com `source.kind = 'kc'`
- Card do KC mostra:
  - Input pra nome customizado
  - 3 inputs de stat increase (Attack +2/step até cap 3+, Defence +2/step até 5+, Morale +1/step até 2+)
  - Counter "X/N remaining" sobre os max increases (Baron 8 / Lord 5)
  - Checkbox "Live by the Sword (+1, free)" — Chivalry sempre obrigatória
  - Slots de equipment dinâmicos baseados em mounted/dismounted
- Cost calculado: `baseCost + Σ(increases × custo) + 1 (Chivalry) [+ 1 (LbtS)] + equipment + abilities + CG upgrades`
- Validações: `KC_INC_OVER`, `KC_NO_BARON`, `KC_NO_GEN`

### Robin Hood + Merry Men DPs
- 6 novos DPs no Outlaw: Robin Hood (47 pts, RL only, Wolfshead), Maid Marian (51), Little John (26), Friar Tuck (17, conta como Priest), Allan-a-Dale (17, conta como Musician), Will Scarlett (17)
- Inherent `merry-men` documenta regra "Commander pra Combat Action only, sem Cmd range/Actions"

### Allied Retinues (parcial)
- Sistema de slots: `barons-war-builder-state-v1` (Primary) e `barons-war-builder-ally-v1` (Ally) em localStorage
- Botões "Primary | Ally" no topo do left panel
- `switchSlot(name)` salva slot atual e carrega o outro
- Slot ativo destacado em gold-light
- Painel informativo mostra summary do outro slot (faction, name, approx total)
- Budget combinado deve ser somado manualmente (limitação documentada)

---

## v1.1.0 — King John Sourcebook integrado (2026-05-28)

### Conteúdo novo
- **7 factions completas**:
  - Feudal European (updated com Battle Axe, Cavalry Spear, Squires, custos corrigidos)
  - Flemish (Militia Drill, Militia Training traits, Goedendag, Burgemeester, Brabancon ability)
  - Welsh (He Who Fights and Runs Away, No Shame in Defeat, Elm Bow, Knifeman, Teulu, Penteulu, Bard)
  - Outlaw (Desperate Men, Vendetta, Wolfshead/Outlawed Noble subtypes, Signaller)
  - Scottish (Exercitus Scoticanus, Horseless Classes 20% Rabble, Galwegians, Lowlanders)
  - Poitevin (Paragons of Chivalry, Proud and Quarrelsome, Paladins, Troubadour, Jongleur, no Baron)
  - Mercenary (Incendiaries, Paid Hirelings, Mercenary Company Brabancon/Flemish/Gascon, Old Hand, no Baron)
- **17 Dramatis Personae** (3 updated + 14 new): King John, William Marshal, Hubert de Burgh, William Longespée, William de Warenne, Peter des Roches, Faulkes de Breauté, William of Cassingham, King Philip II, Prince Louis, King Alexander II, Stephen Langton, Robert fitzWalter, Thomas of Perche, Fulk fitzWarin, Eustace the Monk, Rhys "Ieuanc"
- **Novas armas**: Cavalry Spear (1), Dual Daggers (2), Dane Axe (3) + Pony mount
- **5 novas Purchasable Abilities**: Pious Air, Prelate, Rebel, Skilled Spearmen + Gutter Thug restringido a Green/Irregular
- **CG upgrades faction-exclusive**: Troubadour, Jongleur (Poitevin), Bard (Welsh), Signaller (Outlaw), Old Hand (Mercenary), Oriflamme (King Philip DP), Sacred Banner (Stephen Langton DP)
- **Knifeman per-warrior upgrade** (Welsh Spearmen/Skirmishers, +3 each, max 1/3)
- **Mercenary Company** global choice (auto-aplica a Groups eligíveis)
- **Optional rule**: 1/3 max ranged toggleável

### UI
- **Faction selector** no left panel — troca de faction limpa retinue (com confirmação)
- **Tier tooltip**: explica 1/2/3 Actions
- **Range de custo** nos botões Add (ex: "Knights — 12–19 pts")
- **Footnote em CG upgrades** com citação da regra (KJ p43)
- **Warning visual** quando `upgrades > warriors`
- **Auto-bump** warriors quando adiciona upgrade que excederia
- **Mercenary Company selector** aparece só para Mercenary
- **Limit ranged toggle** com validação

### Validações novas
- `XP_GATE` para itens `(Regular+)`
- `AB_NO_MOUNT`, `AB_XP`, `AB_WREQ`, `AB_EXCL_UP`, `AB_EXCL_AB`
- `CG_UP_MUTEX` (Troubadour ↔ Jongleur ↔ Priest)
- `CG_UPGRADES_OVER_WARRIORS`
- `KNIFEMAN_CAP`, `KNIFEMAN_UNAVAILABLE`
- `MERC_COMPANY_REQUIRED` (Capitano)
- `RANGED_OVER_LIMIT` (optional)
- `RABBLE_UNDER_20` (Scottish Horseless Classes)
- Mercenary "Paid Hirelings" skip 10% Green check

### Bug fixes
- Cross-faction DPs (Robert fitzWalter, Fulk fitzWarin, Eustace the Monk, Faulkes de Breauté, Peter des Roches, Stephen Langton) agora funcionam em qualquer faction onde estão disponíveis — `addDramatisPersona()` pula troops inexistentes em `cgMadeFrom` e usa o primeiro válido.

### Refactor
- `FACTIONS` map global; `FACTION` é pointer para a faction ativa
- `setFaction(id)` reassigna pointer e atualiza state.factionId
- Dramatis Personae centralizadas em pool global (`var DP_NAME = {...}`) com `availableFactions`

### Notas
- Knight Commander Generator: dados modelados em cada faction (`knightCommanderGenerator`), mas UI ainda não construída
- Allied Retinues: documentado no painel direito, implementação completa fica pra próxima versão
- Robin Hood + Merry Men: estrutura referenciada, DPs específicos não codificados ainda

---

## v1.0.0 — Single-file HTML inicial (2026-05-27)

### Stack
- Pivot do scaffold Vite+React+TS (arquivado em `app-react-archive/`) para single-file HTML vanilla JS
- Seguindo `MASTER_BUILDER_GUIDE.md` (3-panel layout fixed-height, Cinzel/Crimson Text, localStorage, undo/redo)

### Core
- Faction Feudal European (Core book): 16 troop types, 3 Dramatis Personae (King John, William Marshal, Prince Louis), faction traits Cavalry Warfare/Infantry Screen
- Stat tables Tier 1/2/3 transcritos do PDF (visual HD)
- Catálogo wargear: Melee (Hand Weapon, Battle Axe, Improvised 2H, Spear, Falchion, Sword, Mace, Bill/Polearm, Horseman's Pick, 2H Weapon, Lance), Missile (Sling, Javelin, Bow, Crossbow), Armour (Padded, Mail), Shields (Small/Med/Large), Mounts (Horse, Barded Horse)
- 30 purchasable abilities + 10 inherent
- CG upgrades: Banner (Baron only), Pennant (Lord only), Musician, Priest

### UI
- 3 painéis fixed-height (left 280px / main flex / right 310px)
- Tema dark navy + gold heráldico, cards em parchment, fontes Cinzel + Crimson Text
- Mini-budget bar sticky via IntersectionObserver
- Undo/Redo 30 snapshots, Cmd+Z atalho
- Modal system: breakdown, shortcuts, confirm
- Toast notifications (4 tipos)
- Empty state tour de 3 passos
- Print CSS dark→B&W com break-inside: avoid em tudo que é "ficha"
- Abilities Reference + Wargear Reference no painel direito
- Página separada de print para references
- localStorage autosave debounced 300ms
- Export/Import JSON com `_rawState` lossless
- Budget sticky no topo do painel direito

### Regras de validação (18 hard + soft warnings)
- Min 1 Commander + exatamente 1 RL
- Group sizes (inf ≥4, cav ≥2)
- Experience available per troop
- Must/May choose one
- `(Regular+)` gates
- 2H ↔ Shield exclusion
- Tier ability cap (1/2/3)
- Each Purchasable Ability único por retinue
- Max (Commanders + 3) Groups com abilities
- Cmd-only / RL-only / Cavalry-only / troop-restrict
- DPs únicos + Must-be-RL
- CG composition (`cgMadeFrom`)
- CG upgrades restritos por tier (Banner/Pennant)
- Weapon Choice gate
- Budget total
- 50% Commanders + CGs cap
- 10% Greens warning

### Bug fixes
- Cards de upgrade movidos para dentro do CG card como sub-card "Upgraded Models"
- Print: removido page-break-before quando reference sections estão vazias
- Print: padding-top zerado para evitar 1ª página em branco
