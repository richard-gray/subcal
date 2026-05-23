# subcal.io

A keyboard-driven IPv4 and IPv6 subnet calculator that lives in a single static HTML file. No build step, no dependencies, no tracking.

Live at <https://subcal.io>.

## What it does

- IPv4 and IPv6 (auto-detected by the presence of `:`)
- Network, broadcast, host range, wildcard mask, hex mask, full binary view
- For IPv6: canonical (RFC 5952) and expanded forms, total address count
- VLSM splitter — pick a child prefix, get a copyable list of subnets
- URL hash deep-links: `https://subcal.io/#192.168.0.0/24`
- Light and dark themes (follows your OS)
- Self-tests on every page load (open the console to see `subcal: all self-tests passed.`)

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `↑` / `↓` | next / previous subnet |
| `→` / `←` or `]` / `[` | grow / shrink prefix |
| `c` / `C` | copy network / CIDR |
| `b` | copy broadcast (v4) |
| `h` / `H` | copy first / last host or address |
| `m` / `w` / `x` | copy mask / wildcard / hex mask (v4) |
| `e` | copy expanded form (v6) |
| `v` | toggle VLSM list |
| `/` | focus the address input |
| `?` | shortcut overlay |
| `Esc` | close overlay / blur |

Click any output to copy it.

## Project principles

1. **Single file, no dependencies.** Everything is in `index.html`. Open it in a browser and it works.
2. **Power user first.** Functionality and usability over decoration. Keyboard-driven, predictable, fast.
3. **Copy-paste must work.** Every result is one click or one keypress away from the clipboard.

## Contributing

PRs welcome. The math has inline self-tests at the bottom of the script — if you change a calculation, the failures show up in the browser console on load.

## Author

Richard Gray — [@goodgigs](https://github.com/richard-gray)
