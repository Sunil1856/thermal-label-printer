#!/usr/bin/env bash
# ==============================================================================
# ThermalPrint CAD - Cross-Platform Launcher for Linux & macOS
# ==============================================================================

# Detect OS
OS_NAME="$(uname -s)"
case "${OS_NAME}" in
    Darwin*)    PLATFORM="macOS";;
    Linux*)     PLATFORM="Linux";;
    *)          PLATFORM="${OS_NAME}";;
esac

echo "======================================================"
echo "🚀 Starting ThermalPrint CAD Studio for ${PLATFORM}"
echo "======================================================"

# Change working directory to this script's directory
cd "$(dirname "$0")" || exit 1

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not found on your system."
    echo ""
    echo "Please install Node.js (v18 or newer):"
    if [ "${PLATFORM}" = "macOS" ]; then
        echo "👉 Run in terminal: brew install node"
        echo "   Or download from: https://nodejs.org"
    else
        echo "👉 Ubuntu / Debian: sudo apt update && sudo apt install nodejs npm"
        echo "👉 Fedora / RHEL:   sudo dnf install nodejs"
        echo "👉 Arch Linux:      sudo pacman -S nodejs npm"
        echo "   Or download from: https://nodejs.org"
    fi
    exit 1
fi

echo "✅ Node.js detected: $(node -v)"

# Check if Electron desktop app is available
if [ -d "node_modules/electron" ] || command -v npx &> /dev/null; then
    echo "✨ Desktop Mode detected."
fi

# Start local server in background
echo "📡 Starting local server on port 3000..."
node server.js &
SERVER_PID=$!

# Wait for server to bind
sleep 1.2

URL="http://localhost:3000"
echo "🌐 Opening ${URL} in your default browser..."

if [ "${PLATFORM}" = "macOS" ]; then
    open "${URL}" 2>/dev/null || open -a "Google Chrome" "${URL}" 2>/dev/null
elif [ "${PLATFORM}" = "Linux" ]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open "${URL}" 2>/dev/null &
    elif command -v gnome-open &> /dev/null; then
        gnome-open "${URL}" 2>/dev/null &
    elif command -v google-chrome &> /dev/null; then
        google-chrome "${URL}" 2>/dev/null &
    elif command -v firefox &> /dev/null; then
        firefox "${URL}" 2>/dev/null &
    else
        echo "👉 Please open ${URL} in your browser."
    fi
fi

echo ""
echo "======================================================"
echo "🟢 ThermalPrint CAD is running!"
echo "   URL: http://localhost:3000"
echo "   Press Ctrl+C to stop the server."
echo "======================================================"

# Trap termination signals to kill background server
trap 'echo "Stopping server..."; kill ${SERVER_PID} 2>/dev/null; exit 0' INT TERM
wait ${SERVER_PID}
