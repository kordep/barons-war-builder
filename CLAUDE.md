# Barons' War Builder — Project Context

> **Purpose**: Tudo que uma nova sessão Claude precisa para continuar esse projeto sem reler a conversa toda.
> **Last updated**: 2026-05-28 (v1.2.0 — KC Generator + Robin Hood + Allied slots)
> **Current version**: `1.2.0`

## 1. O que é

Aplicação single-file HTML (~5300 linhas, ~272KB) para montar **retinues** (listas de exército) para o wargame *The Barons' War 2nd Edition* (Andy Hobday / Warhost / Wargames Atlantic). O usuário (PK) é jogador e quer um construtor que:

- Suporte todas as 7 factions do Core book + King John Sourcebook
- Valide regras de construção (tamanhos mínimos, % cap, abilities, equipamento, custos)
- Imprima a ficha do retinue
- Persista via localStorage
- Funcione zero-build: abre HTML, roda

**Arquivo principal**: `barons-war-builder.html`

**Fontes da regra**:
- `Barons+War+2nd+edition+digital.pdf` (Core book, 154 páginas)
- `Barons' War - King John Sourcebook (2nd Ed).pdf` (Sourcebook, 248 páginas)
- `extracted/` — texto e imagens HD extraídos pra referência

## 2. Filosofia (segue MASTER_BUILDER_GUIDE do PK)

- **Single-file HTML** (CSS + HTML + JS num único `.html`)
- **Vanilla JS** — zero framework
- **Desktop-first** — 3 painéis fixed-height
- **Cinzel + Crimson Text** (fontes medievais), tema dark navy + gold
- **Print-ready** desde o dia 1
- **State no objeto global `S`** + `render()` orquestrador
- **`innerHTML` com string concatenation** (não DOM API direta)
- **`escHtml()` / `escAttr()`** em todo conteúdo dinâmico
- **NUNCA usar `??` ou `?.`** (esprima ES2017)
- **CSS append-only** — adicionar bloco no final do `<style>` com `/* ═══ vX.Y.Z additions ═══ */`

## 3. Estrutura do estado `S`

```javascript
var S = {
  armyName: 'My Retinue',
  pointLimit: 500,
  factionId: 'feudal-european',    // 7 opções
  mercenaryCompany: null,           // 'brabancon' | 'flemish' | 'gascon' — só Mercenary
  limitRanged: false,               // Optional rule 1/3 ranged
  groups: [],                       // array de Group
  commanders: [],                   // array de Commander
  _uid: 1
};
```

**Group** = unidade de Warriors idênticos:
```javascript
{
  id: <uid>,
  troopId: 'knights',                // referência a um troop da faction
  experience: 'regular',             // green | irregular | regular | veteran
  warriors: 6,                       // ≥ 4 inf / ≥ 2 cav
  equipment: { weaponIds: ['sword'], armourId: 'mail', shieldId: 'medium-shield', mountId: null },
  abilities: [],                    // purchasable abilities IDs
  commanderId: null,                // se for CG, aponta para o Commander
  knifemanCount: 0,                 // Welsh-specific upgrade
  companyApplied: false             // Mercenary Company per-group flag
}
```

**Commander** = personagem único atrelado a um Group:
```javascript
{
  id: <uid>,
  source: { kind: 'troop', troopId: 'baron', experience: 'regular' }
         | { kind: 'dramatis', personaId: 'king-john' }
         | { kind: 'kc', baseId: 'kc-baron', statIncreases: {attack:2,defence:0,morale:3}, nameOverride: '' },
  equipment: {...},
  abilities: [],                    // purchasable abilities
  cgUpgrades: ['banner','musician'], // banner/pennant/musician/priest + faction-specific
  isLeader: true,                   // exatamente 1 RL no retinue
  groupId: <uid>                    // GroupState ID do CG
}
```

## 4. Data layout

### Factions (`FACTIONS` map, 7 entradas)
Cada `FACTION_*` tem:
- `id`, `name`, `factionTraits`, `tiers` (1/2/3 stat tables)
- `weapons`, `armour`, `shields`, `mounts`, `cgUpgrades`
- `inherentAbilities` (map id→{name,cost,effect})
- `purchasableAbilities` (array; universais ao sourcebook)
- `retinueSpecificAbilities` (array; só dessa faction, podem ser compradas múltiplas vezes)
- `troops` (array; cada troop tem cost por experience, slots, inherent refs)
- `dramatisPersonae` (array de refs ao pool global)
- `knightCommanderGenerator` (estrutura, UI ainda não construída)
- Flags opcionais: `noBaron` (Poitevin/Mercenary), `mercenaryCompany`

### Dramatis Personae (17 total, pool global)
Definidos como `var DP_NAME = {...}` no topo, com `availableFactions: [...]` listando onde podem ser usados. Após declarações, cada faction recebe `dramatisPersonae = [DP_X, DP_Y, ...]`.

Lista:
- **Feudal European** (14): King John, William Marshal, Hubert de Burgh, William Longespée, William de Warenne, Peter des Roches, Faulkes de Breauté, King Philip II, Prince Louis, King Alexander II, Stephen Langton, Robert fitzWalter, Thomas of Perche, Fulk fitzWarin
- **Flemish** (2): Peter des Roches, Stephen Langton
- **Poitevin** (3): King John, Peter des Roches, Stephen Langton
- **Mercenary** (2): Faulkes de Breauté, Eustace the Monk
- **Scottish** (1): King Alexander II
- **Welsh** (1): Rhys "Ieuanc"
- **Outlaw** (4): William of Cassingham, Robert fitzWalter, Fulk fitzWarin, Eustace the Monk

DPs cross-faction (ex: Robert fitzWalter em FE OU Outlaw) têm `cgMadeFrom` listando troops de várias factions; `addDramatisPersona()` pula os que não existem na faction atual.

## 5. Validações (engine)

Function `validate()` retorna `{ ok, errors, warnings, totals }`. Regras implementadas:

| Code | Severity | Description |
|------|----------|-------------|
| NO_COMMANDER | err | Retinue precisa ≥1 Commander |
| NO_RL / MULTIPLE_RL | err | Exatamente 1 Retinue Leader |
| EXPERIENCE_UNAVAILABLE | err | Troop não tem esse experience level |
| GROUP_TOO_SMALL | err | Infantry <4 / Cavalry <2 |
| SLOT_MISSING / EQUIPMENT_NOT_ALLOWED | err | Must/May choose validation |
| EXPERIENCE_GATE (XP_GATE) | err | Item `(Regular+)` em XP menor |
| SHIELD_WITH_2H / SHIELD_WITH_BILL | err | Mutuamente exclusivos |
| TIER_AB_CAP | err | Warrior compra max(Tier) abilities |
| AB_CMD_ONLY, AB_RL_ONLY, AB_CAV, AB_NO_MOUNT, AB_TROOP, AB_XP, AB_NO_ARMOUR, AB_NO_SHIELD, AB_SHIELD, AB_WKIND, AB_WREQ | err | Per-ability gates |
| AB_EXCL_UP, AB_EXCL_AB | err | Mutuamente exclusivas (Pious Air/Prelate/Priest) |
| MULTI_WEAPON_NO_CHOICE / WEAPON_CHOICE_MISMATCH | err | Múltiplas armas requer Weapon Choice |
| DP_NO_EXTRA_ABILITIES | err | Dramatis não compra abilities |
| DP_MUST_BE_RL | err | DPs que devem ser RL |
| DP_DUPLICATE | err | DP único por mesa |
| CG_TROOP | err | CG não respeita `cgMadeFrom` |
| CG_UP_BAD | err | Upgrade não disponível para esse Commander |
| CG_UP_MUTEX | err | Troubadour ↔ Jongleur ↔ Priest no Poitevin |
| CG_UPGRADE_DUPLICATE | err | Upgrade duplicado |
| CG_UPGRADES_OVER_WARRIORS | err | Mais upgrades que warriors no CG |
| CMD_AB_CAP | err | Commander max abilities (Tier 2/3) |
| ABILITY_DUPLICATE | err | Purchasable só 1× por retinue |
| TOO_MANY_GROUPS_WITH_ABILITIES | err | Max (Commanders + 3) Groups com abilities |
| KNIFEMAN_CAP / KNIFEMAN_UNAVAILABLE | err | Welsh Knifemen ≤ 1/3 warriors |
| MERC_COMPANY_REQUIRED | err | Capitano exige Mercenary Company set |
| BUDGET_OVER | err | Total > budget |
| CMD_OVER_50 | err | Commanders + CGs > 50% total |
| GREEN_UNDER_10 | warn | < 10% Greens (default) |
| RABBLE_UNDER_20 | warn | < 20% Rabble (Scottish Horseless Classes substitui o 10% Green) |
| RANGED_OVER_LIMIT | err | Optional 1/3 ranged toggleável |

Mercenary "Paid Hirelings" trait pula a validação 10% Greens.

## 6. UI layout

```
┌────────────────────────────────────────────────────────────────┐
│ 🏰 Header (navy+gold, 70px)                                    │
├─────────────────┬──────────────────────────┬───────────────────┤
│ LEFT 280px      │  MAIN (parchment cards)  │  RIGHT 310px      │
│                 │                          │                   │
│ Retinue         │  Roster header           │  Budget (sticky)  │
│ - Faction sel.  │  ─ Commanders            │  - bar + %        │
│ - Name          │    ↳ Upgrade list +      │  - 50% cmd        │
│ - Budget        │      Command Group       │  - 10% green      │
│ - Mercenary Co. │      (Knights, etc.)     │                   │
│ - Limit ranged  │  ─ Standalone Groups     │  Validation       │
│                 │                          │                   │
│ Add Commander   │                          │  Faction Traits   │
│ Add DP          │                          │  Abilities Ref    │
│ Add Group       │                          │  Wargear Ref      │
│                 │                          │  Retinue Rules    │
│ Actions         │                          │                   │
│ - Breakdown     │                          │                   │
│ - Print         │                          │                   │
│ - Export/Import │                          │                   │
│ - Undo/Redo     │                          │                   │
│ - Clear         │                          │                   │
└─────────────────┴──────────────────────────┴───────────────────┘
```

Mini-budget bar sticky no topo aparece quando `#roster-sentinel` sai do viewport do `#main-panel`.

## 7. Convenções importantes

### CSS
- Variáveis em `:root`: `--bg`, `--panel`, `--gold`, `--gold-light`, `--gold-soft`, `--red`, `--blue`, `--parchment`, `--ink`
- Cards de unidade em parchment (`var(--parchment)`)
- Header dos cards em gradient escuro

### State mutations
- **SEMPRE `pushHistory()` antes de mutar `S`**
- **SEMPRE `render()` ao final** (re-render completo, preserva foco)
- `saveState()` é chamado dentro de `render()` (debounced 300ms)
- Use `findById(arr, id)` ao invés de `arr.find()` para compat ES5

### Render helpers chave
- `renderLeft()` — popula seletores e botões Add
- `renderMain()` — itera Commanders+CGs e Groups standalone
- `renderRight()` — Budget sticky, Validation, refs
- `renderGroupCard(g, isCG, commander?)` — card de unidade
- `renderCommanderCard(c)` — card de Commander
- `renderWargearSubCard(equipment)` — sub-card "Wargear" dentro do card
- `renderUpgradedModelsSubCard(c, hostTroop)` — Banner/Pennant/Musician/Priest dentro do CG card

### Faction switching
`setFaction(id)` reassigna `FACTION = FACTIONS[id]`. Switching faction LIMPA `S.groups`/`S.commanders` (troopIds são per-faction). Confirma com modal antes.

### DP cross-faction fix
`addDramatisPersona()` itera `dp.cgMadeFrom` e pega o **primeiro troop que existe na faction atual** via `getTroop(id)`. Resolve casos como Robert fitzWalter em Outlaw (pula 'knights', acha 'outlawed-serjeants').

## 8. Features implementadas

### Tier 1 (v1.0)
- 3-panel layout fixed-height
- Faction selector (7 factions)
- Add Group / Commander / DP
- Profile + equipment + abilities + CG upgrades
- Per-card validation in real-time
- Budget bar + 50% Cmd cap + 10% Green warning
- localStorage autosave (debounced 300ms)
- Export/Import JSON com `_rawState`
- Print CSS (dark→B&W) com break-inside: avoid
- Mini-budget bar sticky

### Tier 2 (v1.0)
- Undo/Redo (30 snapshots, Cmd+Z / Cmd+Shift+Z)
- Toast notifications (ok/warn/bad/save)
- Modal system (breakdown, shortcuts, confirm)
- Keyboard shortcuts (`?`, `Esc`, `Cmd+P`, `Cmd+S`)
- Empty state tour

### Tier 3 (v1.0)
- Abilities Reference (inherent + purchasable + DP unique) no painel direito + página de print
- Wargear Reference (weapons + armour + shields + mounts em uso) idem
- Upgraded Models sub-card dentro do CG (Banner/Pennant/Musician/Priest)
- Auto-bump warriors quando adiciona upgrade

### Tier KJ Sourcebook (v1.1)
- 7 factions completas (FE updated, Flemish, Welsh, Outlaw, Scottish, Poitevin, Mercenary)
- 17 Dramatis Personae (3 updated + 14 new)
- Novas armas: Cavalry Spear, Dual Daggers, Dane Axe + Pony
- Goedendag (Flemish), Elm Bow (Welsh) faction-exclusive
- 5 novas Purchasable Abilities (Pious Air, Prelate, Rebel, Skilled Spearmen, Gutter Thug restringido)
- CG upgrades faction-exclusive: Troubadour, Jongleur, Bard, Signaller, Old Hand, Oriflamme, Sacred Banner
- Knifeman per-warrior upgrade (Welsh)
- Mercenary Company global (Brabancon / Flemish / Gascon)
- Optional rule: 1/3 max ranged

## 9. Limitações conhecidas

1. **Bigger Battles (Pitched Battle)** — Só documentado no painel direito.
2. **Mercenary Company** — Auto-aplica a todos os Groups eligíveis. Não tem opt-in/opt-out per group (simplificação).
3. **Faction-specific CG upgrades** — Validation por mutex existe, mas a UI poderia destacar visualmente quais não combinam.
4. **Allied Retinues** — Implementação parcial via slots persistidos (Primary/Ally em localStorage keys separadas). Switch entre slots preserva o outro. Budget combinado mostrado como info, não somado automaticamente. Para combined-mode "in-place" com tabs verdadeiros, exigiria refactor profundo.
5. **KC Generator equipment slots** — Construídos dinamicamente baseado em mounted/dismounted, mas as restrições de "Shield unless 2H/Bill/Improvised" são genéricas e não exatamente as do KJ p160. Funcional, mas pode ter edge cases.

## 10. Estrutura de arquivos

```
Barons War Builder/
├── barons-war-builder.html         ← THE APP (~5300 lines, ~272KB)
├── CLAUDE.md                       ← Este arquivo
├── CHANGELOG.md                    ← Histórico de versões
├── CONVERSA-HISTORICO.md           ← Resumo das sessões
├── Barons+War+2nd+edition+digital.pdf
├── Barons' War - King John Sourcebook (2nd Ed).pdf
├── extracted/                      ← Texto + PNGs HD dos PDFs (referência)
├── app-react-archive/              ← Tentativa inicial Vite+React (arquivada)
└── app/                            ← Reservado (vazio)
```

## 11. Workflow de desenvolvimento

### Rodar localmente
```bash
cd "/Users/pk/Pklaude/Pessoal/Barons War Builder"
python3 -m http.server 5173
# → http://localhost:5173/barons-war-builder.html
```

### Syntax check (sem instalar nada)
```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('barons-war-builder.html', 'utf8');
const m = html.match(/<script>([\\s\\S]*?)<\\/script>/);
try { new Function(m[1]); console.log('OK'); } catch(e) { console.log('ERR:', e.message); }
"
```

### Adicionar nova faction
1. Definir `var FACTION_NOMENOVO = { id, name, factionTraits, tiers, weapons, armour, shields, mounts, cgUpgrades, inherentAbilities, purchasableAbilities, retinueSpecificAbilities, troops, dramatisPersonae:[] }`
2. Adicionar ao `FACTIONS` map
3. Adicionar ID ao array de keys em `renderLeft()` (faction-select)
4. Atualizar localStorage migration se necessário

### Adicionar novo DP
1. Definir `var DP_NOME = { id, name, tier, mounted, fixedCost, availableFactions:[...], stats, inherent, weapons, armour, shield, mount, cgUpgrades, cgMadeFrom, uniqueAbilities }`
2. Adicionar ao array `dramatisPersonae` das factions onde aparece

### Bumping de versão
1. Atualizar `APP_VERSION` no JS
2. Atualizar version badge no header
3. Adicionar entrada no CHANGELOG.md
4. Atualizar este CLAUDE.md (linha "Current version")

## 12. Lições aprendidas (PK-specific)

- **PK prefere tipografia limpa, não pills/chips coloridos**. Layout manuscrito.
- **Não inventar features** — só implementar o que o livro especifica.
- **Comunicação em português, código em inglês**.
- **Verificar PDFs em HD** quando os dados estão em tabelas (`pdftoppm -r 200`).
- **Confirmar custos** contra o sourcebook — o Core book e KJ têm pequenas correções de preço (ex: Baron Veteran 43→42, Knight Irregular 13→12).
- **DPs cross-faction**: `cgMadeFrom` lista troops de múltiplas factions; o picker deve filtrar pelas existentes.
- **Mercenary Company não é purchasable** — é inherent ability adicional gratuita (no sentido de slot), mas com cost por warrior.

---

*The Barons' War é © Andy Hobday / Warhost / Wargames Atlantic. This builder is an unofficial, non-commercial companion tool.*
