# pedidos-frigorifico-v1.8

Sitio web estático para gestionar pedidos mayoristas de cajones de pollo kosher. Incluye un panel de clientes para registrar pedidos y un panel exclusivo para administradores donde se puede gestionar stock, precios, historial de compras, entregas y accesos de administradores.

## Cómo usar

1. Abra `index.html` en su navegador para acceder al sitio.
2. Desde la portada podrá elegir entre el panel de **clientes** o el de **administradores**.
3. Los clientes completan el formulario con el nombre del local, la dirección, el tipo de cajón y la cantidad deseada. El pedido queda guardado para ser administrado posteriormente.
4. Los administradores ingresan con usuario y contraseña preconfigurados en el código (`script.js`). Cada administrador debe indicar su nombre visible, que quedará registrado en el historial exclusivo del panel.
5. Una vez dentro del panel se puede:
   - Actualizar el stock disponible de cada tipo de cajón.
   - Definir o modificar los precios mayoristas.
   - Revisar el historial completo de pedidos y marcar las entregas, dejando constancia de fecha, cantidad entregada y responsable.
   - Consultar el historial de accesos de administradores.

Los datos se almacenan en el navegador mediante `localStorage`, por lo que se conservan mientras no se borre el almacenamiento local del navegador.
