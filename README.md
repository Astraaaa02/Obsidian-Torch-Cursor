# Cursor Torch

Write like you're holding a torch in the dark. Cursor Torch turns the text cursor in Obsidian's editor into a warm, flickering light source: text near the caret glows in torchlight while the rest of the note fades into darkness.

## Features

- **Torch glow** — a flame-shaped glow (white-hot core fading through warm orange) pinned to your caret. It follows every keystroke, cursor movement, and scroll.
- **Darkness overlay** — the rest of the editor sinks into shadow, with a pool of light around the cursor that dims gradually with distance. The darkness fades out when the editor loses focus so the app stays usable.
- **Ambient halo** — a faint wash of warm light spills a few lines above and below the cursor, like real light falling on nearby text.
- **Ember caret** — optionally replaces the plain caret with a glowing gradient bar (yellow → orange → pink → purple).
- **Flicker** — the glow subtly wavers in brightness and size like a real flame. Automatically disabled if your OS requests reduced motion.

Looks best on dark themes, where the glow blends like real light. On light themes the glow falls back to a softer overlay so text stays readable.

## How to use

1. Enable the plugin in **Settings → Community plugins**.
2. Open any note and click into the editor — the torch lights up at your cursor.
3. Tune the effect in **Settings → Cursor Torch**:

| Setting | What it does |
| --- | --- |
| Glow size | Height of the flame glow in pixels (width scales with it). |
| Glow intensity | How bright the torch burns. |
| Torch color | Main color of the flame; the core always stays warm white. |
| Darkness | How dark the unlit text gets. `0` disables the darkness effect; `0.7–0.95` feels like true night. |
| Light reach | How far the torchlight reaches (in pixels) before the darkness takes over. |
| Flicker | Toggle the flame-like wavering. |
| Ember caret | Toggle the glowing gradient caret bar. |
| Only in focused editor | Show the torch only in the pane you are typing in. |

To turn off the "writing in the dark" effect but keep the glow, set **Darkness** to `0`.



## License

[MIT](LICENSE)
