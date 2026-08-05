# NeuroQuiz 60+

PWA de quiz de neuroanatomia para o público 60+, com:

- 15 perguntas em 3 fases
- letras e botões grandes
- áudio de acerto, erro, clique e vitória
- leitura por voz usando Speech Synthesis do navegador
- alto contraste
- ajuste do tamanho do texto
- funcionamento offline
- instalação como aplicativo
- layout responsivo para celular, tablet e computador

## Estrutura

- `index.html`
- `style.css`
- `app.js`
- `manifest.json`
- `sw.js`
- `assets/img`
- `assets/audio`
- `assets/icons`

## Publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie todos os arquivos mantendo a mesma estrutura.
3. Abra **Settings > Pages**.
4. Em **Build and deployment**, selecione **Deploy from a branch**.
5. Escolha a branch `main` e a pasta `/root`.
6. Salve e aguarde o link do GitHub Pages.

## Observação

O Service Worker funciona em HTTPS ou em `localhost`. No GitHub Pages, o HTTPS já é fornecido.
