# rs-item-viewer

[Vite](https://ja.vitejs.dev/) + vanilla-ts

Install
```pwsh
npm ci
```

Dev server
```pwsh
npm run dev
```

Build
```pwsh
npm run build
```

Lint
```pwsh
npm run lint
```

# actions
* [dependabot.yml](https://github.com/rsvzuiun/rs-item-viewer/blob/main/.github/dependabot.yml)
* [workflows/lint.yml](https://github.com/rsvzuiun/rs-item-viewer/blob/main/.github/workflows/lint.yml)
  * `**.md`, `.gitignore`, actions, `public/**` (データだけの更新時) は Lint しない設定
* [workflows/gh-pages.yml](https://github.com/rsvzuiun/rs-item-viewer/blob/main/.github/workflows/gh-pages.yml)
  * buildしてデプロイ, こっちは `public/**` を含める

