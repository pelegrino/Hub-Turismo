# Maintainer: Pelegrino <pelegrino@github>
# PKGBUILD for Hub Turismo - Agenda de Contatos

pkgname=hub-turismo
pkgver=0.1.0
pkgrel=1
pkgdesc="Agenda de Contatos para o Setor de Turismo - Aplicação desktop moderna com Rust + Tauri"
arch=('x86_64')
url="https://github.com/pelegrino/Hub-Turismo"
license=('MIT')
depends=(
    'webkitgtk-6.0'
    'libwebkitgtk-6.0-4'
    'libjavascriptcoregtk-4.1-0'
    'gtk3'
    'libsoup3'
    'glib2'
    'cairo'
    'gdk-pixbuf2'
    'pango'
    'atk'
)
makedepends=(
    'cargo'
    'nodejs'
    'npm'
    'rust'
)
source=("$pkgname-$pkgver.tar.gz::https://github.com/pelegrino/Hub-Turismo/archive/refs/tags/v$pkgver.tar.gz")
sha256sums=('SKIP')

build() {
    cd "$srcdir/Hub-Turismo-$pkgver"

    # Build frontend
    cd frontend
    npm install
    npm run build
    cd ..

    # Build backend
    cd src-tauri
    cargo build --release --locked
    cd ..
}

package() {
    cd "$srcdir/Hub-Turismo-$pkgver"

    install -Dm755 "src-tauri/target/release/app" "$pkgdir/usr/bin/hub-turismo"

    install -Dm644 "src-tauri/icons/icon.png" "$pkgdir/usr/share/pixmaps/hub-turismo.png"
    install -Dm644 "src-tauri/icons/128x128.png" "$pkgdir/usr/share/icons/hicolor/128x128/apps/hub-turismo.png"
    install -Dm644 "src-tauri/icons/32x32.png" "$pkgdir/usr/share/icons/hicolor/32x32/apps/hub-turismo.png"

    install -Dm644 /dev/stdin "$pkgdir/usr/share/applications/hub-turismo.desktop" <<EOF
[Desktop Entry]
Name=Hub Turismo
Comment=Agenda de Contatos para o Setor de Turismo
Exec=hub-turismo
Icon=hub-turismo
Terminal=false
Type=Application
Categories=Office;Database;Network;
StartupNotify=true
EOF
}
