# Cartera - Personal Finance Manager

Una aplicación de gestión financiera personal construida con React Native, Expo y TypeScript.

## ✨ Características Principales

### 💰 Finanzas Personales
- ✅ **Registra transacciones**: Ingresos, gastos y ventas con 10+ categorías
- ✅ **Balance automático**: Cálculo en tiempo real (Ingresos + Ventas - Gastos)
- ✅ **Historial completo**: Todas tus transacciones organizadas por fecha
- ✅ **Edición rápida**: Toca cualquier transacción para editarla o eliminarla

### 📦 Gestión de Inventario
- ✅ **Catálogo de productos**: Agrega productos con nombre, precio, costo y stock
- ✅ **Venta directa**: Botón "Vender" que reduce stock automáticamente
- ✅ **Cálculo de ganancias**: Muestra ganancia por producto (Precio - Costo)
- ✅ **Alertas de stock**: Indicadores visuales para stock bajo y agotado
- ✅ **Control total**: Edita, elimina o vende productos desde la misma pantalla

### 🎨 Interfaz Moderna
- ✅ **Temas**: Modo claro, oscuro y automático (adapta al sistema)
- ✅ **Navegación dual**: Menú lateral (drawer) + tabs inferiores
- ✅ **Diseño adaptable**: Se ve perfecto en cualquier dispositivo
- ✅ **Iconos de colores**: Identificación visual rápida de categorías

### 🌍 Accesibilidad
- ✅ **Multiidioma**: Español e Inglés completamente traducidos
- ✅ **13 monedas soportadas**: USD, EUR, MXN, ARS, COP, CLP, BRL, CAD, AUD, CNY, INR, GBP, JPY
- ✅ **Funciona offline**: 100% local, sin necesidad de internet
- ✅ **Exportación de datos**: Respaldo en formato JSON

### 📊 Panel de Control
- ✅ **Balance del mes**: Con colores dinámicos (verde/rojo)
- ✅ **Tarjetas de resumen**: Ingresos y gastos separados
- ✅ **Últimas transacciones**: Vista rápida de movimientos recientes
- ✅ **Pull-to-refresh**: Actualiza deslizando hacia abajo

## Instalación

1. Asegúrate de tener Node.js instalado
2. Instala las dependencias:

```bash
npm install
```

## Ejecutar la aplicación

### Modo desarrollo

```bash
npm start
```

Esto abrirá Expo Go donde podrás:
- Escanear el código QR con la app Expo Go en tu teléfono
- Presionar `i` para abrir en simulador iOS
- Presionar `a` para abrir en emulador Android
- Presionar `w` para abrir en el navegador

### Scripts disponibles

- `npm start` - Inicia el servidor de desarrollo
- `npm run android` - Abre en emulador Android
- `npm run ios` - Abre en simulador iOS
- `npm run web` - Abre en navegador

## Estructura del proyecto

```
src/
├── components/      # Componentes reutilizables
├── constants/       # Constantes (monedas, categorías)
├── i18n/           # Traducciones (ES/EN)
├── navigation/     # Configuración de navegación
├── screens/        # Pantallas de la app
├── storage/        # Sistema de almacenamiento local
├── theme/          # Sistema de temas
├── types/          # Tipos TypeScript
└── utils/          # Utilidades
```

## Funcionalidades principales

### Navegación
- **Menú lateral (Drawer)**: Accede deslizando desde la izquierda o tocando el icono de menú (☰)
  - Muestra tu balance actual del mes
  - Acceso rápido a configuración
  - Diseño elegante y moderno
- **Navegación inferior (Tabs)**: Alterna rápidamente entre:
  - Dashboard
  - Transacciones
  - Productos

### Dashboard
- Balance total del mes actual con colores dinámicos
- Tarjetas de ingresos y gastos separadas
- Lista de transacciones recientes
- Pull-to-refresh para actualizar datos

### Transacciones
- Crear, editar y eliminar transacciones
- 3 tipos: Ingreso, Gasto, Venta
- Categorizar con 10+ categorías predefinidas
- Iconos de colores para identificación visual rápida
- Modal de edición full-screen

### Productos (Gestión de Inventario)
- **Crear productos**: Nombre, descripción, precio, costo, stock
- **Vender productos** 🆕: Botón directo en cada producto
  - Reduce stock automáticamente
  - Crea transacción de venta
  - Calcula total en tiempo real
- **Cálculo de ganancias**: Precio - Costo por unidad
- **Alertas de stock**:
  - 🟡 Badge amarillo: Stock bajo (< 5 unidades)
  - 🔴 Badge rojo: Sin stock (0 unidades)
- **Acciones rápidas**: Botones "Editar" y "Vender" en cada tarjeta

### Configuración
- Cambiar idioma (Español/English)
- Seleccionar entre 13 monedas
- Cambiar tema (Claro/Oscuro/Automático)
- Exportar todos los datos en JSON
- Limpiar todos los datos con confirmación

## Tecnologías

- **React Native** - Framework mobile
- **Expo** - Plataforma de desarrollo
- **TypeScript** - Tipado estático
- **React Navigation** - Navegación (Drawer Navigator)
- **React Native Gesture Handler** - Gestos nativos
- **React Native Reanimated** - Animaciones fluidas
- **AsyncStorage** - Almacenamiento local
- **i18next** - Internacionalización
- **Expo Vector Icons** - Iconos

## 📚 Documentación

- **[Guía de Uso Completa](GUIA_DE_USO.md)**: Aprende a usar todas las funciones
- **README.md** (este archivo): Información técnica y de instalación

## 🎯 Casos de Uso

### Para Finanzas Personales
1. Registra tus gastos e ingresos diarios
2. Revisa tu balance mensual
3. Identifica en qué categorías gastas más
4. Exporta tus datos para análisis

### Para Pequeños Negocios
1. Crea tu catálogo de productos
2. Usa "Vender" para cada venta (reduce stock automáticamente)
3. Monitorea ganancias por producto
4. Control de inventario con alertas de stock
5. Registra gastos del negocio
6. Revisa tu balance de ingresos vs gastos

## 🔄 Flujo de Venta de Productos

```
1. Producto creado → Stock: 10 unidades
2. Cliente compra → Toca "Vender"
3. Ingresa cantidad → Ej: 2
4. Sistema automático:
   ├─ Reduce stock (10 → 8)
   ├─ Crea transacción "Venta de 2x [Producto]"
   └─ Actualiza balance
5. ✅ Venta completada
```

## 💾 Almacenamiento

- **Local**: AsyncStorage (React Native)
- **Offline**: 100% funcional sin internet
- **Privado**: Los datos solo están en tu dispositivo
- **Respaldo**: Función de exportación a JSON

## 🚀 Próximas Funciones

- [ ] Importar datos desde JSON
- [ ] Gráficas de gastos por categoría
- [ ] Filtros y búsqueda en transacciones
- [ ] Sincronización con Drive/iCloud
- [ ] Recordatorios de gastos recurrentes
- [ ] Modo múltiples cuentas/billeteras

## Licencia

MIT
