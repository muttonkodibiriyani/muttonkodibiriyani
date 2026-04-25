#!/usr/bin/env bash
# Alshaya Investment Council — local demo launcher
# Tries Node (npx serve) first, falls back to Python's http.server.

set -e

PORT="${1:-3000}"
URL="http://localhost:${PORT}/index.html"

cd "$(dirname "$0")"

open_browser() {
  if command -v xdg-open >/dev/null 2>&1; then xdg-open "$URL" >/dev/null 2>&1 &
  elif command -v open >/dev/null 2>&1; then open "$URL" >/dev/null 2>&1 &
  fi
}

echo "  ╔══════════════════════════════════════════════════╗"
echo "  ║   Alshaya Investment Council — Local Demo        ║"
echo "  ║   v2.1.0                                         ║"
echo "  ╚══════════════════════════════════════════════════╝"
echo ""
echo "  Starting on:   ${URL}"
echo "  Stop server:   Ctrl+C"
echo ""

if command -v npx >/dev/null 2>&1; then
  echo "  Using:         npx serve (Node.js)"
  echo ""
  ( sleep 1; open_browser ) &
  exec npx --yes serve . -p "${PORT}" --no-clipboard
elif command -v python3 >/dev/null 2>&1; then
  echo "  Using:         python3 -m http.server"
  echo ""
  ( sleep 1; open_browser ) &
  exec python3 -m http.server "${PORT}"
elif command -v python >/dev/null 2>&1; then
  echo "  Using:         python -m http.server"
  echo ""
  ( sleep 1; open_browser ) &
  exec python -m http.server "${PORT}"
else
  echo "  ERROR: Neither Node.js nor Python is installed."
  echo "         Install Node 18+ from https://nodejs.org"
  echo "         or Python 3 from https://python.org"
  exit 1
fi
