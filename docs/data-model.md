Modelo de Datos (Esquema Relacional)
## 1. Entidad: products (Libros)
Representa el catálogo. Es el origen de la verdad antes de la compra.

    id (UUID, Primary Key)

    title (String, Not Null)

    description (Text)

    price_cents (Integer, Not Null) -> Ej: 5000000 equivale a $50,000.00 COP

    currency (String, Default 'COP')

    stock (Integer, Not Null, Check >= 0)

    image_url (String)

    is_active (Boolean, Default True)

    version (Integer, Default 1) -> Control de concurrencia para la actualización del stock.

    created_at, updated_at (Timestamps)

## 2. Entidad: customers (Clientes)
Datos del comprador. Se separa de la transacción para mantener el historial si el mismo cliente compra otro libro en el futuro.

    id (UUID, Primary Key)

    email (String, Unique, Index) -> Fundamental para notificaciones y trazabilidad.

    full_name (String, Not Null)

    phone_number (String, Not Null)

    document_type (String, Enum: CC, CE, NIT, PASSPORT)

    document_number (String, Not Null)

    created_at, updated_at (Timestamps)

## 3. Entidad: transactions (Transacciones)
Esta es la tabla núcleo de tu prueba técnica. Vincula qué compró, quién lo compró y el estado del pago. Es inmutable; los precios se copian aquí para que si el libro cambia de precio mañana, el historial de esta venta no se altere.

    id (UUID, Primary Key)

    reference (String, Unique, Index) -> Referencia alfanumérica única generada por TU backend (ej: ORD-17094002-XYZ) que le enviarás a Wompi.

    wompi_transaction_id (String, Nullable, Unique) -> El ID que Wompi te devuelve cuando se procesa el pago. Nulo al inicio.

    product_id (UUID, Foreign Key a products)

    customer_id (UUID, Foreign Key a customers)

    status (String, Enum: PENDING, APPROVED, DECLINED, ERROR) -> Inicia siempre en PENDING.

    product_price_cents (Integer) -> Snapshot del valor del libro.

    base_fee_cents (Integer) -> Tarifa base exigida en la prueba.

    delivery_fee_cents (Integer) -> Tarifa de entrega.

    total_amount_cents (Integer) -> La suma exacta de los 3 anteriores. Este es el valor que se cobra en Wompi.

    payment_method_type (String) -> Ej: 'CARD'.

    created_at, updated_at (Timestamps)

## 4. Entidad: deliveries (Entregas)
Depende estrictamente de que exista una transacción.

    id (UUID, Primary Key)

    transaction_id (UUID, Foreign Key a transactions, Unique)

    address_line (String, Not Null)

    city (String, Not Null)

    region (String, Not Null)

    status (String, Enum: PENDING, DISPATCHED, DELIVERED) -> Inicia en PENDING.

    created_at, updated_at (Timestamps)




