# Screen Hide

A small Windows app that covers part or all of your screen with a colour or an image. Lock it with a PIN and the window can't be moved, resized, minimised or closed until the PIN is entered again.

[Get it from the Microsoft Store](https://apps.microsoft.com/detail/9ngb1h22n3hx)

Built with Electron, Vue 3 and Quasar in February 2024, and sold on the Microsoft Store under the publisher name VitalVictor.

## What it does

- **Covers the screen.** Size the window over whatever you want hidden, or make it full screen.
- **Shows a colour or an image.** Pick any colour, or choose an image file. Your choice is saved and comes back the next time the app starts.
- **Locks with a PIN.** Set a PIN the first time you lock. While locked, the window stays on top of everything else and can't be moved, resized, minimised, maximised or closed.

## How it works

1. The renderer (Vue 3 and Quasar) runs with `contextIsolation` on. It reaches the main process through two IPC calls exposed by the preload script:
   - `setup-lock-status` locks or unlocks the window.
   - `select-and-show-IMG` opens a file picker and returns the chosen image.
2. Locking calls `setAlwaysOnTop(true)` and turns off resizing, moving, minimising, maximising, full screen and closing on the `BrowserWindow`. Unlocking turns them back on.
3. The PIN is kept in local storage as a 32-bit checksum rather than as the digits, and unlocking compares checksums. This stops someone at the keyboard, not someone with access to the app's data folder, so treat it as a lock screen rather than a security boundary.
4. The window has a hidden title bar with overlay controls and no menu. DevTools are closed in production builds.

## Project layout

| Path | Contents |
| --- | --- |
| `src-electron/electron-main.js` | Window setup, lock and unlock, image picker |
| `src-electron/electron-preload.js` | The two calls exposed to the renderer |
| `src/pages/IndexPage.vue` | Colour and image controls, PIN dialog |
| `quasar.config.js` | Electron Builder settings for the AppX (Microsoft Store) package |

## Building it yourself

```bash
yarn
quasar dev -m electron     # run in development
quasar build -m electron   # build the AppX package
```

## License

No license is granted. The source is published so you can see how the app is built. It isn't licensed for reuse or redistribution.

Built by [Jeevanjot Singh Vital](https://jeevanjotsinghvital.com).
