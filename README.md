## Assets

This project includes local sample GLB assets from the Khronos glTF Sample Assets repository.

### `public/models/DamagedHelmet.glb`

- Model: Damaged Helmet
- Source: [KhronosGroup/glTF-Sample-Assets - DamagedHelmet](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/DamagedHelmet)
- Legal:
  - © 2018, ctxwing. [CC BY 4.0 International](https://creativecommons.org/licenses/by/4.0/legalcode) - ctxwing for rebuild and conversion to glTF.
  - © 2016, theblueturtle*. [CC BY-NC 4.0 International](https://creativecommons.org/licenses/by-nc/4.0/legalcode) - theblueturtle* for earlier version of model.

### `public/models/Avocado.glb`

- Model: Avocado
- Source: [KhronosGroup/glTF-Sample-Assets - Avocado](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/Avocado)
- Legal: © 2017, Public. [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/legalcode) - Microsoft for Everything.

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### GitHub Pages Deployment

Production builds use `/threejs-intro/` as the Vite base path for GitHub Pages project deployment.

Sample GLB files in `public/models/` are copied to `dist/models/` during build. Model URLs are generated from `import.meta.env.BASE_URL`, so they resolve correctly under:

```txt
https://<user>.github.io/threejs-intro/
```

If this project is deployed to a different repository name or a custom domain root, update the `base` value in `vite.config.ts`.

The project includes `.github/workflows/deploy-pages.yml` for GitHub Actions deployment. In the repository settings, set GitHub Pages source to **GitHub Actions**. The workflow currently deploys on pushes to `main` and can also be run manually from the Actions tab.

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
pnpm test:unit
```
