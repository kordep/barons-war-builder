# Barons' War Builder — Handoff: iPad / PWA / Deploy

> **Para:** qualquer sessão futura (ou pessoa) que precise mexer na publicação do app
> ou na versão para iPad. Última atualização: **julho/2026**.

---

## 1. Objetivo

Usar o builder **no iPad como app** (ícone na tela inicial, tela cheia, funciona
offline) **e** como **página web** normal em qualquer navegador — a mesma URL
serve os dois. Solução: empacotar o arquivo único como **PWA** e hospedar no
**GitHub Pages**.

---

## 2. Estado atual

| Item | Estado |
|------|--------|
| Repositório GitHub | ✅ **https://github.com/kordep/barons-war-builder** (público) |
| GitHub Pages | ✅ ligado, branch `main` / `(root)` |
| URL do app | ✅ **https://kordep.github.io/barons-war-builder/** |
| Manifest + Service Worker | ✅ commitados junto ao push inicial |
| Ícones (180/192/512) | ✅ gerados (crest de King John com moldura dupla dourada em fundo pergaminho) |
| Instalável no iPad (Safari) | ✅ pronto — abrir URL no Safari → Compartilhar → Adicionar à Tela de Início |

---

## 3. Arquivos da PWA

Todos ao lado do app em `Barons War Builder/`.

| Arquivo | Papel |
|---------|-------|
| `index.html` | O app. No `<head>` tem: `<link rel="manifest">`, `apple-touch-icon`, metas `apple-mobile-web-app-*`, `theme-color`. No fim do `<body>` registra `sw.js` (só sob `http://` / `https://` — em `file://` não registra, evita erro). |
| `manifest.webmanifest` | Nome (`Barons' War Builder`), short name (`Barons' War`), `start_url`/`scope` relativos (`./`), `display:standalone`, `theme_color:#5e3f86` (purpure), `background_color:#e8daa2` (parchment). |
| `sw.js` | Service worker. Cacheia o app-shell (html + manifest + 3 ícones + 14 assets) → **offline** após o primeiro carregamento. Estratégia cache-first para a própria origem; Google Fonts vai à rede (offline cai no serif local). Nome do cache: **`bw-builder-v1`**. |
| `icon-180.png` / `icon-192.png` / `icon-512.png` | Ícones do PWA — crest de King John (3 leões passant guardant Or on Gules) com moldura dupla dourada em fundo pergaminho. Gerados por Pillow (script inline). |
| `assets/*.png/*.svg` | 14 arquivos: 7 crests de facção + Prince Louis + Norman plait + roster flourish + 4 rotações da corner filigree. |

**Observação importante:** o app **não usa API e não tem segredos** — 100% client-side.
As únicas refs externas são Google Fonts (pública) e o namespace SVG (não é rede).

---

## 4. Git — como está montado

- O repo `kordep/barons-war-builder` **É** a pasta `Barons War Builder/` — o `git init`
  foi feito diretamente aqui.
- `remote origin` = `https://github.com/kordep/barons-war-builder.git`, branch `main` (tracking).
- Autenticação: Git Credential Manager (login via `gh auth`).

---

## 5. GitHub Pages

Já está ligado. Para conferir:

1. https://github.com/kordep/barons-war-builder/settings/pages
2. Source: Deploy from a branch → `main` / `(root)`
3. URL: **https://kordep.github.io/barons-war-builder/**

Republica sozinho ~1 min depois de cada `git push`.

---

## 6. Instalar no iPad

1. Abrir **https://kordep.github.io/barons-war-builder/** no **Safari** (tem que ser Safari
   para o "Add to Home Screen" do iOS — Chrome iOS não instala PWA).
2. Botão **Compartilhar** → **Adicionar à Tela de Início**.
3. Aparece o ícone (crest de King John com moldura dourada); abre em tela cheia
   (`display:standalone`) e funciona offline depois do 1º carregamento.
4. O **autosave** (`localStorage`) persiste por origem — as duas retinues
   (Primary + Ally) ficam salvas mesmo depois de fechar o app.

---

## 7. Como ATUALIZAR o app depois (workflow)

Fonte de verdade = `Barons War Builder\index.html` na pasta local.

Para publicar uma nova versão:

```bash
cd "C:\Users\T-Gamer\Desktop\PKlaude\Pessoal\Barons'War Builder\Barons War Builder"

# 1. Fazer as edições (index.html, css/js inline, assets, etc.)

# 2. BUMPAR o cache do service worker
#    Edite sw.js e troque:
#      const CACHE = 'bw-builder-v1'   →  'bw-builder-v2'   (v3, v4…)
#    Sem isso, iPad/PC não pegam a versão nova.

# 3. Commit + push
git add -A
git commit -m "Update: <descrição>"
git push
```

> ⚠️ O passo 2 (incrementar `CACHE`) é o que faz o iPad/PC pegarem a atualização —
> o service worker só troca o conteúdo cacheado quando o nome do cache muda.

Depois do push, o GitHub Pages republica sozinho em ~1 min. No iPad, abrir o app
(com internet uma vez) baixa a nova versão.

**Quando adicionar/remover assets** (imagens novas em `assets/`), atualizar
também a lista `SHELL` no `sw.js` — só o que estiver na lista é cacheado
para offline.

---

## 8. Troubleshooting

- **iPad mostra versão antiga:** faltou bumpar o `CACHE` no `sw.js`, ou abriu sem internet.
  Bumpe, push, e abra uma vez online.
- **Fontes "erradas" offline:** normal — Google Fonts (Marcellus + EB Garamond) não é
  cacheado; cai no serif local. O layout continua íntegro, só perde o toque
  medieval das fontes.
- **"Adicionar à Tela de Início" não aparece:** tem que ser no **Safari**
  (não Chrome iOS).
- **Push trava no terminal:** é a janela de login do GitHub (GCM) esperando; conclua o login.
- **404 na URL:** GitHub Pages ainda processando (esperar ~1 min) OU você acessou
  `.../barons-war-builder.html` — o arquivo foi renomeado para `index.html`, então
  a URL correta é só `.../barons-war-builder/` (sem sufixo).
- **Sheet preview iframe quebra offline:** o iframe carrega a própria página; se
  offline sem cache, o `sw.js` serve `index.html` como fallback. Testado, funciona.

---

## 9. Arquivos auxiliares (locais, não publicados)

- Este `IPAD_HANDOFF.md` — está no repo mesmo, faz parte do handoff.
- `ArmySmith_BaronsWar/` — pacote de integração com o portal (fica **fora** do repo público,
  só local).
- `extracted/`, `app-react-archive/`, `Revisao ArmySmith*` — dev-only, no `.gitignore`.
- PDFs do livro — **NUNCA** ir para o repo (copyrighted); no `.gitignore`.
