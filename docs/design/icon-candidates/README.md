# App icon candidates

Generated with SnapAI on 8 Oct 2026. Prompt: a rounded TV screen outline with three stacked episode bars inside, mint `#3ddc97` on near-black `#0e0e10`.

- `option-1.png` — large TV with legs. Not used.
- `option-2.png` — smaller centred TV with legs. Not used.
- `option-3.png` — round, chunky TV with a dome and antennas, no legs. **Shipped.**
- `all-three.png` — the three side by side.

The shipped icon was cleaned up before use:

- Background set to exactly page `#0e0e10`.
- The mark recoloured to exactly mint `#3ddc97`, with smooth edges kept.

Files in `apps/mobile-app/assets/icons/`:

- `icon.png` — the mark on `#0e0e10`, the general Expo icon.
- `splash-icon.png` — the mark only, on a transparent background. Expo paints `#0e0e10` behind it.
- `icon-foreground.png` — the same mark-only image, used inside the iOS icon folder.
- `showlog.icon/` — the iOS icon folder (`icon.json` plus `Assets/logo.png`), background `#0e0e10`.

The icon and splash screen only change on a new phone build, not on an update push. Check the splash screen on the preview build, not the simulator development build.
