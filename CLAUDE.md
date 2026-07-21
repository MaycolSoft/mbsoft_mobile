# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — start the Expo dev server
- `npm run android` — build/run on Android (`expo run:android`)
- `npm run ios` — build/run on iOS (`expo run:ios`)
- `npm run web` — start web build (`expo start --web`)
- `npm test` — run Jest tests in watch mode (`jest --watchAll`)
  - Single test file: `npx jest components/__tests__/ThemedText-test.tsx`
- `npm run lint` — `expo lint`
- `npm run reset-project` — moves starter code aside and creates a blank `app/` (see `scripts/reset-project.js`); not relevant to this app's current structure, inherited from `create-expo-app`

Package manager is Yarn per `package.json`'s `packageManager` field, though `npm` scripts work too. This is an Expo (SDK 54) / React Native 0.81 app using the classic navigation stack, not Expo Router — the `___app/` directory is legacy file-router boilerplate left over from `create-expo-app` and is not wired into the app (note the `___` prefix keeps it out of the routable tree). Don't treat `___app/` as live code or extend it; the README's mention of file-based routing under `app/` is stale.

## Architecture

**Entry point & navigation**: [App.tsx](App.tsx) is the real root component (not the one under `___app/`). It wraps everything in gluestack-ui's `StyledProvider`/`OverlayProvider`, sets up a `@react-navigation/stack` navigator, and picks between the `Login` or `Home` screen based on `accessToken` in the Zustand store — this is the entire auth gate. There's a duplicate `components/App.tsx`; the one imported by the app is the top-level `App.tsx`.

**Post-login shell**: [screens/Home.tsx](screens/Home.tsx) renders a `@react-navigation/drawer` navigator that hosts all the authenticated screens (Products, Telescope/Iframe, Settings, Portfolio, Prices, Http Log, Crear Producto, Logout). Logout is a screen component that clears the access token as a side effect on mount rather than a button handler.

**State (Zustand)**: [store/useStore.ts](store/useStore.ts) exports two independent stores:
- `useStore` (default export, aliased `useAuthStore` in some files) — `accessToken` and an `AppConfig` (`darkMode`, `language`). Only `config` is persisted to `AsyncStorage` via `zustand/middleware`'s `persist`; `accessToken` is intentionally not persisted (deliberate — session doesn't survive app restart... verify with the team if this is an assumption vs. intentional).
- `useLogStore` — an in-memory ring of HTTP request logs, fed by the API layer, rendered by `components/LogScreen.tsx` under the "Http Log" drawer item.

**API layer**: [api/axiosInstance.ts](api/axiosInstance.ts) creates a single axios instance pointed at a hardcoded `baseURL` and attaches the bearer token from `useStore` via a request interceptor. [api/apiService.ts](api/apiService.ts) wraps `get/post/put/delete` and logs every call into `useLogStore` before dispatching — always go through these helpers (not raw axios) so requests show up in the in-app log screen. `isAxiosError` is the type guard used across screens to branch server-message vs. generic-error toasts.

**Theming**: Dark/light mode is driven by `config.darkMode` in the Zustand store (not the OS scheme) and is threaded manually into `@react-navigation`'s `Theme` object in `App.tsx`, plus ad hoc `config.darkMode ? … : …` conditionals inside individual screens/components (see `screens/Login.tsx`, `screens/Home.tsx`). `hooks/useColorScheme.ts` / `constants/Colors.ts` exist from the Expo template but are largely superseded by this store-driven approach — check which pattern a given screen already uses before adding new theming.

**Path alias**: `@/*` maps to the repo root (`tsconfig.json`), e.g. `@/store/useStore`, `@/screens/Login`.

**Types**: shared interfaces (e.g. `Product`, `DropdownProps`, `ProductOverlayProps`) live in `interfaces/index.ts` rather than being colocated with components.

**Credentials**: `credentials.json` and `credentials/` contain real iOS/Android signing material referenced by `eas.json` — treat as sensitive, don't print contents or move outside their expected paths.

## Project status (as of 2026-07-21)

This is an **abandoned project** the user set aside after an Expo upgrade broke it. A newer project (`mbsoftapp`, separate repo) was started with select files carried over, but this repo has more screens/logic and is kept around as a source to salvage from — not for active development unless told otherwise.

### Why it likely broke

`npx expo-doctor` (installed `node_modules`) reports:
- **Missing peer dependency**: `react-native-reanimated` (v4.2.2) requires `react-native-worklets`, but the project only has `react-native-worklets-core` (a different, older package used by Reanimated v2/v3). This is the most probable native-crash cause after upgrading — Reanimated v4 changed its native worklets backend and the app never picked up the new required package.
- **`jest-expo` major mismatch**: installed `52.0.6`, SDK 54 expects `~54.0.17` — test runner is two SDK majors behind.
- Minor/patch drift: `react-native-reanimated`, `@types/react`, `@types/react-dom`, `typescript`, `expo-image-picker`, `expo-web-browser` all slightly behind what SDK 54 expects.
- Installed versions: Expo `54.0.36`, React Native `0.81.5`, React `19.1.0` (per `node_modules`, these look current/self-consistent — the mismatches are all in the *other* packages around them, not Expo core itself).

Net: the SDK core is fine; the breakage is from dependencies (especially Reanimated's worklets backend and `jest-expo`) not being bumped in lockstep with the Expo SDK bump.

### Navigation & state (confirmed)

React Navigation only (stack + drawer) — **no expo-router in actual use**. `zustand` is the only state manager. See "Architecture" above for the auth-gate/store/API details.

### Screens & components, one-liner each

- `screens/Login.tsx` — login form (empresa/usuario/contraseña), posts to `api/login`, optional "remember me" via AsyncStorage, sets the Zustand access token.
- `screens/Home.tsx` — post-login drawer shell hosting all screens below plus a no-render Logout item.
- `screens/products/ProductListScreen.tsx` — product list/grid screen with search, pagination, add/edit via modal `ProductForm`, category modal.
- `screens/products/ProductForm.tsx` (807 lines — largest screen) — full create/edit product form: fields, category/unit/tax dropdowns, image picker/camera integration.
- `screens/products/CategoryModal.tsx` — small `react-native-paper` modal to add a new product category inline.
- `screens/products/CustomListTest.tsx` — despite the "Test" name, this is live code: exported as `ProductOverlay`, the grid/list renderer used by `ProductListScreen`.
- `screens/Portfolio.tsx` — demo/placeholder screen listing Rick & Morty API characters (paginated `FlatList`); not real business logic, looks like a leftover scaffolding/demo screen.
- `screens/Prices.tsx` — stub screen, just a "Prices Screen" placeholder, no logic yet.
- `screens/Settings.tsx` — minimal screen exposing only the dark-mode toggle.
- `components/LogScreen.tsx` — renders the `useLogStore` HTTP call log (the "Http Log" drawer item).
- `components/Iframe.tsx` — "Telescope" webview/browser screen, opened either as in-app WebView or external browser (choice driven from `Home.tsx`'s drawer listener).
- `components/Carousel.tsx` — current image/text carousel used in the product list (built on `react-native-reanimated-carousel`).
- `components/Camera.tsx` — camera capture flow for product images (`expo-camera`/`expo-image-picker`).
- `components/Dropdown.tsx` — generic dropdown/select used across product form and list filters.
- `components/SearchBar.tsx` — search input used in `ProductListScreen`.
- `components/Input.tsx` / `components/InputField.tsx` — two parallel text-input components (icon-aware `Input`, simpler `InputField`); both are actively used in different screens, not a clean duplication.
- `components/CheckBox.tsx`, `components/Button.tsx`, `components/Dropdown.tsx` — small shared form controls.
- `components/DarkModeButton.tsx` — toggles `config.darkMode` in the Zustand store.
- `components/AutoScrollingText.tsx`, `HelloWave.tsx`, `Collapsible.tsx`, `ParallaxScrollView.tsx`, `ThemedText.tsx`, `ThemedView.tsx`, `ExternalLink.tsx`, `components/navigation/TabBarIcon.tsx` — Expo template boilerplate, largely orphaned now that the app uses its own screens/navigation (worth checking usage before assuming any given one is dead).

### Confirmed dead code / template remnants

- **`components/BORRARCarousel.tsx`** — Spanish for "DELETE Carousel"; not imported anywhere. Superseded by `components/Carousel.tsx`. Safe to delete.
- **`components/App.tsx`** — a second, unused copy of the root `App` component; the real entry point is the top-level `App.tsx`. Not imported anywhere.
- **`components/BottomTabs.tsx`** — defined, exported, but not imported anywhere in the app; leftover from an earlier tab-based nav approach (`git log` shows `refactor(Home): home screen and bottom tabs` then later drawer-based work superseded it).
- **`___app/`** (entire directory: `_layout.tsx`, `+html.tsx`, `+not-found.tsx`, `(tabs)/*`) — Expo Router template scaffold, prefixed with `___` specifically so it's excluded from the routable tree. Confirmed unused; the app never calls into expo-router.
- **`scripts/reset-project.js`** — template script for resetting to a blank `app/`; irrelevant given the app doesn't use `app/`-based routing.
- Template leftovers likely dead: `hooks/useColorScheme.ts`/`.web.ts`, `constants/Colors.ts` (superseded by the Zustand-driven dark mode) — not deleted here, just flagged as candidates.
- **`screens/Portfolio.tsx` and `screens/Prices.tsx`** — placeholder/demo screens (Rick & Morty API list, static text) with no real business value; likely fine to drop when porting to the new project.

### Unused dependencies (declared in `package.json`, no import found in app code)

`@expo/metro-runtime`, `@expo/ngrok`, `@radix-ui/react-form`, `@radix-ui/react-menu`, `@react-native-aria/focus`, `@react-native-aria/interactions`, `@react-native-aria/overlays`, `@react-native-aria/utils`, `@react-native-picker/picker`, `@react-navigation/native-stack`, `expo-constants`, `expo-dev-client`, `expo-linking`, `expo-status-bar`, `expo-system-ui`, `react-dom`, `react-native-gesture-handler`, `react-native-modal`, `react-native-screens`, `react-native-svg`, `react-native-worklets-core`.

Caveats: some of these are transitive requirements of other libraries (e.g. `react-native-screens`/`react-native-gesture-handler` for `@react-navigation`, `@react-native-aria/*`/`@radix-ui/*` for gluestack-ui internals, `expo-system-ui`/`expo-constants` for Expo's own config) and shouldn't be removed just because there's no direct `import` — verify each before pruning. `react-native-worklets-core` is a real red flag though: it's the *wrong* worklets package for the installed Reanimated v4 (see "Why it likely broke" above).

### What this project has that the newer `mbsoftapp` may not (candidates to port)

Based on the file inventory here (full products CRUD flow, camera/image picker, category management, HTTP request log viewer, Telescope/iframe integration, dark mode via Zustand+persisted AsyncStorage, gluestack-ui theming) — worth confirming against the new project's actual contents, since this repo has no visibility into `mbsoftapp`'s current file tree. Point Claude at that repo directly (or paste its file list) for a real diff rather than relying on the user's recollection.
