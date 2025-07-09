# Circle - Shared Resource Coordination App

## Project Overview
A simple app for coordinating shared resources (lawn mowers, tools, cars, etc.) within trusted groups like neighbors or friends. No user accounts - just join a circle via a shareable link and coordinate borrowing.

## Tech Stack
- **Backend**: Node.js + Express + TypeScript
- **Frontend**: Angular 18+ with Material Design
- **Storage**: In-memory first, then add database later
- **Learning Goal**: Author is React/Go developer learning Angular/Node

## Core Concept
1. Someone creates a "circle" → gets permanent shareable link
2. Share link with trusted friends/neighbors
3. When joining: pick existing user or create new one (stored in browser)
4. Members add their shareable items to the pool
5. Simple coordination for borrowing/returning

## Key Features

### Phase 1: Foundation
- [x] Project setup with modern 2025 stack
- [ ] Basic Express server with health endpoint
- [ ] Angular HTTP service connecting to backend
- [ ] Test full stack connection

### Phase 2: Circle Management
- [ ] Create circle API endpoint
- [ ] Circle creation UI with shareable link generation
- [ ] Join circle by URL (/:circleId route)
- [ ] User selection/creation on join

### Phase 3: Resource Sharing
- [ ] Add resources to circle
- [ ] List all resources in circle
- [ ] Basic resource details (name, description, owner)

### Phase 4: Coordination
- [ ] Request to borrow resource
- [ ] Simple approval/denial/auto-approve system
- [ ] Track who has what currently

### Phase 5: Polish
- [ ] Return process
- [ ] Resource availability calendar

## Technical Details

### Backend Structure
```
backend/
├── src/
│   ├── routes/
│   │   ├── circles.ts      # Circle CRUD
│   │   ├── resources.ts    # Resource management
│   │   └── requests.ts     # Borrowing requests
│   ├── services/
│   ├── models/
│   │   ├── circle.model.ts
│   │   ├── resource.model.ts
│   │   └── user.model.ts
│   ├── middleware/
│   ├── app.ts
│   └── server.ts
```

### Frontend Structure
```
src/app/
├── components/
│   ├── resource-card/
│   ├── circle-selector/
│   └── user-picker/
├── services/
│   ├── circle.service.ts
│   ├── resource.service.ts
│   └── http.service.ts
├── pages/
│   ├── home/
│   ├── circle/
│   └── join/
├── models/
└── shared/
```

### Data Models

#### Circle
```typescript
interface Circle {
  id: string;
  name: string;
  users: User[];
  resources: Resource[];
  createdAt: Date;
}
```

#### User
```typescript
interface User {
  id: string;
  name: string;
  joinedAt: Date;
}
```

#### Resource
```typescript
interface Resource {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  currentBorrowerId?: string;
  isAvailable: boolean;
  createdAt: Date;
}
```

#### Request
```typescript
interface BorrowRequest {
  id: string;
  resourceId: string;
  requesterId: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved' | 'denied';
  message?: string;
}
```

## API Endpoints

### Circles
- `POST /api/circles` - Create new circle
- `GET /api/circles/:id` - Get circle details
- `POST /api/circles/:id/join` - Join circle as user

### Resources
- `GET /api/circles/:id/resources` - List circle resources
- `POST /api/circles/:id/resources` - Add resource to circle
- `PUT /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Remove resource

### Requests
- `POST /api/resources/:id/request` - Request to borrow
- `PUT /api/requests/:id/approve` - Approve request
- `PUT /api/requests/:id/deny` - Deny request

## Development Workflow

### Testing Each Feature
1. **Backend**: Test API endpoints with curl/Postman
2. **Frontend**: Test UI components and HTTP service integration
3. **E2E**: Test full user flow before moving to next feature

### Running the App
```bash
# Backend
cd backend
npm run dev

# Frontend
cd circle-frontend
ng serve
```

## Key Learning Points for React → Angular

- **Services vs Hooks**: Injectable services for business logic
- **Signals**: New reactive state management
- **Template Syntax**: `{{ }}` for interpolation, `@if`, `@for` for control flow
- **Dependency Injection**: Framework manages service instances
- **RxJS**: Observables for async operations

## Trust Model
- No authentication - link sharing is the security
- Users self-identify when joining circles
- Suitable for small trusted groups only
- Browser storage for user persistence within circle