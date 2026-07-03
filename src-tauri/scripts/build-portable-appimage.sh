#!/bin/bash
# Build a portable AppImage that uses the system's WebKit instead of bundled
# This avoids SIGILL on older CPUs due to AVX-512 in Arch's WebKit
set -e

cd "$(dirname "$0")/.."
PROJECT_ROOT="$(pwd)"
APPIMAGE_DIR="$PROJECT_ROOT/target/release/bundle/appimage"
SCRIPT_DIR="$PROJECT_ROOT/scripts"

echo "=== Step 1: Build with AppImage target ==="

# Temporarily enable appimage in tauri.conf.json
sed -i 's/"deb", "rpm"/"deb", "rpm", "appimage"/' tauri.conf.json

NO_STRIP=1 cargo tauri build --bundles appimage 2>&1 | tail -20

# Restore original targets
sed -i 's/"deb", "rpm", "appimage"/"deb", "rpm"/' tauri.conf.json

# Find the generated AppImage
APPIMAGE=$(ls "$APPIMAGE_DIR"/*.AppImage 2>/dev/null | head -1)
if [ -z "$APPIMAGE" ]; then
    echo "ERROR: No AppImage found in $APPIMAGE_DIR"
    exit 1
fi

echo ""
echo "=== Step 2: Extract AppImage ==="
EXTRACT_DIR="$APPIMAGE_DIR/squashfs-root"
if [ -d "$EXTRACT_DIR" ]; then
    rm -rf "$EXTRACT_DIR"
fi

chmod +x "$APPIMAGE"
"$APPIMAGE" --appimage-extract > /dev/null 2>&1
cd "$APPIMAGE_DIR"

echo ""
echo "=== Step 3: Remove bundled WebKit (cause of SIGILL) ==="
rm -f squashfs-root/usr/lib/libjavascriptcoregtk-4.1.so.0
rm -f squashfs-root/usr/lib/libwebkit2gtk-4.1.so.0
rm -f squashfs-root/usr/lib64/libjavascriptcoregtk-4.1.so.0 2>/dev/null || true
rm -f squashfs-root/usr/lib64/libwebkit2gtk-4.1.so.0 2>/dev/null || true

echo ""
echo "=== Step 4: Create wrapper AppRun that uses system WebKit ==="
cat > squashfs-root/AppRun << 'APPRUN'
#!/bin/bash
# Wrapper that uses system WebKit if bundled ones are missing
APPDIR="$(dirname "$(readlink -f "$0")")"

# If bundled WebKit is missing, use system libraries
if [ ! -f "$APPDIR/usr/lib/libwebkit2gtk-4.1.so.0" ]; then
    export LD_LIBRARY_PATH="/usr/lib:/usr/lib64:$LD_LIBRARY_PATH"
fi

exec "$APPDIR/usr/bin/app" "$@"
APPRUN
chmod +x squashfs-root/AppRun

echo ""
echo "=== Step 5: Repack AppImage ==="
VERSION="0.1.0"
ARCH=x86_64
OUTPUT="$APPIMAGE_DIR/Hub-Turismo-$VERSION-$ARCH.AppImage"

# Try to use appimagetool from PATH or common locations
APPIMAGETOOL=""
if command -v appimagetool &>/dev/null; then
    APPIMAGETOOL="appimagetool"
elif [ -f "/usr/lib/appimagekit/appimagetool" ]; then
    APPIMAGETOOL="/usr/lib/appimagekit/appimagetool"
else
    echo "appimagetool not found. Installing via pacman..."
    sudo pacman -S --noconfirm appimagekit
    APPIMAGETOOL="appimagetool"
fi

ARCH=x86_64 "$APPIMAGETOOL" squashfs-root "$OUTPUT"

echo ""
echo "=== Done! ==="
echo "Portable AppImage: $OUTPUT"
echo ""
echo "NOTE: This AppImage REQUIRES webkitgtk-6.0 and javascriptcoregtk-4.1"
echo "to be installed on the target system:"
echo "  sudo pacman -S webkitgtk-6.0 javascriptcoregtk-4.1"
echo ""
echo "It will NOT bundle WebKit, so it works on ANY CPU generation."
