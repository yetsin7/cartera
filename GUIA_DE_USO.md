# Guía de Uso - Cartera

## 📱 Introducción

Cartera es una aplicación móvil completa para gestionar tus finanzas personales y negocios pequeños. Todo funciona offline, sin necesidad de internet.

## 🚀 Inicio Rápido

### Primera vez usando la app

1. **Abre la aplicación** - Verás el Dashboard vacío
2. **Configura tu idioma y moneda** - Ve al menú lateral (☰) → Ajustes
3. **Empieza a registrar transacciones** - Usa el botón "+" en la pantalla de Transacciones

## 🗂️ Navegación

### Menú Lateral (Drawer)
- **Abrir**: Desliza desde la izquierda o toca el icono ☰
- **Muestra**: Tu balance actual del mes
- **Opciones**: Inicio y Ajustes

### Navegación Inferior (Tabs)
- **🏠 Dashboard**: Resumen general
- **📝 Transacciones**: Historial de movimientos
- **📦 Productos**: Inventario de productos

## 💰 Gestión de Transacciones

### Crear una Transacción

1. Ve a la pestaña **Transacciones**
2. Toca el botón **+** (esquina inferior derecha)
3. Selecciona el **tipo**:
   - **Ingreso**: Dinero que recibes (salario, ventas, etc.)
   - **Gasto**: Dinero que gastas
   - **Venta**: Venta de productos (se creará automáticamente al vender)

4. Completa los datos:
   - **Monto**: Cantidad de dinero
   - **Descripción**: Detalles de la transacción
   - **Categoría**: Selecciona de 10+ categorías disponibles

5. Toca **Guardar**

### Editar una Transacción

1. En la lista de transacciones, **toca** cualquier transacción
2. Modifica los campos que necesites
3. Toca **Guardar**
4. Para eliminar, usa el botón **Eliminar** al final del formulario

### Categorías Disponibles

**Gastos:**
- 🍽️ Comida
- 🚗 Transporte
- 🎮 Entretenimiento
- 🏥 Salud
- 🛒 Compras
- 🔧 Servicios
- 📌 Otro

**Ingresos:**
- 💵 Salario
- 💼 Negocios
- ➕ Otro

## 📦 Gestión de Productos

### Crear un Producto

1. Ve a la pestaña **Productos**
2. Toca el botón **+** (esquina inferior derecha)
3. Completa la información:
   - **Nombre**: Nombre del producto (requerido)
   - **Descripción**: Detalles adicionales (opcional)
   - **Precio**: Precio de venta (requerido)
   - **Costo**: Costo de adquisición (opcional, para calcular ganancia)
   - **Stock**: Cantidad disponible (requerido)
   - **Categoría**: Tipo de producto (opcional)

4. Toca **Guardar**

### Vender un Producto 🎯 NUEVA FUNCIÓN

1. En la lista de productos, busca el producto que quieres vender
2. Toca el botón **Vender** (botón verde)
3. Ingresa la **cantidad** a vender
4. Verás el **total** calculado automáticamente
5. Toca **Vender**

**¿Qué sucede al vender?**
- ✅ El stock del producto se reduce automáticamente
- ✅ Se crea una transacción de tipo "Venta"
- ✅ Tu balance se actualiza inmediatamente

### Editar un Producto

1. Toca el botón **Editar** en cualquier tarjeta de producto
2. Modifica los campos necesarios
3. Toca **Guardar**

### Indicadores de Stock

- **🟢 Stock normal**: El número aparece en color normal
- **🟡 Stock bajo**: El número aparece en amarillo (< 5 unidades)
- **🔴 Sin stock**: El número aparece en rojo (0 unidades)
- **Badge "Stock bajo"**: Aparece cuando quedan menos de 5 unidades
- **Badge "Sin stock"**: Aparece cuando no hay unidades disponibles

### Cálculo de Ganancias

Si agregas el **costo** del producto, la app calculará automáticamente:
- **Ganancia por unidad** = Precio - Costo
- Se muestra en la tarjeta del producto en color verde

## 📊 Dashboard

El Dashboard muestra:

### Balance del Mes
- **Color verde**: Balance positivo (ganas más de lo que gastas)
- **Color rojo**: Balance negativo (gastas más de lo que ganas)
- **Fórmula**: Ingresos + Ventas - Gastos

### Tarjetas de Resumen
- **Ingresos**: Total de ingresos del mes
- **Gastos**: Total de gastos del mes

### Transacciones Recientes
- Muestra las últimas 5 transacciones
- Iconos de colores según el tipo:
  - 🔴 Flecha arriba: Gasto
  - 🟢 Flecha abajo: Ingreso
  - 🟣 Carrito: Venta

### Actualizar Datos
- **Desliza hacia abajo** (pull-to-refresh) para actualizar

## ⚙️ Configuración

### Cambiar Idioma

1. Abre el menú lateral (☰)
2. Ve a **Ajustes**
3. Toca **Idioma**
4. Selecciona: **Español** o **English**

### Cambiar Moneda

1. Ve a **Ajustes** → **Moneda**
2. Selecciona de 13 monedas disponibles:
   - USD ($), EUR (€), GBP (£), JPY (¥)
   - MXN, ARS, COP, CLP, BRL
   - CAD, AUD, CNY, INR

### Cambiar Tema

1. Ve a **Ajustes** → **Tema**
2. Opciones:
   - **Claro**: Siempre modo claro
   - **Oscuro**: Siempre modo oscuro
   - **Automático**: Se adapta al sistema del teléfono

### Exportar Datos

1. Ve a **Ajustes** → **Exportar datos**
2. Se creará un archivo JSON con:
   - Todas tus transacciones
   - Todos tus productos
   - Tu configuración
   - Fecha de exportación

3. Comparte el archivo por WhatsApp, email, Drive, etc.

### Limpiar Datos

1. Ve a **Ajustes** → **Limpiar datos**
2. **Confirma la acción** (esta acción NO se puede deshacer)
3. Se eliminarán:
   - ✅ Todas las transacciones
   - ✅ Todos los productos
   - ❌ Tu configuración (idioma, moneda, tema) se mantiene

## 💾 Almacenamiento de Datos

### ¿Dónde se guardan mis datos?

- **Localmente** en tu dispositivo
- Usa AsyncStorage (base de datos local de React Native)
- **No necesita internet**
- **Privado y seguro** - solo tú tienes acceso

### ¿Cuándo se guardan los datos?

- Automáticamente al:
  - Crear/editar/eliminar transacciones
  - Crear/editar/eliminar productos
  - Vender productos
  - Cambiar configuración

### Respaldo de Datos

**Recomendado:** Exporta tus datos regularmente
- Ve a Ajustes → Exportar datos
- Guarda el archivo en Drive, iCloud, o envíalo por email
- En caso de cambiar de teléfono, podrás importar tus datos (función próximamente)

## 🎯 Flujos de Trabajo Recomendados

### Para Uso Personal

1. **Registra gastos diarios** al momento de realizarlos
2. **Revisa tu balance** semanalmente en el Dashboard
3. **Exporta tus datos** mensualmente como respaldo

### Para Pequeños Negocios

1. **Agrega tus productos** con precio y costo
2. **Usa la función "Vender"** para cada venta
   - Esto reduce el stock automáticamente
   - Crea la transacción de venta
3. **Registra gastos** del negocio (compras, servicios, etc.)
4. **Monitorea ganancias** por producto
5. **Revisa stock** regularmente para reordenar

### Ejemplo de Venta de Producto

**Escenario:** Vendes una playera

1. Tienes el producto "Playera Azul" con:
   - Precio: $200
   - Costo: $100
   - Stock: 10

2. Cliente compra 2 playeras:
   - Ve a Productos
   - Toca "Vender" en Playera Azul
   - Ingresa cantidad: 2
   - Total mostrado: $400
   - Toca "Vender"

3. Resultado automático:
   - ✅ Stock actualizado: 8 unidades
   - ✅ Transacción creada: "Venta de 2x Playera Azul - $400"
   - ✅ Balance aumentado en $400
   - ✅ Ganancia obtenida: $200 (2 × ($200-$100))

## 🔧 Solución de Problemas

### No veo mis transacciones
- Verifica que estés en el mes correcto (el Dashboard solo muestra el mes actual)
- Ve a la pestaña Transacciones para ver todas

### El balance está incorrecto
- Desliza hacia abajo en el Dashboard para actualizar
- Verifica que todas las transacciones tengan el tipo correcto

### No puedo vender un producto
- Verifica que el producto tenga stock > 0
- El botón "Vender" solo aparece si hay stock disponible

### La app está en inglés
- Ve a Ajustes → Idioma → Español

## 📱 Requisitos del Sistema

- iOS 13+ o Android 7+
- Espacio: ~50MB
- Internet: NO requerido (funciona 100% offline)

## 🆘 Soporte

Si encuentras algún problema:
1. Verifica que tengas la última versión
2. Intenta cerrar y abrir la app
3. Como último recurso: Exporta tus datos y reinstala la app

---

**¡Disfruta gestionando tus finanzas con Cartera! 💰📱**
