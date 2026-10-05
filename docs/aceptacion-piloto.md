# Lista de aceptación del piloto (I08, #10)

Se ejecuta contra https://chatarreria-el-cocha.netlify.app/ con el cliente presente. Marca cada paso al verlo funcionar. El cliente empieza a usar el sistema solo cuando todo está marcado.

## Antes de empezar

- [ ] El respaldo diario corrió en verde al menos una vez ([respaldos.md](respaldos.md), #34).
- [ ] Producción no tiene datos ficticios de demo (`db:demo` nunca se ejecutó allí). Revisa Materiales e Historial.
- [ ] El administrador tiene usuario asignado y el trabajador está creado desde **Usuarios**.

## Acceso y seguridad

- [ ] Sin sesión, abrir `/`, `/materiales` y `/inventario` lleva a `/ingresar`.
- [ ] No existe pantalla ni opción de registro público.
- [ ] Usuario o contraseña equivocados muestran el mismo mensaje genérico.
- [ ] El trabajador entra con su usuario y no ve Inventario, Historial ni Usuarios; si escribe esas direcciones, vuelve al inicio.
- [ ] El administrador desactiva al trabajador: su sesión abierta se cierra y no puede volver a entrar. Se reactiva y entra de nuevo.

## Operación completa (computador)

- [ ] Se crea un material con sus tarifas.
- [ ] Se registra una compra y el inventario aumenta.
- [ ] Se registra una venta válida y el inventario baja.
- [ ] Se imprime el recibo de la venta.
- [ ] Una venta mayor al stock se rechaza con mensaje claro.
- [ ] Se anula una operación de prueba y el inventario se recalcula.
- [ ] Se cierra sesión, se entra desde otro dispositivo y los registros siguen ahí.

## Teléfono real

- [ ] Inicia sesión desde el navegador del teléfono.
- [ ] Registra una compra o una venta, consulta el inventario y vuelve a ver el registro guardado.
- [ ] La app se instala desde el navegador (PWA) con nombre e icono del negocio.
- [ ] Sin conexión la app avisa que se requiere conexión; no aparenta guardar operaciones.

## Entrega al cliente

- [ ] El cliente recibe la URL y su acceso inicial por un canal seguro.
- [ ] Recibe la guía breve de operación y a quién escribir para soporte.
- [ ] Las operaciones de prueba hechas aquí se anularon o se eliminaron antes de empezar con datos reales.
