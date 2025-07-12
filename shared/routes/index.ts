export const ROUTES = {
  CIRCLES: '/api/circles',
  CIRCLE_DETAIL: (slug: string) => `/api/circles/${slug}`,
  CIRCLE_MEMBERS: (slug: string) => `/api/circles/${slug}/members`,
  CIRCLE_JOIN: (slug: string) => `/api/circles/${slug}/join`,
  CIRCLE_RESOURCES: (slug: string) => `/api/circles/${slug}/resources`,
  CIRCLE_EVENTS: (slug: string) => `/api/circles/${slug}/events`,
  
  USERS: '/api/users',
  USER_DETAIL: (id: string) => `/api/users/${id}`,
  
  RESOURCES: '/api/resources',
  RESOURCE_DETAIL: (id: string) => `/api/resources/${id}`,
  RESOURCE_CLAIMS: (id: string) => `/api/resources/${id}/claims`,
  
  CLAIMS: '/api/claims',
  CLAIM_DETAIL: (id: string) => `/api/claims/${id}`,
  CLAIM_RETURN: (id: string) => `/api/claims/${id}/return`,
} as const;
