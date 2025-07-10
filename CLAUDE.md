# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Circle is a shared resource coordination app for trusted groups (neighbors, friends) to share lawn mowers, tools, cars, etc. No user accounts - just join via shareable links. This is a learning project for a React/Go developer transitioning to Angular/Node.js.

## Architecture

This is a full-stack TypeScript application with:

- **Backend**: Node.js + Express + TypeScript (in `backend/`)
- **Frontend**: Angular 18+ with Material Design (in `circle-frontend/`)
- **Storage**: In-memory first (database to be added later)
- **Security**: Link-sharing model for trusted groups only

## Key Technical Details

### Data Models
The app revolves around these core entities:
- **Circle**: Container for users and resources with shareable ID
- **User**: Simple name-based identity stored in browser
- **Resource**: Shareable items owned by users
- **BorrowRequest**: Coordination for borrowing/returning

### API Structure (planned)
- `/api/circles` - Circle CRUD operations
- `/api/circles/:id/resources` - Resource management
- `/api/resources/:id/request` - Borrowing requests

### Frontend Architecture
- Uses Angular 18+ with signals for reactive state
- Material Design components (rose-red theme)
- SCSS for styling
- Services for business logic (vs React hooks)
- RxJS for async operations

## Development Workflow

The project follows a phased approach:
1. **Phase 1**: Basic Express server + Angular HTTP connection
2. **Phase 2**: Circle creation and joining via URLs
3. **Phase 3**: Resource sharing within circles
4. **Phase 4**: Request/approval coordination system
5. **Phase 5**: Polish and notifications

Test each phase end-to-end before moving to the next.

## Trust Model

- No authentication system - link sharing is the security boundary
- Users self-identify when joining circles
- Suitable only for small trusted groups
- Browser storage maintains user identity within circles