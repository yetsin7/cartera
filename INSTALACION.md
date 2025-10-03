# 📱 Cartera - Instalación y Ejecución

## ✅ Requisitos Previos

- **Node.js** (versión 18 o superior)
- **npm** o **yarn**
- **Expo Go** app en tu teléfono (iOS o Android)
  - [Descargar para iOS](https://apps.apple.com/app/expo-go/id982107779)
  - [Descargar para Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

## 🚀 Instalación

1. **Clonar el repositorio:**
```bash
git clone https://github.com/yetsin7/cartera.git
cd cartera
```

2. **Instalar dependencias:**
```bash
npm install
```

## ▶️ Ejecutar la Aplicación

### Opción 1: Expo Go (Recomendado para desarrollo)

```bash
npm start
```

Esto abrirá Expo DevTools. Luego:
- Escanea el código QR con tu teléfono
  - **iOS**: Usa la app Cámara para escanear
  - **Android**: Usa la app Expo Go para escanear

### Opción 2: Emulador

**iOS Simulator (solo macOS):**
```bash
npm run ios
```

**Android Emulator:**
```bash
npm run android
```

## 🔧 Comandos Disponibles

```bash
# Iniciar el servidor de desarrollo
npm start

# Iniciar en iOS
npm run ios

# Iniciar en Android
npm run android

# Limpiar caché y reiniciar
npm start -- --clear

# Verificar TypeScript
npx tsc --noEmit

# Compilar para producción
eas build
```

## 📱 Probar en Dispositivo Físico

1. Asegúrate de que tu computadora y teléfono estén en la **misma red WiFi**
2. Ejecuta `npm start`
3. Escanea el código QR con Expo Go
4. La aplicación se cargará en tu teléfono

## 🏗️ Build para Producción

### Configurar EAS Build

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login en Expo
eas login

# Configurar proyecto
eas build:configure

# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios
```

## 🐛 Solución de Problemas

### Error de dependencias
```bash
rm -rf node_modules package-lock.json
npm install
```

### Caché de Expo
```bash
npm start -- --clear
```

### Puerto ocupado
```bash
# Matar proceso en puerto 19000
npx kill-port 19000
```

## 📚 Recursos Adicionales

- [Documentación de Expo](https://docs.expo.dev)
- [Guía de React Native](https://reactnative.dev/docs/getting-started)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Publicar en Play Store](https://docs.expo.dev/submit/android/)
- [Publicar en App Store](https://docs.expo.dev/submit/ios/)

## 🔐 Variables de Entorno

La aplicación funciona 100% offline, no requiere configuración de variables de entorno.

## 📞 Soporte

Si encuentras algún problema:
1. Revisa los [Issues en GitHub](https://github.com/yetsin7/cartera/issues)
2. Crea un nuevo issue si es necesario
3. Incluye logs y capturas de pantalla

---

✨ **¡Listo para desarrollar!** La aplicación está optimizada y lista para ser publicada en las tiendas.
