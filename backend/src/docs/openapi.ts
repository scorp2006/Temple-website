// OpenAPI 3.0 spec for the Sri Jagajjanani Temple API.
// Served as interactive Swagger UI at /api/docs and raw JSON at /api/docs.json.

export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Sri Jagajjanani Temple API',
    version: '1.0.0',
    description:
      'REST API for the Sri Jagajjanani Temple platform — poojas, bookings, ' +
      'accommodation, donations, news, events, live stream, and admin dashboard. ' +
      'Auth is JWT-based with roles: VISITOR, STAFF, ADMIN. Prices are in paise ' +
      '(₹1 = 100 paise). Payments run in mock mode by default.',
  },
  servers: [
    { url: 'http://localhost:4000/api', description: 'Local dev' },
    { url: '/api', description: 'Current host' },
  ],
  tags: [
    { name: 'Auth', description: 'Register, login, staff management' },
    { name: 'Poojas', description: 'Poojas & time slots (admin-managed)' },
    { name: 'Bookings', description: 'Pooja booking flow + venue operations' },
    { name: 'Accommodation', description: 'Room types, availability, room booking' },
    { name: 'Donations', description: 'Donations + donor cards' },
    { name: 'News', description: 'Announcements' },
    { name: 'Events', description: 'Events + staff assignment' },
    { name: 'LiveStream', description: 'Live darshan embed config' },
    { name: 'Dashboard', description: 'Admin summary stats' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: { error: { type: 'string' }, details: { type: 'object' } },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', nullable: true },
          phone: { type: 'string', nullable: true },
          role: { type: 'string', enum: ['VISITOR', 'STAFF', 'ADMIN'] },
        },
      },
      Pooja: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          basePrice: { type: 'integer', description: 'paise' },
          isSpecial: { type: 'boolean' },
          isActive: { type: 'boolean' },
        },
      },
      Slot: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          poojaId: { type: 'string', format: 'uuid' },
          startTime: { type: 'string', format: 'date-time' },
          endTime: { type: 'string', format: 'date-time' },
          capacity: { type: 'integer' },
          booked: { type: 'integer' },
          price: { type: 'integer', description: 'paise' },
          isOpen: { type: 'boolean' },
        },
      },
      Booking: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          slotId: { type: 'string', format: 'uuid' },
          devoteeName: { type: 'string' },
          seats: { type: 'integer' },
          status: {
            type: 'string',
            enum: ['PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'EXPIRED', 'CHECKED_IN'],
          },
          channel: { type: 'string', enum: ['ONLINE', 'SPOT'] },
          qrToken: { type: 'string', nullable: true },
        },
      },
      PaymentOrder: {
        type: 'object',
        properties: {
          paymentId: { type: 'string', format: 'uuid' },
          gatewayOrderId: { type: 'string' },
          amount: { type: 'integer', description: 'paise' },
          currency: { type: 'string' },
          mock: { type: 'boolean' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: { tags: ['Dashboard'], summary: 'Health check', responses: { 200: { description: 'OK' } } },
    },

    // ---- Auth ----
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a visitor account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' },
                  password: { type: 'string', minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          409: { description: 'Already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login (email or phone + password)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['password'],
                properties: {
                  email: { type: 'string' },
                  phone: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/me': {
      get: { tags: ['Auth'], summary: 'Current user', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } } } },
    },
    '/auth/staff': {
      get: { tags: ['Auth'], summary: 'List staff (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
      post: { tags: ['Auth'], summary: 'Create staff (admin)', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created' } } },
    },
    '/auth/users/{id}/role': {
      patch: {
        tags: ['Auth'],
        summary: 'Set a user role (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' } },
      },
    },

    // ---- Poojas ----
    '/poojas': {
      get: { tags: ['Poojas'], summary: 'List poojas', responses: { 200: { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Pooja' } } } } } } },
      post: { tags: ['Poojas'], summary: 'Create pooja (admin)', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created' } } },
    },
    '/poojas/{id}': {
      get: { tags: ['Poojas'], summary: 'Get a pooja', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } } },
      patch: { tags: ['Poojas'], summary: 'Update pooja (admin)', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
    },
    '/poojas/{id}/slots': {
      get: { tags: ['Poojas'], summary: 'List a pooja’s upcoming slots', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Slot' } } } } } } },
    },
    '/poojas/slots': {
      post: { tags: ['Poojas'], summary: 'Create a single slot (admin)', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created' } } },
    },
    '/poojas/slots/bulk': {
      post: {
        tags: ['Poojas'],
        summary: 'Bulk-generate slots for a date range (admin)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  poojaId: { type: 'string' },
                  startDate: { type: 'string', example: '2026-07-01' },
                  endDate: { type: 'string', example: '2026-07-31' },
                  dailyStartTime: { type: 'string', example: '06:00' },
                  dailyEndTime: { type: 'string', example: '18:00' },
                  slotDurationMinutes: { type: 'integer', example: 30 },
                  capacity: { type: 'integer', example: 50 },
                  price: { type: 'integer', description: 'paise (optional)' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Generated' } },
      },
    },
    '/poojas/slots/{id}': {
      patch: { tags: ['Poojas'], summary: 'Update a slot (admin)', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
    },

    // ---- Bookings ----
    '/bookings/reserve': {
      post: {
        tags: ['Bookings'],
        summary: 'Reserve seats (creates a hold + payment order)',
        description: 'Concurrency-safe. Holds seats for RESERVATION_HOLD_MINUTES. Pass an idempotencyKey to make retries safe.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['slotId', 'devoteeName'],
                properties: {
                  slotId: { type: 'string' },
                  devoteeName: { type: 'string' },
                  devoteePhone: { type: 'string' },
                  devoteeEmail: { type: 'string' },
                  seats: { type: 'integer', default: 1 },
                  idempotencyKey: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Reserved', content: { 'application/json': { schema: { type: 'object', properties: { booking: { $ref: '#/components/schemas/Booking' }, payment: { $ref: '#/components/schemas/PaymentOrder' } } } } } },
          409: { description: 'Slot full / closed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/bookings/{id}/confirm': {
      post: {
        tags: ['Bookings'],
        summary: 'Confirm a booking after payment (issues QR e-ticket)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { gatewayPaymentId: { type: 'string' }, gatewaySignature: { type: 'string' } } } } } },
        responses: { 200: { description: 'Confirmed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Booking' } } } } },
      },
    },
    '/bookings/{id}': {
      get: { tags: ['Bookings'], summary: 'Get a booking', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
    },
    '/bookings/{id}/cancel': {
      post: { tags: ['Bookings'], summary: 'Cancel a booking (releases seats)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Cancelled' } } },
    },
    '/bookings/spot': {
      post: { tags: ['Bookings'], summary: 'Walk-in spot booking (staff/admin)', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created & confirmed' } } },
    },
    '/bookings/scan': {
      post: {
        tags: ['Bookings'],
        summary: 'Scan/verify a ticket QR at the venue (staff/admin)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['qrToken'], properties: { qrToken: { type: 'string' } } } } } },
        responses: { 200: { description: 'Valid — checked in' }, 409: { description: 'Already used / invalid' } },
      },
    },
    '/bookings': {
      get: { tags: ['Bookings'], summary: 'List all bookings (admin)', security: [{ bearerAuth: [] }], parameters: [{ name: 'status', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
    },

    // ---- Accommodation ----
    '/accommodation/room-types': {
      get: { tags: ['Accommodation'], summary: 'List room types', responses: { 200: { description: 'OK' } } },
      post: { tags: ['Accommodation'], summary: 'Create room type (admin)', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created' } } },
    },
    '/accommodation/room-types/{id}/availability': {
      get: { tags: ['Accommodation'], summary: 'Available rooms for a date range', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }, { name: 'from', in: 'query', schema: { type: 'string' } }, { name: 'to', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
    },
    '/accommodation/room-types/{id}/rooms': {
      post: { tags: ['Accommodation'], summary: 'Add a room to a type (admin)', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 201: { description: 'Created' } } },
    },
    '/accommodation/reserve': {
      post: { tags: ['Accommodation'], summary: 'Reserve a room (creates hold + payment)', responses: { 201: { description: 'Reserved' }, 409: { description: 'No rooms available' } } },
    },
    '/accommodation/{id}/confirm': {
      post: { tags: ['Accommodation'], summary: 'Confirm a room booking after payment', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Confirmed' } } },
    },
    '/accommodation/bookings': {
      get: { tags: ['Accommodation'], summary: 'List room bookings (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    },

    // ---- Donations ----
    '/donations': {
      post: { tags: ['Donations'], summary: 'Create a donation (creates payment order)', responses: { 201: { description: 'Created' } } },
      get: { tags: ['Donations'], summary: 'List donations (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    },
    '/donations/{id}/confirm': {
      post: { tags: ['Donations'], summary: 'Confirm a donation (issues donor card)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Confirmed' } } },
    },
    '/donations/{id}': {
      get: { tags: ['Donations'], summary: 'Get a donation', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
    },

    // ---- News ----
    '/news': {
      get: { tags: ['News'], summary: 'List published news', responses: { 200: { description: 'OK' } } },
      post: { tags: ['News'], summary: 'Create news (admin)', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created' } } },
    },
    '/news/{id}': {
      get: { tags: ['News'], summary: 'Get a news item', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
      patch: { tags: ['News'], summary: 'Update news (admin)', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
      delete: { tags: ['News'], summary: 'Delete news (admin)', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Deleted' } } },
    },

    // ---- Events ----
    '/events': {
      get: { tags: ['Events'], summary: 'List events (admin: all, staff: assigned)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
      post: { tags: ['Events'], summary: 'Create event (admin)', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created' } } },
    },
    '/events/{id}/staff': {
      post: { tags: ['Events'], summary: 'Assign a staff member to an event (admin)', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 201: { description: 'Assigned' } } },
    },

    // ---- LiveStream ----
    '/livestream': {
      get: { tags: ['LiveStream'], summary: 'Get live stream config', responses: { 200: { description: 'OK' } } },
      put: { tags: ['LiveStream'], summary: 'Update live stream config (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    },

    // ---- Dashboard ----
    '/dashboard/summary': {
      get: { tags: ['Dashboard'], summary: 'Admin summary stats', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    },
  },
} as const;
