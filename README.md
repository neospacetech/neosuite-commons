# neosuite-commons

Shared TypeScript libraries for NeoSuite clients: the `neosuite-app` shell and every product's
`frontend/` package, on web, iOS, Android, desktop (Tauri) and TV.

| Package | What it is |
|---|---|
| [`@neospacetech/neosuite-tokens`](packages/tokens) | Design tokens: breakpoints and `breakpointFor()`, spacing, radii, typography (with OS font scaling), light / dark / high-contrast colour themes, `minTouchTarget`. No dependencies. |
| [`@neospacetech/neosuite-ui`](packages/ui) | React Native components that also run on react-native-web: `ThemeProvider`, `useBreakpoint`, `AdaptiveLayout`, `NavShell`, `ListDetail`, `AdaptivePanel` / `Sheet` / `SidePanel`, `DataView`, `Text`, `Button`, `TextField`, `Stack` / `Row` / `Spacer`, `Interactive`. |
| [`@neospacetech/neosuite-runtime`](packages/runtime) | Framework-agnostic client runtime: `ApiClient` (fetch, bearer tokens, `ApiError` from problem+json with a stable `code`), server-sent events as async iterators, session store, realtime and offline-cache interfaces. Optional React hooks at `@neospacetech/neosuite-runtime/react`. |
| [`@neospacetech/neosuite-schema`](packages/schema) | Types for platform contracts: `ObjectEnvelope`, `ObjectRef` (`neo://<tenant>/o/<ulid>`), `CloudEvent`, `ActionDescriptor`, and the `/.well-known/neosuite/manifest.json` `Manifest`. Written by hand until generation from `contracts/` is in place. |

## Consuming the packages

Packages ship TypeScript source: `main`, `types` and `exports` point at `src/index.ts`, and the
consuming app's bundler (Metro / Expo, or Vite with react-native-web) compiles them. There is no
build step and no install script.

`react`, `react-native` and (on web) `react-native-web` are peer dependencies of `neosuite-ui`;
the app provides them.

### Local development against sibling checkouts

Clone this repository next to the product repositories:

```text
neosuite/
├── neosuite-commons/
├── neosuite-app/
└── neotasks/
```

Then depend on the packages by path from the consuming package:

```json
{
  "dependencies": {
    "@neospacetech/neosuite-tokens": "file:../neosuite-commons/packages/tokens",
    "@neospacetech/neosuite-ui": "file:../neosuite-commons/packages/ui",
    "@neospacetech/neosuite-runtime": "file:../neosuite-commons/packages/runtime",
    "@neospacetech/neosuite-schema": "file:../neosuite-commons/packages/schema"
  }
}
```

For Metro, add the commons directory to `watchFolders` and make sure `react` and `react-native`
resolve from the app (`resolver.nodeModulesPaths` or `extraNodeModules`) so only one copy of each
is bundled. Edits in commons then hot-reload in the app.

On React Native, `ApiClient.stream()` needs a fetch whose response body is streamable; pass one
via the `fetch` option (for example `fetch` from `expo/fetch`).

## Responsiveness

Every screen works at every size and with every input mode. The primitives here encode the rules:

- **Breakpoints:** `compact` < 600, `medium` 600–1023, `expanded` 1024–1439, `large` ≥ 1440, plus
  a `tv` form factor. `useBreakpoint()` updates live on resize, rotation and split-screen.
- **Adaptive structure:** bottom tabs on compact, a navigation rail on medium, a sidebar wider
  (`NavShell`); one pane with push navigation on compact and side-by-side panes otherwise
  (`ListDetail`); full-screen sheets on compact and side panels wider (`AdaptivePanel`); card
  lists on compact and tables wider (`DataView`).
- **State survives resizing:** adaptive components keep content mounted when the layout changes,
  so selection, scroll position and input are not lost.
- **Input parity:** touch targets of at least 44pt on touch and D-pad, hover states for pointers,
  visible focus rings for keyboard focus, and keyboard activation.
- **Content:** text scales with the OS font size up to 200%, layouts reflow down to 320px wide
  without horizontal scrolling, and every colour comes from the light, dark or high-contrast theme.

Each breakpoint decision is a pure function in `packages/ui/src/layout.ts` (`navModeFor`,
`listDetailModeFor`, `panelModeFor`, `dataViewModeFor`, …) with unit tests.

## Development

Requires Node.js 22.

```sh
npm ci
npm run typecheck
npm test
npm run lint
```

## Licence

Apache-2.0. See [LICENSE](LICENSE).
