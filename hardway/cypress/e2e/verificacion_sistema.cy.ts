// cypress/e2e/verificacion_sistema.cy.ts
// Script para verificar el funcionamiento del frontend usando Cypress

describe('Verificación completa del sistema frontend', () => {
  // Variables para almacenar datos entre tests
  let adminToken: string;
  let pickerToken: string;

  before(() => {
    // Visitar la página principal
    cy.visit('/');
    cy.wait(1000);
  });

  it('Debería mostrar la página de login', () => {
    // Verificar que estamos en la página de login
    cy.get('ion-title').contains('Login', { matchCase: false });
    cy.get('form').should('exist');
    cy.get('ion-input[name="nombreUsuario"]').should('exist');
    cy.get('ion-input[name="password"]').should('exist');
  });

  it('Debería permitir login como admin', () => {
    // Login como admin
    cy.get('ion-input[name="nombreUsuario"]').type('admin');
    cy.get('ion-input[name="password"]').type('admin123');
    cy.get('ion-button[type="submit"]').click();

    // Verificar que llegamos al dashboard
    cy.url().should('include', '/dashboard');
    cy.get('ion-title').contains('Dashboard', { matchCase: false });

    // Guardar token para uso posterior
    cy.window().then((win) => {
      adminToken = win.localStorage.getItem('token');
      expect(adminToken).to.not.be.null;
    });
  });

  it('Debería mostrar el menú con todas las opciones', () => {
    // Verificar opciones del menú principal
    cy.get('ion-menu').should('exist');
    cy.get('ion-menu').click();
    
    // Verificar opciones importantes
    const menuItems = [
      'Dashboard', 
      'Clientes', 
      'Pedidos', 
      'Indumentaria', 
      'Picking', 
      'Envíos', 
      'Reportes', 
      'Usuarios'
    ];
    
    menuItems.forEach(item => {
      cy.get('ion-menu').contains(item).should('exist');
    });
  });

  it('Debería navegar a la página de clientes', () => {
    // Navegar a clientes
    cy.get('ion-menu').contains('Clientes').click();
    cy.url().should('include', '/clientes');
    cy.get('ion-title').contains('Clientes', { matchCase: false });
    
    // Verificar que hay una lista de clientes
    cy.get('ion-list').should('exist');
    cy.get('ion-item').should('have.length.greaterThan', 0);
  });

  it('Debería mostrar el detalle de un cliente', () => {
    // Click en el primer cliente
    cy.get('ion-item').first().click();
    
    // Verificar que se muestra el detalle
    cy.get('ion-card').should('exist');
    cy.get('ion-card-title').should('exist');
    
    // Verificar campos importantes
    const campos = ['Nombre', 'CUIT', 'Email', 'Teléfono', 'Domicilio', 'Localidad'];
    campos.forEach(campo => {
      cy.contains(campo).should('exist');
    });
  });

  it('Debería permitir registrar un nuevo cliente', () => {
    // Regresar a la lista de clientes
    cy.get('ion-back-button').click();
    
    // Hacer clic en el botón de añadir cliente
    cy.contains('Agregar Cliente').click();
    
    // Verificar que estamos en la página de registro
    cy.url().should('include', '/altacliente');
    
    // Completar formulario con datos de prueba
    const randomNum = Math.floor(Math.random() * 10000);
    cy.get('ion-input[name="nombre"]').type(`Test Client ${randomNum}`);
    cy.get('ion-input[name="apellido"]').type('Cypress');
    cy.get('ion-input[name="tipoDocumento"]').type('DNI');
    cy.get('ion-input[name="documento"]').type(`${randomNum}123456`);
    cy.get('ion-input[name="cuil"]').type(`20${randomNum}1234561`);
    cy.get('ion-input[name="email"]').type(`test.client${randomNum}@example.com`);
    cy.get('ion-input[name="telefono"]').type(`11${randomNum}1234`);
    cy.get('ion-input[name="domicilio"]').type('Calle Test 123');
    cy.get('ion-input[name="localidad"]').type('Ciudad Test');
    cy.get('ion-input[name="cp"]').type('3340');
    
    // Enviar formulario
    cy.get('ion-button[type="submit"]').click();
    
    // Verificar que regresamos a la lista con mensaje de éxito
    cy.url().should('include', '/clientes');
    cy.contains('Cliente agregado').should('exist');
  });

  it('Debería permitir editar un cliente existente', () => {
    // Buscar el cliente recién creado (podría estar en cualquier parte de la lista)
    cy.contains('Test Client').click();
    
    // Verificar que estamos en la vista detalle
    cy.get('ion-card').should('exist');
    
    // Hacer clic en editar
    cy.contains('Editar').click();
    
    // Modificar algunos datos
    cy.get('ion-input[name="telefono"]').clear().type('11999988877');
    cy.get('ion-input[name="domicilio"]').clear().type('Calle Actualizada 456');
    
    // Guardar cambios
    cy.get('ion-button[type="submit"]').click();
    
    // Verificar que regresamos a la lista con mensaje de éxito
    cy.url().should('include', '/clientes');
    cy.contains('Cliente actualizado').should('exist');
    
    // Verificar que los cambios se aplicaron
    cy.contains('Test Client').click();
    cy.contains('11999988877').should('exist');
    cy.contains('Calle Actualizada 456').should('exist');
  });

  it('Debería navegar a la página de pedidos', () => {
    // Navegar a pedidos
    cy.get('ion-menu').click();
    cy.get('ion-menu').contains('Pedidos').click();
    cy.url().should('include', '/pedidos');
    
    // Verificar que hay una lista de pedidos
    cy.get('ion-list').should('exist');
  });

  it('Debería mostrar detalles de un pedido', () => {
    // Verificar que hay pedidos y hacer click en el primero
    cy.get('ion-item').should('have.length.greaterThan', 0);
    cy.get('ion-item').first().click();
    
    // Verificar que se muestra el detalle del pedido
    cy.get('ion-card').should('exist');
    cy.get('ion-card-title').should('exist');
    
    // Verificar campos importantes
    const camposPedido = ['Número de Pedido', 'Cliente', 'Fecha'];
    camposPedido.forEach(campo => {
      cy.contains(campo).should('exist');
    });
  });
  
  it('Debería permitir registrar un nuevo pedido', () => {
    // Volver a la lista de pedidos
    cy.get('ion-back-button').click();
    
    // Hacer clic en el botón de nuevo pedido
    cy.contains('Nuevo Pedido').click();
    
    // Verificar que estamos en la página de alta de pedido
    cy.url().should('include', '/altapedido');
    
    // Seleccionar un cliente (primer cliente de la lista)
    cy.get('ion-select[name="cliente"]').click();
    cy.get('ion-alert').should('exist');
    // Seleccionar la primera opción
    cy.get('ion-alert button.alert-button').eq(1).click();
    
    // Agregar productos al pedido
    cy.get('ion-button').contains('Agregar Producto').click();
    
    // Seleccionar indumentaria
    cy.get('ion-select[name="indumentaria"]').click();
    cy.get('ion-alert').should('exist');
    cy.get('ion-alert button.alert-button').eq(1).click();
    
    // Ingresar cantidad
    cy.get('ion-input[name="cantidad"]').type('2');
    
    // Añadir el producto
    cy.get('ion-button').contains('Añadir').click();
    
    // Verificar que el producto fue agregado
    cy.contains('Productos en el pedido').should('exist');
    cy.get('ion-item').contains('Cantidad: 2').should('exist');
    
    // Finalizar pedido
    cy.get('ion-button[type="submit"]').contains('Registrar Pedido').click();
    
    // Verificar que regresamos a la lista con mensaje de éxito
    cy.url().should('include', '/pedidos');
    cy.contains('Pedido registrado').should('exist');
  });
  
  it('Debería permitir editar un pedido existente', () => {
    // Buscar el pedido recién creado (podría ser el más reciente en la lista)
    cy.get('ion-item').first().click();
    
    // Verificar que estamos en la vista detalle
    cy.get('ion-card').should('exist');
    
    // Hacer clic en editar
    cy.contains('Editar').click();
    
    // Modificar alguna información (por ejemplo, agregar otro producto)
    cy.get('ion-button').contains('Agregar Producto').click();
    
    // Seleccionar otra indumentaria
    cy.get('ion-select[name="indumentaria"]').click();
    cy.get('ion-alert').should('exist');
    cy.get('ion-alert button.alert-button').eq(2).click();
    
    // Ingresar cantidad
    cy.get('ion-input[name="cantidad"]').type('1');
    
    // Añadir el producto
    cy.get('ion-button').contains('Añadir').click();
    
    // Guardar cambios
    cy.get('ion-button[type="submit"]').contains('Actualizar Pedido').click();
    
    // Verificar que regresamos a la lista con mensaje de éxito
    cy.url().should('include', '/pedidos');
    cy.contains('Pedido actualizado').should('exist');
  });

  it('Debería navegar a la página de picking', () => {
    // Navegar a picking
    cy.get('ion-menu').click();
    cy.get('ion-menu').contains('Picking').click();
    cy.url().should('include', '/picking');
    
    // Verificar que estamos en la página de picking
    cy.get('ion-title').contains('Picking', { matchCase: false });
  });

  it('Debería navegar a la página de envíos', () => {
    // Navegar a envíos
    cy.get('ion-menu').click();
    cy.get('ion-menu').contains('Envíos').click();
    cy.url().should('include', '/envios');
    
    // Verificar que estamos en la página de envíos
    cy.get('ion-title').contains('Envíos', { matchCase: false });
  });

  it('Debería navegar a la página de reportes', () => {
    // Navegar a reportes
    cy.get('ion-menu').click();
    cy.get('ion-menu').contains('Reportes').click();
    cy.url().should('include', '/reportes');
    
    // Verificar que estamos en la página de reportes
    cy.get('ion-title').contains('Reportes', { matchCase: false });
    
    // Verificar pestañas de reportes importantes
    const pestañasReportes = [
      'Stock Actual', 
      'Clientes con más pedidos', 
      'Productos más pedidos'
    ];
    
    pestañasReportes.forEach(pestaña => {
      cy.contains(pestaña).should('exist');
    });
  });

  it('Debería cerrar sesión correctamente', () => {
    // Cerrar sesión
    cy.get('ion-menu').click();
    cy.contains('Cerrar sesión').click();
    
    // Verificar que volvimos al login
    cy.url().should('include', '/login');
    
    // Verificar que el token fue eliminado
    cy.window().then((win) => {
      const token = win.localStorage.getItem('token');
      expect(token).to.be.null;
    });
  });

  it('Debería permitir login como picker', () => {
    // Login como picker
    cy.get('ion-input[name="nombreUsuario"]').type('luisrd');
    cy.get('ion-input[name="password"]').type('123');
    cy.get('ion-button[type="submit"]').click();
    
    // Verificar que llegamos al dashboard
    cy.url().should('include', '/dashboard');
    
    // Guardar token para uso posterior
    cy.window().then((win) => {
      pickerToken = win.localStorage.getItem('token');
      expect(pickerToken).to.not.be.null;
    });
    
    // Verificar que el menú tiene opciones limitadas para el picker
    cy.get('ion-menu').click();
    cy.get('ion-menu').contains('Picking').should('exist');
    cy.get('ion-menu').contains('Usuarios').should('not.exist');
  });

  it('Debería mostrar las tareas de picking asignadas al picker', () => {
    // Navegar a picking como picker
    cy.get('ion-menu').contains('Picking').click();
    cy.url().should('include', '/picking');
    
    // Verificar que la vista es diferente a la de admin
    cy.get('ion-title').contains('Mis tareas', { matchCase: false });
  });
});
