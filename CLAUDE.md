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

**Business configuration** ([screens/business/](screens/business/)): a "Config. Negocio" drawer entry hosting 5 tabs via `components/Tabs.tsx` — general business info + logo upload, **branches** (`BranchesTab.tsx` — per-branch settings sourced directly from Laravel controller code the user pasted in, not the web frontend, since the web doesn't have this screen either: POS search mode, invoice-return day limit, `allow_remove_product_pos` — the same flag `screens/pos/PosScreen.tsx` reads to decide whether removing/decrementing a cart line needs supervisor credentials — 10%-law/ITBIS-control/digital-invoice toggles, per-document footer text, and document number prefixes for factura/nota de crédito/entrada de productos/facturas suspendidas via `POST api/branch/updateOrCreateBranch`), NCF (fiscal receipt series) management with a series sub-editor in a `Modal`, database backups (create/list/delete — no download on mobile, by design), and a scheduled-tasks/cron builder. General/NCF/Backups/Tasks were ported from a companion web frontend (`REACT-MBSOFT`, separate repo); Branches has no web equivalent to compare against. All endpoints assume the same `api/` prefix convention as the rest of the app; flagged in the screens themselves as an assumption to verify against the real backend if anything 404s.

**User management** ([screens/users/](screens/users/)): the `Usuarios` drawer entry provides a searchable/pull-to-refresh directory, native create/edit form, branch and home-page assignment, active/email-notification/admin flags, plus role and hierarchical permission managers. API contracts are ported from `REACT-MBSOFT/src/pages/UserManagement.jsx`: `user/getUsers`, `user/saveUser`, `user/getUserRoles/{id}`, `user/getPermisosByUser/{id}`, `user/saveRole/{id}` and `user/savePermissions/{id}`; all mobile calls include the explicit `api/` prefix and pass through `apiService` for Http Log visibility.

`modo_busqueda_products_facturacion` is a per-branch enum (`'tabla' | 'cartas'`, Laravel validation `nullable|in:tabla,cartas`), edited via a 2-option segmented toggle in `BranchesTab.tsx`, and read by `screens/pos/PosScreen.tsx` off the branch object returned by `getGeneralConfiguration` to pick between two POS product-finding UIs: `'tabla'` (default) is the existing search-field + tap-a-result flow; `'cartas'` shows a "Explorar/Carrito" segmented toggle whose "Explorar" tab renders `screens/pos/components/CategoryBrowser.tsx` — tap a category (`GET api/pos/getCategorias`) to see its products as cards (`GET api/pos/getProductsByIdCategory/{id}`), tap a product card to add it straight to the cart. This is purely a frontend presentation choice per the Laravel source (the backend just returns raw products either way) — ported from a description of the legacy Blade view's card mode the user gave directly, not from `REACT-MBSOFT` (the current web POS doesn't have a card-browse mode either).

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

## POS / Invoice migration plan (analysis 2026-07-22)

Status: **analyzed, not implemented**. The source is the sibling React Web repo,
primarily `../REACT-MBSOFT/src/components/pos/PosScreen.jsx`. Before changing the
mobile implementation, also read the web repo's `docs/pos-invoicing.md`; it records
confirmed legacy backend contracts and known fiscal gaps that are not obvious from
the UI alone.

### Scope found in the web source

This is a medium/large feature, not a one-file screen port. The current web module
contains 2,820 lines total: 2,106 lines of JS/JSX plus 714 lines of CSS. The main
`PosScreen.jsx` is 548 lines and delegates to:

- 3 hooks: backend cart/session, product search and global keyboard shortcuts.
- 5 main UI pieces: scanner/search, result list, cart, totals and shortcut bar.
- 7 modal flows: open cash drawer, close/reconcile cash drawer, customer, payment,
  invoice return/credit note, suspended sales and invoice reprint.

The POS cart is not local-only. Laravel is the source of truth and identifies the
cashier's cart/cash drawer with `tokenSession`. The web login builds a deterministic
value with `btoa(`${user.id_empresa}-${user.id}`)`. Mobile currently stores only the
JWT and discards the returned `user`, so session identity must be added before the
POS can work reliably.

### Backend operations used by the current web POS

All mobile paths must include the explicit `api/` prefix because the mobile Axios
base URL is the domain root.

| Area | Method and mobile path | Purpose |
|---|---|---|
| Startup | `GET api/getGeneralConfiguration` | Removal permissions and branch validation |
| Startup | `GET api/pos/getNCFs` | Available fiscal receipt types |
| Cart | `GET api/pos/getProductsSession` | Load server cart and validate/open cash drawer |
| Search | `POST api/pos/searchProduct` | Search reference/description; accepts the `3*code` convention |
| Cart | `POST api/pos/addProduct` | Add quantity/reference to the session cart |
| Cart | `POST api/pos/removeProductCart` | Remove a line, sometimes with supervisor credentials |
| Checkout | `POST api/pos/storeInvoice` | Create invoice with NCF, customer and payment methods |
| Cash | `POST api/pos/abrirCaja` | Open cash drawer with opening amount and session token |
| Cash | `GET api/pos/getFacturasCuadre` | Preview cash reconciliation totals |
| Cash | `POST api/pos/realizarCuadre` | Close/reconcile using supervisor and closing amount |
| Customers | `GET api/customer/getCustomers` | Customer picker (legacy response shape) |
| Suspend | `POST api/suspend_invoice` | Suspend current sale |
| Suspend | `GET api/suspend_invoice` | List suspended sales |
| Suspend | `POST api/suspend_invoice/resumeInvoice/{id}` | Resume a suspended sale |
| Returns | `GET api/notas_de_credito/getFacturaToCancelar` | Find invoice and refundable quantities |
| Returns | `POST api/notas_de_credito/cancelarFactura` | Create credit note; logged-in user must have role 3 |
| History | `POST api/pos/getFacturas` | Paged invoice search for reprint; uses legacy filter groups |

Important response/payload exceptions:

- `getProductsSession` returns the cash drawer and cart together; always refetch it
  after a server mutation instead of inventing a second local cart.
- Product search returns a Laravel paginator nested in the project's API envelope.
- `getCustomers` and `getFacturas` have legacy response shapes different from the
  newer `ApiSuccess(data)` convention. Normalize them in `posApi.ts`, not in views.
- `storeInvoice` returns `idFactura` and `url_reporte`. Phase 1 should open the
  report through `expo-web-browser`/`Linking`; direct thermal printing is separate.
- `getFacturas` uses zero-based `pagenum` and legacy `filterGroups`. The exact date
  filter also requires a sibling `filtervalue{index}` field. See the web POS doc.
- The web `usePosCart` condition around `unidad.venta_decimal` appears inverted:
  it rounds when the flag is not `'false'`. Confirm this contract with real integer
  and decimal products before copying that behavior.

### Native architecture to build

Do not translate the HTML table, CSS, `window.open`, SweetAlert or browser `keydown`
code literally. Preserve business behavior and rebuild the presentation in native
components using `ThemeProvider`, shared inputs/buttons/modals and icons.

Suggested module:

```text
screens/pos/
  PosScreen.tsx
  types.ts
  constants.ts
  api/posApi.ts
  hooks/usePosSession.ts
  hooks/useProductSearch.ts
  components/ProductSearch.tsx
  components/CartList.tsx
  components/TotalsCard.tsx
  components/PosActionBar.tsx
  modals/OpenCashModal.tsx
  modals/CloseCashModal.tsx
  modals/CustomerModal.tsx
  modals/PaymentModal.tsx
  modals/ReturnInvoiceModal.tsx
  modals/SuspendedSalesModal.tsx
  modals/ReprintInvoiceModal.tsx
```

Also expected: small changes to `screens/Login.tsx`, `store/useStore.ts` and
`screens/Home.tsx`. Keep POS state in hooks unless another screen truly needs it;
Zustand should hold only authenticated user/session identity. All API traffic must
use `api/apiService.ts` so requests remain visible in Http Log.

Native UX direction:

- Phone: scanner/search and cash status at top, cart as compact `FlatList` cards,
  a sticky total/charge area at the bottom, and secondary actions in an action sheet
  or compact menu. Respect `SafeAreaView` and keyboard avoidance.
- Tablet/web: adaptive two-column layout, cart on the left and sticky totals/actions
  on the right, matching the useful information hierarchy of the web version.
- Scanning: support manual search and Bluetooth/HID scanners through a focused text
  input first. Add camera barcode scanning with the already-installed `expo-camera`
  after the sale flow is stable.
- Replace F-key-only discovery with labeled touch actions. Hardware shortcuts can be
  a progressive enhancement for RN Web/tablet keyboards, never the only path.
- Every loading, empty, error, disabled and destructive state must be explicit. Use
  `showAlert` for confirmations and the app's theme tokens for light/dark mode.

### Delivery phases

#### Phase 0 — contract and session foundation

- [x] Add typed `currentUser` state (`store/useStore.ts`) — `posSessionToken` is
  deliberately **not** stored separately; it's derived on-demand via
  `getPosSessionToken(user)` in `screens/pos/types.ts` (same `btoa("id_empresa-id")`
  the web uses, reimplemented by hand since Hermes/RN has no global `btoa`).
- [x] On login, retain the API's `user` (`screens/Login.tsx` calls `setCurrentUser`
  right after `setAccessToken`) and clear both at logout (`store/useStore.ts`'s new
  `logout()` action, wired into `components/DrawerContent.tsx`).
- [x] Create POS types (`screens/pos/types.ts`) and a `posApi.ts` adapter
  (`screens/pos/api/posApi.ts`) — currently wraps just the three Phase-0 startup
  calls (`getGeneralConfiguration`, `getNCFs`, `getProductsSession`); response
  shapes are unconfirmed placeholders, see below.
- [ ] Probe the startup/cart/search endpoints against the configured Laravel server
  and record representative response shapes without logging secrets. **Needs the
  user** — log in, check "Http Log" for the `api/login` response body and confirm
  `user.id`/`user.id_empresa` exist; the three `posApi.ts` calls themselves aren't
  wired to any UI yet (no POS screen exists), so exercising them needs either
  Phase 1's screen or a manual test.
- [ ] Confirm the `venta_decimal` meaning and branch-validation error code 35000002.

Acceptance: the app can identify a POS session (done — `currentUser` populates on
login, `getPosSessionToken()` derives the token) — loading the cash drawer/cart via
`posApi.getProductsSession` is written but unverified against the real backend.

#### Phase 1 — sellable mobile MVP

- [x] Add a themed `Facturación` drawer route (`screens/Home.tsx`) and a phone-first
  `PosScreen` shell (`screens/pos/PosScreen.tsx`) — touch-first redesign, not a port
  of the web's keyboard-driven layout (no F-keys/arrow-nav; search field + tap-to-add
  results, `FlatList` cart rows with a trash icon, sticky bottom bar with
  client/NCF pickers + total + Cobrar button).
- [x] Load general configuration, NCFs, cash drawer and server cart on focus
  (`useFocusEffect`, see `loadStartupData` in `PosScreen.tsx`), including the
  `35000002` branch-validation block (`showAlert`).
- [x] Implement text/reference search, exact match and `quantity*code`
  (`hooks/useProductSearch.ts` + `parseScanInput` in `types.ts`, ported from the
  web's `useProductSearch.js`).
- [x] Implement add/remove line and totals/refresh (`hooks/usePosCart.ts`, ported
  from `usePosCart.js`). **No quantity decrement/stepper** — the backend only
  supports additive `addProduct` and whole-line `removeProduct`, same as web.
- [x] Implement opening cash drawer (`modals/OpenCashModal.tsx`); checkout is
  disabled with an explanatory label on the Cobrar button when `cajaOpen !== true`.
- [x] Implement customer selection and consumer-final fallback
  (`modals/CustomerModal.tsx`).
- [x] Implement NCF selection (themed `Dropdown`) and enforce `require_rnc` both
  before opening the payment modal and again inside `createInvoice` (defense in
  depth, matching web).
- [x] Implement multi-method payment, remaining/vuelto and invoice creation
  (`modals/PaymentModal.tsx` + `createInvoice` in `PosScreen.tsx`).
- [x] Open `url_reporte` (via `expo-web-browser`), clear transient checkout state
  and refetch the server cart on success.
- [x] Removing a cart line when `allow_remove_product_pos` is falsy prompts for
  supervisor credentials (`modals/RemoveProductModal.tsx`) — same gate as web.

Acceptance: code-complete, **not yet verified against the real backend** — no
network/creds available from this environment. Several response shapes
(`getProductsSession`, `searchProduct`, `getCustomers`, `storeInvoice`) are still
assumptions ported from the web JS, not confirmed against the live Laravel API.
First real test: `npx expo start` → "Facturación" → search a product → open caja if
prompted → add to cart → pick customer/NCF → pay → confirm the invoice report opens.
Whatever breaks first tells us which shape assumption was wrong.

#### Phase 2 — cash and operational parity

- [x] Add reconciliation preview and close-cash flow with supervisor credentials
  (`modals/CloseCashModal.tsx` — tap the "Caja abierta" banner; shows the
  `getFacturasCuadre` preview, then posts `realizarCuadre` with supervisor
  user/pass + counted amount).
- [x] Add suspend-current-sale and list/resume suspended sales
  (`handleSuspendInvoice` in `PosScreen.tsx` + `modals/SuspendedInvoicesModal.tsx`,
  two small action buttons under the caja banner: "Suspender" — disabled when
  the cart is empty — and "Suspendidas").
- [ ] Restore focus/search cleanly after every modal and failed/successful mutation
  — mobile doesn't have the web's keyboard-refocus concept, but double-check the
  scan `TextInput` is usable again immediately after every modal closes.
- [ ] Add pull-to-refresh/retry behavior for network interruptions — not done yet.

Acceptance: code-complete, **not yet verified against the real backend** — same
caveat as Phase 1. `getFacturasCuadre`'s response shape (`posCaja`, `withRNC`,
`withoutRNC`, `sub_total`, `total_tax`, `total`) and `suspend_invoice`'s list
shape (`id_suspension`, `customer`, `created_at`, `shopping_cart`, `total`) are
ported directly from the web JS, unconfirmed live.

#### Phase 3 — history and fiscal returns

- [ ] Add paginated invoice history/reprint using the documented legacy contract.
- [ ] Open/share the signed report URL with a clear expired-link error state.
- [ ] Add invoice lookup, partial quantity return and DGII 01..10 classification.
- [ ] Make the role-3 restriction visible before submission when user metadata allows;
  still handle backend 403 as authoritative.

Acceptance: reprints and supported credit-note returns work without the web app.

#### Phase 4 — hardware and remaining fiscal gaps

- [ ] Add camera barcode scanning with permission/denied states.
- [ ] Decide report sharing vs. `expo-print`/`expo-sharing` vs. LAN/Electron/Raspberry
  thermal printing; do not add printing dependencies until the target is chosen.
- [ ] Validate note-of-credit payment balance through
  `GET api/pos/getMontoNotaDeCredito/{num_nota}`.
- [ ] Integrate ad-hoc DGII RNC lookup (`api/pos/searchRNC/{rnc}`), category browsing,
  and supervisor tax/10%-law exemptions if these are required on mobile.
- [ ] Optionally add a read-only credit-note history/detail screen.

### Verification strategy

There are no existing tests, so split business calculations and API normalization
into pure functions that can receive focused Jest tests. At minimum test totals,
mixed payments/vuelto, RNC requirements, quantity parsing, refundable quantities
and legacy paginator normalization. After each phase run `npx tsc --noEmit` and
`npm run lint`; before handoff also run `npx expo export --platform web`. Device-test
camera, keyboard, safe areas and report opening on at least one iPhone and Android.

### Risks and decisions still requiring confirmation

1. `tokenSession` is deterministic per company/user in web, so web and mobile may
   intentionally share—or accidentally collide on—the same live cart and drawer.
   Confirm desired cross-device behavior before Phase 0 is finalized.
2. The web POS has known fiscal gaps: NCF/RNC enforcement, credit-note payment saldo,
   ad-hoc RNC lookup, category browsing, tax overrides and thermal printing. Mobile
   should fix the first (high-risk) gap in MVP instead of reproducing it.
3. Signed `url_reporte` links can expire and point at a LAN address. Opening them on
   a phone requires the same network reachability as product image URLs.
4. Cash and cart mutations have no offline-safe semantics. The first release should
   be explicitly online-only and serialize mutations to prevent duplicate invoices.
5. No backend idempotency key is visible in `storeInvoice`. Disable repeat taps and
   keep the confirmation request locked until it succeeds or definitively fails.

### Resume point

Start with Phase 0. Re-read this section and the web repo's
`docs/pos-invoicing.md`, then inspect the live login response in Http Log to type
`user`. Do not begin by copying `PosScreen.jsx`; first create the API/session boundary
and confirm `getProductsSession`, because every later POS flow depends on it.
