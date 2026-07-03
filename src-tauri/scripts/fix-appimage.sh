#!/bin/bash
# Fix AppImage by removing bundled WebKit libraries (which have CPU-specific instructions)
# The app will use the system's WebKit libraries instead.

set -e

APPIMAGE_PATH="$1"
if [ -z "$APPIMAGE_PATH" ]; then
    echo "Usage: $0 <path-to-AppImage>"
    exit 1
fi

if [ ! -f "$APPIMAGE_PATH" ]; then
    echo "File not found: $APPIMAGE_PATH"
    exit 1
fi

echo "Extracting AppImage..."
cd "$(dirname "$APPIMAGE_PATH")"
APPIMAGE_NAME="$(basename "$APPIMAGE_PATH")"
EXTRACT_DIR="squashfs-root"

if [ -d "$EXTRACT_DIR" ]; then
    rm -rf "$EXTRACT_DIR"
fi

"./$APPIMAGE_NAME" --appimage-extract > /dev/null 2>&1

echo "Removing bundled WebKit libraries..."
rm -f "$EXTRACT_DIR/usr/lib/libjavascriptcoregtk-4.1.so.0" 2>/dev/null || true
rm -f "$EXTRACT_DIR/usr/lib/libwebkit2gtk-4.1.so.0" 2>/dev/null || true

echo "Listing remaining .so files..."
ls "$EXTRACT_DIR/usr/lib/"*.so* 2>/dev/null | head -5

echo "Repacking AppImage..."
VERSION="0.1.0"
ARCH=x86_64
OUTPUT="$EXTRACT_DIR/../HubTurismo-fixed-$VERSION-$ARCH.AppImage"

appimagetool "$EXTRACT_DIR" "$OUTPUT"

echo "Done! Fixed AppImage: $OUTPUT"
