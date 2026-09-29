Analicé ambos controladores, el DTO y las entidades de dominio que devuelven. Encontré y corregí un bug real que habría afectado el contrato: `Product` y `Transaction` no tenían `toJSON()`, así que `JSON.stringify` serializaba el campo privado `props` en lugar de los campos planos (habría devuelto `{"props": {...}}` en vez de los campos directos). Ya agregué `toJSON()` en [product.entity.ts](src/domain/product/product.entity.ts) y [transaction.entity.ts](src/domain/transaction/transaction.entity.ts) para que la respuesta real coincida con lo documentado abajo.

---

# Contrato de API — Bookstore Payment API

Prefijo global: **`/api/v1`** (configurado en [main.ts](src/main.ts) vía `app.setGlobalPrefix('api/v1')`).

> Nota: `ValidationPipe` global tiene `whitelist: true` y `forbidNonWhitelisted: true` — cualquier campo no listado en el body será rechazado con `400 Bad Request`.

## 1. `GET /api/v1/products`

Lista todos los productos disponibles.

- **Parámetros de ruta / query**: ninguno.
- **Body**: ninguno.
- **Respuesta exitosa `200 OK`** — `Product[]`:

```json
[
  {
    "id": "b3f1c9d2-4e3a-4c8b-9a1a-2f6d8e5c7a10",
    "title": "Clean Code",
    "description": "A Handbook of Agile Software Craftsmanship",
    "priceCents": 10000,
    "currency": "COP",
    "stock": 5,
    "imageUrl": "https://example.com/images/clean-code.jpg",
    "isActive": true,
    "version": 1,
    "createdAt": "2026-09-28T10:00:00.000Z",
    "updatedAt": "2026-09-28T10:00:00.000Z"
  }
]
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `string` (UUID) | |
| `title` | `string` | |
| `description` | `string \| null` | |
| `priceCents` | `number` | Entero, en centavos |
| `currency` | `string` | Por defecto `"COP"` |
| `stock` | `number` | Entero ≥ 0 |
| `imageUrl` | `string \| null` | |
| `isActive` | `boolean` | |
| `version` | `number` | Control de concurrencia |
| `createdAt` / `updatedAt` | `string` (ISO 8601) | |

- **Errores**: `500 Internal Server Error` si falla el repositorio.

---

## 2. `POST /api/v1/transactions`

Procesa una transacción de compra (crea/reutiliza cliente, valida stock, cobra en Wompi).

- **Parámetros de ruta / query**: ninguno.
- **Body** (`CreateTransactionDto`, JSON, máx. 10 KB):

```json
{
  "productId": "b3f1c9d2-4e3a-4c8b-9a1a-2f6d8e5c7a10",
  "customer": {
    "email": "jane.doe@example.com",
    "fullName": "Jane Doe",
    "phoneNumber": "+573001234567",
    "documentType": "CC",
    "documentNumber": "1020304050"
  },
  "delivery": {
    "addressLine": "cr 77 #2a-4",
    "city": "Bogota d.c",
    "region": "Antioquia"
  }
  "paymentToken": "tok_stagtest_dummy_1234567890abcdef",
  "deliveryFeeCents": 5000
}
```

| Campo | Tipo | Validación |
|---|---|---|
| `productId` | `string` | UUID v4 |
| `customer.email` | `string` | Email válido |
| `customer.fullName` | `string` | 3–120 caracteres |
| `customer.phoneNumber` | `string` | Regex `^\+?[0-9]{7,15}$` |
| `customer.documentType` | `"CC" \| "CE" \| "NIT" \| "PASSPORT"` | Enum |
| `customer.documentNumber` | `string` | Alfanumérico, 5–20 caracteres |
| `customer.email` | `string` | caracter alfanumerico |
| `customer.email` | `string` | caracter alfanumerico |
| `customer.email` | `string` | caracter alfanumerico |
| `paymentToken` | `string` | No vacío (token de tarjeta de Wompi) |
| `deliveryFeeCents` | `number` | Entero ≥ 0 |

> `baseFeeCents` y `paymentMethodType` **no** van en el body: el backend fija `paymentMethodType = "CARD"` y toma `baseFeeCents` de la variable de entorno `BASE_FEE_CENTS`.

- **Respuesta exitosa `201 Created`** — `Transaction`:

```json
{
  "id": "c1a2b3c4-5678-4abc-9def-0123456789ab",
  "reference": "ORD-c1a2b3c4-5678-4abc-9def-0123456789ab",
  "wompiTransactionId": null,
  "productId": "b3f1c9d2-4e3a-4c8b-9a1a-2f6d8e5c7a10",
  "customerId": "d4e5f6a7-89ab-4cde-8f01-23456789abcd",
  "status": "PENDING",
  "productPriceCents": 10000,
  "baseFeeCents": 500,
  "deliveryFeeCents": 5000,
  "totalAmountCents": 15500,
  "paymentMethodType": "CARD",
  "createdAt": "2026-09-28T10:00:00.000Z",
  "updatedAt": "2026-09-28T10:00:05.000Z"
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `string` (UUID) | |
| `reference` | `string` | Referencia única enviada a Wompi |
| `wompiTransactionId` | `string \| null` | ID de Wompi una vez procesado el pago |
| `productId` / `customerId` | `string` (UUID) | |
| `status` | `"PENDING" \| "APPROVED" \| "DECLINED" \| "ERROR"` | Estado final tras el intento de cobro |
| `productPriceCents` / `baseFeeCents` / `deliveryFeeCents` / `totalAmountCents` | `number` | Enteros en centavos |
| `paymentMethodType` | `string` | Siempre `"CARD"` actualmente |
| `createdAt` / `updatedAt` | `string` (ISO 8601) | |

- **Errores** (body: `{ "statusCode": number, "message": string, ... }` vía el filtro global de excepciones):

| Código | Causa |
|---|---|
| `400 Bad Request` | Payload inválido (DTO) o error de negocio no mapeado |
| `404 Not Found` | El producto no existe |
| `409 Conflict` | El producto no tiene stock |
| `502 Bad Gateway` | Wompi rechazó o falló el cobro |
| `500 Internal Server Error` | Falla en un repositorio |
