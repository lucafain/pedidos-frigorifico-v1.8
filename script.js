const CAJONES = [
    { id: 'cajon-x', nombre: 'Cajón X' },
    { id: '6-cabezas', nombre: 'Cajón de 6 cabezas' },
    { id: '7-cabezas', nombre: 'Cajón de 7 cabezas' },
    { id: '8-cabezas', nombre: 'Cajón de 8 cabezas' },
    { id: '9-cabezas', nombre: 'Cajón de 9 cabezas' },
    { id: '10-cabezas', nombre: 'Cajón de 10 cabezas' }
];

const ADMINISTRADORES = [
    { usuario: 'central', password: 'kosher2024' },
    { usuario: 'logistica', password: 'frigo2024' }
];

let adminActivo = null;

const elementos = {
    anioActual: document.getElementById('anio-actual'),
    selectCajones: document.getElementById('cliente-cajon'),
    formCliente: document.getElementById('cliente-form'),
    mensajeCliente: document.getElementById('cliente-mensaje'),
    formAdmin: document.getElementById('admin-login-form'),
    errorAdmin: document.getElementById('admin-login-error'),
    panelAdmin: document.getElementById('admin-panel'),
    bienvenida: document.querySelector('#admin-panel .bienvenida'),
    tablaStock: document.querySelector('#tabla-stock tbody'),
    tablaPrecios: document.querySelector('#tabla-precios tbody'),
    tablaPedidos: document.querySelector('#tabla-pedidos tbody'),
    listaEntregas: document.getElementById('lista-entregas'),
    listaLogins: document.getElementById('lista-logins'),
    botonSalir: document.getElementById('admin-logout')
};

document.addEventListener('DOMContentLoaded', () => {
    inicializarDatos();
    elementos.anioActual.textContent = new Date().getFullYear();
    poblarSelectCajones();
    vincularEventos();
});

function inicializarDatos() {
    if (!localStorage.getItem('pedidos')) {
        localStorage.setItem('pedidos', JSON.stringify([]));
    }
    if (!localStorage.getItem('stock')) {
        const stockInicial = CAJONES.reduce((acc, cajon) => {
            acc[cajon.id] = 0;
            return acc;
        }, {});
        localStorage.setItem('stock', JSON.stringify(stockInicial));
    }
    if (!localStorage.getItem('precios')) {
        const preciosIniciales = CAJONES.reduce((acc, cajon) => {
            acc[cajon.id] = 0;
            return acc;
        }, {});
        localStorage.setItem('precios', JSON.stringify(preciosIniciales));
    }
    if (!localStorage.getItem('loginsAdmin')) {
        localStorage.setItem('loginsAdmin', JSON.stringify([]));
    }
    if (!localStorage.getItem('entregas')) {
        localStorage.setItem('entregas', JSON.stringify([]));
    }
}

function poblarSelectCajones() {
    elementos.selectCajones.innerHTML = '';
    CAJONES.forEach(cajon => {
        const option = document.createElement('option');
        option.value = cajon.id;
        option.textContent = cajon.nombre;
        elementos.selectCajones.append(option);
    });
}

function vincularEventos() {
    elementos.formCliente.addEventListener('submit', manejarPedidoCliente);
    elementos.formAdmin.addEventListener('submit', manejarLoginAdmin);
    elementos.botonSalir.addEventListener('click', cerrarSesionAdmin);
}

function manejarPedidoCliente(evento) {
    evento.preventDefault();
    const cliente = document.getElementById('cliente-nombre').value.trim();
    const direccion = document.getElementById('cliente-direccion').value.trim();
    const cajonId = elementos.selectCajones.value;
    const cantidad = parseInt(document.getElementById('cliente-cantidad').value, 10);

    if (!cliente || !direccion || !cajonId || Number.isNaN(cantidad) || cantidad <= 0) {
        mostrarMensajeCliente('Por favor complete todos los campos correctamente.', 'error');
        return;
    }

    const nuevoPedido = {
        id: crypto.randomUUID ? crypto.randomUUID() : `pedido-${Date.now()}`,
        fecha: new Date().toISOString(),
        cliente,
        direccion,
        cajonId,
        cantidad,
        estado: 'Pendiente'
    };

    const pedidos = obtenerPedidos();
    pedidos.push(nuevoPedido);
    guardarPedidos(pedidos);

    elementos.formCliente.reset();
    mostrarMensajeCliente('¡Pedido enviado correctamente! Nuestro equipo se comunicará para coordinar la entrega.', 'success');

    if (adminActivo) {
        renderizarPedidos();
    }
}

function mostrarMensajeCliente(mensaje, tipo) {
    elementos.mensajeCliente.textContent = mensaje;
    elementos.mensajeCliente.className = tipo;
}

function manejarLoginAdmin(evento) {
    evento.preventDefault();
    const alias = document.getElementById('admin-alias').value.trim();
    const usuario = document.getElementById('admin-usuario').value.trim();
    const password = document.getElementById('admin-password').value;

    const credencialValida = ADMINISTRADORES.some(admin => admin.usuario === usuario && admin.password === password);

    if (!credencialValida) {
        elementos.errorAdmin.textContent = 'Usuario o contraseña incorrectos.';
        return;
    }

    adminActivo = { alias, usuario };
    elementos.errorAdmin.textContent = '';
    elementos.panelAdmin.hidden = false;
    elementos.bienvenida.textContent = `Bienvenido/a ${alias}. Desde aquí puede gestionar stock, precios y entregas.`;

    registrarLoginAdmin(alias, usuario);
    renderizarTodo();
    elementos.formAdmin.reset();
}

function cerrarSesionAdmin() {
    adminActivo = null;
    elementos.panelAdmin.hidden = true;
}

function renderizarTodo() {
    renderizarStock();
    renderizarPrecios();
    renderizarPedidos();
    renderizarEntregas();
    renderizarLogins();
}

function renderizarStock() {
    const stock = obtenerStock();
    elementos.tablaStock.innerHTML = '';
    CAJONES.forEach(cajon => {
        const fila = document.createElement('tr');
        const celdaNombre = document.createElement('td');
        celdaNombre.textContent = cajon.nombre;

        const celdaValor = document.createElement('td');
        celdaValor.textContent = stock[cajon.id] ?? 0;

        const celdaAccion = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.step = '1';
        input.value = stock[cajon.id] ?? 0;
        input.ariaLabel = `Actualizar stock de ${cajon.nombre}`;

        const boton = document.createElement('button');
        boton.textContent = 'Guardar';
        boton.addEventListener('click', () => {
            const nuevoValor = parseInt(input.value, 10);
            if (Number.isNaN(nuevoValor) || nuevoValor < 0) {
                alert('Ingrese un número válido para el stock.');
                return;
            }
            stock[cajon.id] = nuevoValor;
            guardarStock(stock);
            renderizarStock();
        });

        celdaAccion.append(input, boton);
        fila.append(celdaNombre, celdaValor, celdaAccion);
        elementos.tablaStock.append(fila);
    });
}

function renderizarPrecios() {
    const precios = obtenerPrecios();
    elementos.tablaPrecios.innerHTML = '';
    CAJONES.forEach(cajon => {
        const fila = document.createElement('tr');
        const celdaNombre = document.createElement('td');
        celdaNombre.textContent = cajon.nombre;

        const celdaValor = document.createElement('td');
        celdaValor.textContent = formatearMoneda(precios[cajon.id] ?? 0);

        const celdaAccion = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.step = '0.01';
        input.value = precios[cajon.id] ?? 0;
        input.ariaLabel = `Actualizar precio de ${cajon.nombre}`;

        const boton = document.createElement('button');
        boton.textContent = 'Guardar';
        boton.addEventListener('click', () => {
            const nuevoValor = Number(input.value);
            if (Number.isNaN(nuevoValor) || nuevoValor < 0) {
                alert('Ingrese un valor numérico válido.');
                return;
            }
            precios[cajon.id] = Number(nuevoValor.toFixed(2));
            guardarPrecios(precios);
            renderizarPrecios();
        });

        celdaAccion.append(input, boton);
        fila.append(celdaNombre, celdaValor, celdaAccion);
        elementos.tablaPrecios.append(fila);
    });
}

function renderizarPedidos() {
    const pedidos = obtenerPedidos();
    elementos.tablaPedidos.innerHTML = '';

    if (pedidos.length === 0) {
        const filaVacia = document.createElement('tr');
        const celda = document.createElement('td');
        celda.colSpan = 6;
        celda.textContent = 'Todavía no hay pedidos registrados.';
        filaVacia.append(celda);
        elementos.tablaPedidos.append(filaVacia);
        return;
    }

    pedidos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    pedidos.forEach(pedido => {
        const fila = document.createElement('tr');
        const celdaFecha = document.createElement('td');
        celdaFecha.textContent = formatearFechaHora(pedido.fecha);

        const celdaCliente = document.createElement('td');
        celdaCliente.innerHTML = `<strong>${pedido.cliente}</strong><br><small>${pedido.direccion}</small>`;

        const celdaCajon = document.createElement('td');
        celdaCajon.textContent = obtenerNombreCajon(pedido.cajonId);

        const celdaCantidad = document.createElement('td');
        celdaCantidad.textContent = pedido.cantidad;

        const celdaEstado = document.createElement('td');
        celdaEstado.textContent = pedido.estado === 'Entregado' && pedido.entrega
            ? `Entregado (${pedido.entrega.cantidad} cajones)`
            : pedido.estado;
        celdaEstado.className = pedido.estado === 'Entregado' ? 'estado-entregado' : 'estado-pendiente';

        const celdaAcciones = document.createElement('td');
        if (pedido.estado !== 'Entregado') {
            const botonEntregar = document.createElement('button');
            botonEntregar.textContent = 'Marcar como entregado';
            botonEntregar.addEventListener('click', () => marcarEntrega(pedido.id));
            celdaAcciones.append(botonEntregar);
        } else {
            celdaAcciones.innerHTML = `<small>Entregado por ${pedido.entrega.admin} el ${formatearFechaHora(pedido.entrega.fecha)}</small>`;
        }

        fila.append(celdaFecha, celdaCliente, celdaCajon, celdaCantidad, celdaEstado, celdaAcciones);
        elementos.tablaPedidos.append(fila);
    });
}

function marcarEntrega(idPedido) {
    if (!adminActivo) {
        alert('Debe iniciar sesión como administrador para realizar esta acción.');
        return;
    }

    const pedidos = obtenerPedidos();
    const pedido = pedidos.find(p => p.id === idPedido);
    if (!pedido) {
        alert('No se encontró el pedido seleccionado.');
        return;
    }

    const cantidadEntregada = prompt('¿Cuántos cajones se entregaron?', pedido.cantidad);
    const cantidad = parseInt(cantidadEntregada, 10);
    if (Number.isNaN(cantidad) || cantidad <= 0) {
        alert('Ingrese una cantidad válida de cajones entregados.');
        return;
    }

    const fechaEntrega = new Date().toISOString();
    pedido.estado = 'Entregado';
    pedido.entrega = {
        cantidad,
        fecha: fechaEntrega,
        admin: adminActivo.alias
    };

    guardarPedidos(pedidos);
    registrarEntrega({
        pedidoId: pedido.id,
        cliente: pedido.cliente,
        cajon: obtenerNombreCajon(pedido.cajonId),
        cantidadSolicitada: pedido.cantidad,
        cantidadEntregada: cantidad,
        fecha: fechaEntrega,
        admin: adminActivo.alias
    });

    renderizarPedidos();
    renderizarEntregas();
}

function registrarLoginAdmin(alias, usuario) {
    const logins = obtenerLoginsAdmin();
    logins.push({ alias, usuario, fecha: new Date().toISOString() });
    localStorage.setItem('loginsAdmin', JSON.stringify(logins));
}

function renderizarLogins() {
    const logins = obtenerLoginsAdmin().sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    elementos.listaLogins.innerHTML = '';
    if (logins.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Aún no hay ingresos registrados.';
        elementos.listaLogins.append(li);
        return;
    }

    logins.forEach(login => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${login.alias}</strong> (${login.usuario})<br><small>${formatearFechaHora(login.fecha)}</small>`;
        elementos.listaLogins.append(li);
    });
}

function registrarEntrega(entrega) {
    const entregas = obtenerEntregas();
    entregas.push(entrega);
    localStorage.setItem('entregas', JSON.stringify(entregas));
}

function renderizarEntregas() {
    const entregas = obtenerEntregas().sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    elementos.listaEntregas.innerHTML = '';

    if (entregas.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Aún no se registraron entregas.';
        elementos.listaEntregas.append(li);
        return;
    }

    entregas.forEach(entrega => {
        const li = document.createElement('li');
        li.innerHTML = `Entrega de <strong>${entrega.cantidadEntregada}</strong> cajones de ${entrega.cajon} para ${entrega.cliente}<br>` +
            `<small>Solicitado: ${entrega.cantidadSolicitada} cajones · Marcado por ${entrega.admin} el ${formatearFechaHora(entrega.fecha)}</small>`;
        elementos.listaEntregas.append(li);
    });
}

function obtenerPedidos() {
    return JSON.parse(localStorage.getItem('pedidos'));
}

function guardarPedidos(pedidos) {
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
}

function obtenerStock() {
    return JSON.parse(localStorage.getItem('stock'));
}

function guardarStock(stock) {
    localStorage.setItem('stock', JSON.stringify(stock));
}

function obtenerPrecios() {
    return JSON.parse(localStorage.getItem('precios'));
}

function guardarPrecios(precios) {
    localStorage.setItem('precios', JSON.stringify(precios));
}

function obtenerLoginsAdmin() {
    return JSON.parse(localStorage.getItem('loginsAdmin'));
}

function obtenerEntregas() {
    return JSON.parse(localStorage.getItem('entregas'));
}

function formatearFechaHora(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-AR', {
        dateStyle: 'short',
        timeStyle: 'short'
    });
}

function obtenerNombreCajon(id) {
    return CAJONES.find(cajon => cajon.id === id)?.nombre ?? 'Cajón desconocido';
}

function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
    }).format(valor);
}
