#!/bin/bash
# Build a portable AppImage that uses the system's WebKit instead of bundled
# This avoids SIGILL on older CPUs due to AVX-512 in Arch's WebKit
set -e

cd "$(dirname "$0")/.."
PROJECT_ROOT="$(pwd)"
APPIMAGE_DIR="$PROJECT_ROOT/target/release/bundle/appimage"

echo "=== Step 1: Build with AppImage target ==="

# Temporarily enable appimage in tauri.conf.json
sed -i 's/"deb", "rpm"/"deb", "rpm", "appimage"/' tauri.conf.json

NO_STRIP=1 cargo tauri build --bundles appimage 2>&1 | tail -10

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
cd "$APPIMAGE_DIR"
"./$(basename "$APPIMAGE")" --appimage-extract > /dev/null 2>&1

echo ""
echo "=== Step 3: Remove bundled WebKit (cause of SIGILL) ==="
rm -f squashfs-root/usr/lib/libjavascriptcoregtk-4.1.so.0
rm -f squashfs-root/usr/lib/libwebkit2gtk-4.1.so.0
rm -f squashfs-root/usr/lib64/libjavascriptcoregtk-4.1.so.0 2>/dev/null || true
rm -f squashfs-root/usr/lib64/libwebkit2gtk-4.1.so.0 2>/dev/null || true

echo ""
echo "=== Step 4: Patch AppRun to use system WebKit ==="
# We keep the original AppRun.wrapped (which sets up LD_LIBRARY_PATH for bundled libs)
# and just modify the AppRun script to add system paths for WebKit
cat > squashfs-root/AppRun << 'APPRUN'
#!/bin/bash
set -e

this_dir="$(readlink -f "$(dirname "$0")")"

# Source GTK hooks (needed for theme/icon integration)
if [ -f "$this_dir/apprun-hooks/linuxdeploy-plugin-gtk.sh" ]; then
    source "$this_dir/apprun-hooks/linuxdeploy-plugin-gtk.sh"
fi

# If bundled WebKit is missing, add system library paths
# This allows the AppImage to run on any CPU generation
# by using the system's WebKit instead of the bundled one
if [ ! -f "$this_dir/usr/lib/libwebkit2gtk-4.1.so.0" ]; then
    export LD_LIBRARY_PATH="/usr/lib:/usr/lib64:/lib:/lib64:$LD_LIBRARY_PATH"
fi

# Use AppRun.wrapped which sets up env for other bundled libraries (GTK, Soup, etc.)
if [ -f "$this_dir/AppRun.wrapped" ]; then
    exec "$this_dir/AppRun.wrapped" "$@"
else
    exec "$this_dir/usr/bin/app" "$@"
fi
APPRUN
chmod +x squashfs-root/AppRun

echo ""
echo "=== Step 5: Repack AppImage ==="
VERSION="0.1.0"
ARCH=x86_64
OUTPUT="$APPIMAGE_DIR/Hub-Turismo-$VERSION-$ARCH.AppImage"

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

# Cleanup
rm -rf squashfs-root

echo ""
echo "=== Done! ==="
echo "Portable AppImage: $OUTPUT"
echo ""
echo "NOTE: This AppImage requires the system package 'webkit2gtk-4.1'"
echo "to be installed on the target machine:"
echo ""
echo "  # Arch Linux"
echo "  sudo pacman -S webkit2gtk-4.1"
echo ""
echo "  # Ubuntu/Debian"
echo "  sudo apt install libwebkitgtk-6.0-4 libjavascriptcoregtk-4.1-0"
echo ""
echo "  # Fedora"
echo "  sudo dnf install webkitgtk6.0 javascriptcoregtk4.1"
echo ""
echo "It will NOT bundle WebKit, so it works on ANY CPU generation."
