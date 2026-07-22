# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — start the Expo dev server
- `npm run android` — build/run on Android (`expo run:android`)
- `npm run ios` — build/run on iOS (`expo run:ios`)
- `npm run web` — start web build (`expo start --web`)
- `npm test` — run Jest tests in watch mode (`jest --watchAll`) — no test files currently exist in the repo
- `npm run lint` — `expo lint`

Package manager is Yarn per `package.json`'s `packageManager` field, though `npm` scripts work too. This is an Expo (SDK 54) / React Native 0.81 app using `@react-navigation` v7 (stack + drawer) — not Expo Router. There is no `expo-router` dependency at all; don't add router-style files.

Useful checks after any change: `npx tsc --noEmit`, `npx expo-doctor` (should read 18/18), `npx expo export --platform web` (bundles Metro end-to-end without needing a simulator — the fastest way to catch a broken import/type from here).

## Project status (as of 2026-07-21)

This project was previously abandoned after an Expo SDK bump broke it (see "History" below), but is now **actively being revived** — dependencies are fixed, the app boots, and it's being rebuilt screen-by-screen with a proper design system. A separate, smaller repo (`mbsoftapp`) exists that was used as a stopgap while this one was broken; this repo has more real screens/business logic and is the one being developed going forward.

## Architecture

**Entry point & navigation**: [App.tsx](App.tsx) is the root component. It wraps the tree in `ThemeProvider` (see Theming below), `NavigationContainer` (theme derived from the same tokens), a `@react-navigation/stack` navigator that picks `Login` or `Home` based on `accessToken` in the Zustand store (the entire auth gate), plus `<Toast />` and `<AppAlertProvider />` mounted once at the root.

**Post-login shell**: [screens/Home.tsx](screens/Home.tsx) renders a `@react-navigation/drawer` navigator with a custom [components/DrawerContent.tsx](components/DrawerContent.tsx) (logo header, themed nav items with icons, logout pinned at the bottom with a confirmation via `showAlert`). Hosts: Productos, Crear Producto, Telescope, Prices, Portfolio, Http Log, Config. Negocio, Settings.

**State (Zustand)**: [store/useStore.ts](store/useStore.ts) exports two independent stores:
- `useStore` (default export) — `accessToken` (not persisted — session doesn't survive app restart, deliberate) and `config: AppConfig` (persisted to AsyncStorage via `zustand/middleware`'s `persist`): `darkMode`, `language`, `accentColor`, `cardTint`, `textSize` (all consumed by the theme system), and `apiUrl` (overrides the API base URL — see below).
- `useLogStore` — in-memory HTTP request/response log (capped at 200 entries), fed by the API layer and rendered by `components/LogScreen.tsx` under "Http Log". Entries track pending/success/error state, HTTP status, duration, sanitized payloads, and response/error bodies; sensitive fields and oversized values are masked/truncated.

**API layer**: [api/axiosInstance.ts](api/axiosInstance.ts) exports `DEFAULT_BASE_URL` and reads the *actual* base URL per-request from `useStore`'s `config.apiUrl` (falls back to the default) — this is user-configurable from the Login screen's "Configurar servidor" section, so switching between a local dev server/staging/production doesn't require editing code or rebuilding. The bearer token is attached the same way. [api/apiService.ts](api/apiService.ts) wraps `get/post/put/delete`, logs every call into `useLogStore` — always go through these helpers, not raw axios. `isAxiosError` is the shared type guard for server-message vs. generic-error toasts. Endpoint prefix convention: calls include `api/` explicitly (e.g. `postRequest("api/login", ...)`) since the base URL is just the domain root, not `.../api`.

**Theming — the design system** (this is the main thing to understand before touching any screen):
- [theme/theme.ts](theme/theme.ts) — `buildTheme(dark, options)` returns the full token set: `colors` (background/surface/card/text/textMuted/border/primary/onPrimary/success/warning/danger/disabled), `spacing` (xs→xxxl, 4px steps), `radius` (sm/md/lg/full), `typography` (fontSize scale + fontWeight), `shadow`. `options` lets `accentColor`/`cardTint` (looked up from curated `accentSwatches`/`cardTintSwatches`, each with light+dark variants) and `textSize` (`textSizeScale`, scales every `fontSize` by a multiplier) override the defaults.
- [theme/ThemeProvider.tsx](theme/ThemeProvider.tsx) — `ThemeProvider` wraps the app, reads `darkMode`/`accentColor`/`cardTint`/`textSize` from the Zustand store (not OS scheme, not a separate context state) and memoizes the built theme; `useTheme()` hook reads it. **Every themed screen/component calls `useTheme()` and reads colors/spacing/etc. from it — never hardcode hex colors in new code.**
- Screen-level dark mode/appearance controls live in [screens/Settings.tsx](screens/Settings.tsx): dark mode switch, accent color swatches, card tint swatches, text size segmented control — all funnel into `updateConfig()`.

**Shared component library** (in `components/`, all theme-driven, no external UI kit):
- `TextInput.tsx` — themed text input with label/icon/error/focus state (uses `@expo/vector-icons` glyph-map lookup for the icon).
- `Button.tsx` — variant/size/icon/loading, colors from theme tokens.
- `CheckBox.tsx`, `Dropdown.tsx` (custom overlay via RN's own `Modal`, not a portal library), `Modal.tsx` (generic themed modal: title + content slot + optional footer), `AppAlert.tsx` (singleton replacement for `Alert.alert`/`window.confirm` — mount `<AppAlertProvider />` once at the root, then call `showAlert(title, message, buttons)` from anywhere; **use this instead of `Alert.alert`**, it's the only way alerts look consistent across iOS/Android/web).
- `Tabs.tsx` (pill-style tab switcher + content area), `Badge.tsx` (boolean/status pill), `TagInput.tsx` (chip input), `ColorSwatchPicker.tsx`, `SettingsSection.tsx`/`SettingsRow.tsx` (card+row primitives used to build settings-style screens).
- `InputField.tsx` — an older, not-yet-themed plain text input, still used by `ProductForm.tsx`/`ProductListScreen.tsx`'s remaining spots that haven't been migrated to `TextInput.tsx` yet. Check which one a given screen already uses before adding new fields.
- `react-native-paper` is still used directly (not through a shared wrapper) in `ProductForm.tsx` and `CategoryModal.tsx` for their own `Modal`/`Portal`/`Provider` — each of those wraps itself in its own local `<Provider>`, so they're self-contained and don't depend on any ancestor screen providing one.

**Business configuration** ([screens/business/](screens/business/)): a "Config. Negocio" drawer entry hosting 4 tabs via `components/Tabs.tsx`, ported from a companion web frontend (`REACT-MBSOFT`, separate repo) — general business info + logo upload, NCF (fiscal receipt series) management with a series sub-editor in a `Modal`, database backups (create/list/delete — no download on mobile, by design), and a scheduled-tasks/cron builder. All endpoints assume the same `api/` prefix convention as the rest of the app; flagged in the screens themselves as an assumption to verify against the real backend if anything 404s.

**Path alias**: `@/*` maps to the repo root (`tsconfig.json`), e.g. `@/store/useStore`, `@/theme/ThemeProvider`.

**Types**: shared interfaces (`Product`, `DropdownProps`, `ProductOverlayProps`, etc.) live in `interfaces/index.ts` rather than being colocated with components.

**Credentials**: `credentials.json` and `credentials/` contain real iOS/Android signing material referenced by `eas.json` — treat as sensitive, don't print contents or move outside their expected paths.

## Screens & components, one-liner each

- `screens/Login.tsx` — login form (username/password, collapsible empresa code field, collapsible server-URL config), posts to `api/login`, "remember me" via AsyncStorage, sets the Zustand access token. Rounded logo, fully themed.
- `screens/Home.tsx` — post-login drawer shell (see Architecture above).
- `screens/Settings.tsx` — dark mode, accent/card color, text size, and a placeholder "Impresoras" section (UI only, no hardware integration yet).
- `screens/business/*` — see "Business configuration" above.
- `screens/products/ProductListScreen.tsx` — product search/list with a working Grid⇄List toggle and add/edit via `Modal` → `ProductForm`. Search matches the Laravel contract (`parametro`, `include_images`, `per_page`, `page`), debounces input, searches reference/description/category together, displays paginator totals, and loads subsequent pages only from `onEndReached`.
- `screens/products/CreateProductScreen.tsx` — standalone drawer wrapper for `ProductForm`; supplies themed edge padding, vertical scrolling, keyboard avoidance, a tablet/web max width, and navigation back to Productos after cancel/save. Keep standalone layout concerns here so the modal does not receive duplicate padding.
- `screens/products/CustomListTest.tsx` — despite the "Test" name, this is live code: exported as `ProductOverlay`, the actual grid/list renderer used by `ProductListScreen`. Renders memoized `GridCard`/`ListRow` items, each with a `Carousel` and marquee-style auto-scrolling description text for long names.
- `screens/products/ProductForm.tsx` (~800 lines — largest screen) — full create/edit product form: fields, category/unit/tax dropdowns, image picker/camera integration, and a per-upload image storage switch (`save_location=local` for storage URLs by default, or `save_location=db` for base64 database storage). Not yet migrated to the `TextInput`/theme system — still uses `InputField.tsx` and hardcoded colors in places.
- `screens/products/CategoryModal.tsx` — small `react-native-paper` modal to add a new product category inline.
- `screens/Portfolio.tsx` — demo/placeholder screen listing Rick & Morty API characters; not real business logic, candidate to drop.
- `screens/Prices.tsx` — stub screen, no logic yet.
- `components/LogScreen.tsx` — themed HTTP monitor with session summary, search/method/error filters, compact expandable request cards, request/response/error payloads, status codes, durations, empty states, and a confirmed clear-history action. Payload cards show a short preview and provide a full-screen vertically/horizontally scrollable viewer for the complete captured JSON.
- `components/Iframe.tsx` — "Telescope" webview/browser screen, opened either as in-app WebView or external browser (choice from `Home.tsx`'s drawer listener + `showAlert`).
- `components/Carousel.tsx` — image/text carousel (built on `react-native-reanimated-carousel`), used by the product list cards.
- `components/Camera.tsx` — camera capture flow for product images (`expo-camera`/`expo-image-picker`).
- `components/AutoScrollingText.tsx` — orphaned template-era component, not imported anywhere; not the marquee text used in the product list (that's inlined as `AnimatedText` in `CustomListTest.tsx`).

## History: why the project broke, and what's been fixed since

`react-native-reanimated` v4 requires `react-native-worklets` (not the older `react-native-worklets-core`) as a direct dependency, and `@react-navigation` v6 doesn't work with Reanimated v3+'s native worklets backend (throws on the Drawer navigator specifically). Both are now fixed: `react-native-worklets` is a direct dep, and all `@react-navigation/*` packages are on v7. `jest-expo` and other SDK-managed packages were realigned via `npx expo install --fix`. `expo-doctor` reads 18/18 clean.

Also removed as part of the revival: the entire `___app/` expo-router scaffold (never wired in, `expo-router` isn't even installed), `scripts/reset-project.js`, `gluestack-ui` (fully replaced by the theme system above — no `@gluestack-ui/*` import remains anywhere), and a cluster of unused Expo-template leftovers (`ThemedText`/`ThemedView`/`Collapsible`/`ParallaxScrollView`/`HelloWave`/`TabBarIcon`, `hooks/useColorScheme*`, `hooks/useThemeColor.ts`, `constants/Colors.ts`, the old gluestack-based `components/Input.tsx`, `components/App.tsx` duplicate, `components/BottomTabs.tsx`, `components/BORRARCarousel.tsx`, `components/DarkModeButton.tsx` — superseded by the Switch in `Settings.tsx`).

### Unused dependencies still in `package.json` (not yet pruned)

`@gluestack-ui/config`, `@gluestack-ui/overlay`, `@gluestack-ui/themed`, `@radix-ui/react-form`, `@radix-ui/react-menu`, `@react-native-aria/*`, `@react-native-picker/picker`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack`, `@expo/metro-runtime`, `@expo/ngrok`, `expo-constants`, `expo-linking`, `expo-system-ui`, `react-dom`, `react-native-gesture-handler`, `react-native-modal`, `react-native-screens`, `react-native-svg`.

Caveats before pruning: some are likely transitive requirements of `@react-navigation` (`react-native-screens`, `react-native-gesture-handler`) even without a direct import — verify each rather than bulk-removing. The `@gluestack-ui/*`/`@radix-ui/*`/`@react-native-aria/*` trio is the safest bet to remove since gluestack-ui has zero imports left anywhere in the app.

### Still-placeholder / lower-priority areas

- `screens/Portfolio.tsx`, `screens/Prices.tsx` — no real business value, fine to drop.
- Settings → "Impresoras" section — UI-only placeholder, no printer discovery/connection logic yet (deliberately deferred).
- `components/InputField.tsx` usages in `ProductForm.tsx`/`ProductListScreen.tsx`'s remaining spots, and `Dropdown.tsx`'s consumers in `ProductForm.tsx` — not yet migrated, though `Dropdown.tsx`/`SearchBar.tsx` themselves are already theme-aware.
- `CustomListTest.tsx` naming — still says "Test" despite being live code; a pure rename (+ updating its one import) hasn't been done yet.
