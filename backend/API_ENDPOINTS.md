# API Endpoints Documentation

This document provides a comprehensive overview of all API endpoints available in the ZecretlyClient backend.

## Base URL
All endpoints are prefixed with `/api`

## Health Check
- `GET /api/health` - Check API health status

## Workspaces
- `GET /api/workspaces` - Get all workspaces
- `GET /api/workspaces/:workspaceId` - Get workspace by ID
- `POST /api/workspaces` - Create new workspace
- `PUT /api/workspaces/:workspaceId` - Update workspace
- `DELETE /api/workspaces/:workspaceId` - Delete workspace

## Collections
- `GET /api/collections` - Get all collections
- `GET /api/collections/:collectionId` - Get collection by ID
- `POST /api/collections` - Create new collection
- `PUT /api/collections/:collectionId` - Update collection
- `DELETE /api/collections/:collectionId` - Delete collection
- `GET /api/collections/workspace/:workspaceId` - Get collections by workspace

## Requests
- `GET /api/requests` - Get all requests
- `GET /api/requests/search` - Find similar requests (query: method, url)
- `GET /api/requests/:requestId` - Get request by ID
- `POST /api/requests` - Create new request
- `PUT /api/requests/:requestId` - Update request
- `DELETE /api/requests/:requestId` - Delete request
- `PATCH /api/requests/:requestId/sort-order` - Update request sort order
- `POST /api/requests/:requestId/execute` - Execute request
- `GET /api/requests/collection/:collectionId` - Get requests by collection

## Environments
- `GET /api/environments` - Get all environments
- `GET /api/environments/:environmentId` - Get environment by ID
- `POST /api/environments` - Create new environment
- `PUT /api/environments/:environmentId` - Update environment
- `DELETE /api/environments/:environmentId` - Delete environment
- `POST /api/environments/:environmentId/activate` - Activate environment
- `POST /api/environments/:environmentId/deactivate` - Deactivate environment
- `PUT /api/environments/:environmentId/variables` - Update environment variable
- `DELETE /api/environments/:environmentId/variables` - Remove environment variable
- `POST /api/environments/:environmentId/resolve` - Resolve variables in text
- `GET /api/environments/workspace/:workspaceId` - Get environments by workspace
- `GET /api/environments/workspace/:workspaceId/active` - Get active environment by workspace

## Request Histories
- `GET /api/request-histories` - Get all request histories
- `GET /api/request-histories/:historyId` - Get request history by ID
- `POST /api/request-histories` - Create new request history
- `PUT /api/request-histories/:historyId` - Update request history
- `DELETE /api/request-histories/:historyId` - Delete request history
- `GET /api/request-histories/request/:requestId` - Get histories by request ID
- `GET /api/request-histories/collection/:collectionId` - Get histories by collection ID
- `GET /api/request-histories/workspace/:workspaceId` - Get histories by workspace ID

## Data Models

### Workspace
```typescript
{
  id: string (UUID)
  name: string
  description?: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Collection
```typescript
{
  id: string (UUID)
  workspaceId?: string (UUID)
  name: string
  description?: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Request
```typescript
{
  id: string (UUID)
  collectionId?: string (UUID)
  name: string
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS"
  url: string
  headers?: Record<string, string>
  bodyType?: "none" | "json" | "form-data" | "x-www-form-urlencoded" | "raw" | "binary"
  bodyContent?: string
  response?: string
  queryParams?: Record<string, string>
  authType?: "none" | "bearer" | "basic" | "api-key" | "oauth2"
  authDetails?: Record<string, any>
  preRequestScript?: string
  postRequestScript?: string
  sortOrder?: number
  status: number (HTTP status code)
  description?: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Environment
```typescript
{
  id: string (UUID)
  workspaceId?: string (UUID)
  name: string
  variables?: Record<string, string>
  isActive?: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Request History
```typescript
{
  id: string (UUID)
  sourceRequestId?: string (UUID)
  method: string
  url: string
  requestHeaders?: Record<string, string>
  requestBodyType?: string
  requestBodyContent?: string
  responseStatusCode?: number
  responseHeaders?: Record<string, string>
  responseBody?: string
  durationMs?: number
  executedAt: timestamp
  collectionId?: string (UUID)
  workspaceId?: string (UUID)
}
```

## Response Format

All API responses follow this standard format:

### Success Response
```typescript
{
  success: true,
  data: any, // The actual response data
  message: string // Success message
}
```

### Error Response
```typescript
{
  success: false,
  message: string // Error message
}
```

## Features Implemented

### Database Schema
- ✅ Consistent UUID primary keys across all tables
- ✅ Proper foreign key relationships
- ✅ Automatic timestamps (createdAt, updatedAt)
- ✅ JSONB fields for flexible data storage

### Repository Layer
- ✅ Optimized database queries with proper joins
- ✅ Consistent error handling
- ✅ Transaction support for complex operations
- ✅ Proper indexing considerations

### Service Layer
- ✅ Business logic separation
- ✅ Comprehensive error handling
- ✅ Data validation
- ✅ Cross-module dependencies handled

### Controller Layer
- ✅ Request/response handling
- ✅ Zod schema validation
- ✅ Proper HTTP status codes
- ✅ Consistent API response format

### Route Layer
- ✅ RESTful endpoint design
- ✅ Proper HTTP methods
- ✅ Logical route organization
- ✅ Parameter validation

### Advanced Features
- ✅ Environment variable resolution with {{variable}} syntax
- ✅ Request execution with override capabilities
- ✅ Request history tracking
- ✅ Environment activation/deactivation logic
- ✅ Request similarity search
- ✅ Sort order management for requests

## Best Practices Implemented

1. **Clean Architecture**: Separation of concerns with distinct layers
2. **Type Safety**: Full TypeScript implementation with Zod validation
3. **Error Handling**: Comprehensive error handling at all layers
4. **Database Optimization**: Efficient queries with proper joins and indexing
5. **API Design**: RESTful endpoints with consistent response format
6. **Code Quality**: Clean, readable, and maintainable code structure
7. **Validation**: Input validation using Zod schemas
8. **Security**: UUID-based IDs and proper data sanitization
