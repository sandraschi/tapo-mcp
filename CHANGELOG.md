# Changelog

## [0.1.0] — 2026-07-24

### Added
- Initial scaffold: FastMCP server with tapo_plug + tapo_camera tools
- Tapo smart plug driver (discover, status, toggle, energy history)
- Tapo camera driver (snapshot, PTZ, privacy mode, LED, stream URL)
- SQLite time-series DB for plug energy monitoring
- FastAPI REST backend with /api/plugs/* and /api/cameras/* endpoints
- React + Vite + TailwindCSS webapp (Dashboard, Cameras, Plugs, Trends, Settings)
- recharts AreaChart for energy trends (12h/24h/72h/168h)
- Ports: 11102 backend, 11103 frontend
- Per SPEC.md: cameras + plugs under single brand
