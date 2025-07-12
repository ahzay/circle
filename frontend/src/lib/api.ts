import { ROUTES } from '../../../shared/routes';
import type { Circle, User, Resource, Claim } from '../../../shared/types';
import { 
  CreateCircleSchema, 
  CreateUserSchema, 
  CreateResourceSchema, 
  CreateClaimSchema,
  JoinCircleSchema 
} from '../../../shared/validation/schemas';

const API_BASE = 'http://localhost:3000';

class APIClient {
  private getUserId(): string | null {
    return localStorage.getItem('circle_user_id');
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const userId = this.getUserId();
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(userId && { 'X-User-ID': userId }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // User management
  async createUser(data: { name: string }): Promise<User> {
    const validated = CreateUserSchema.parse(data);
    const response = await this.request<{ data: User }>(ROUTES.USERS, {
      method: 'POST',
      body: JSON.stringify(validated),
    });
    return response.data;
  }

  async getUser(id: string): Promise<User> {
    const response = await this.request<{ data: User }>(ROUTES.USER_DETAIL(id));
    return response.data;
  }

  async updateUser(id: string, data: { name: string }): Promise<User> {
    const validated = CreateUserSchema.parse(data);
    return this.request<User>(ROUTES.USER_DETAIL(id), {
      method: 'PUT',
      body: JSON.stringify(validated),
    });
  }

  // Circle management
  async createCircle(data: { name: string; description?: string }): Promise<Circle> {
    const validated = CreateCircleSchema.parse(data);
    const response = await this.request<{ data: Circle }>(ROUTES.CIRCLES, {
      method: 'POST',
      body: JSON.stringify(validated),
    });
    return response.data;
  }

  async getCircle(slug: string): Promise<Circle> {
    const response = await this.request<{ data: Circle }>(ROUTES.CIRCLE_DETAIL(slug));
    return response.data;
  }

  async joinCircle(slug: string, userId: string): Promise<void> {
    const validated = JoinCircleSchema.parse({ user_id: userId });
    await this.request<void>(ROUTES.CIRCLE_JOIN(slug), {
      method: 'POST',
      body: JSON.stringify(validated),
    });
  }

  async getCircleMembers(slug: string): Promise<User[]> {
    const response = await this.request<{ data: User[] }>(ROUTES.CIRCLE_MEMBERS(slug));
    return response.data;
  }

  // Resource management
  async getCircleResources(slug: string): Promise<Resource[]> {
    const response = await this.request<{ data: Resource[] }>(ROUTES.CIRCLE_RESOURCES(slug));
    return response.data;
  }

  async createResource(slug: string, data: {
    name: string;
    description?: string;
    category?: string;
  }): Promise<Resource> {
    const validated = CreateResourceSchema.parse(data);
    const response = await this.request<{ data: Resource }>(ROUTES.CIRCLE_RESOURCES(slug), {
      method: 'POST',
      body: JSON.stringify(validated),
    });
    return response.data;
  }

  async getResource(id: string): Promise<Resource> {
    const response = await this.request<{ data: Resource }>(ROUTES.RESOURCE_DETAIL(id));
    return response.data;
  }

  async updateResource(id: string, data: {
    name?: string;
    description?: string;
    category?: string;
  }): Promise<Resource> {
    const response = await this.request<{ data: Resource }>(ROUTES.RESOURCE_DETAIL(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async deleteResource(id: string): Promise<void> {
    await this.request<void>(ROUTES.RESOURCE_DETAIL(id), {
      method: 'DELETE',
    });
  }

  // Claim management
  async getResourceClaims(resourceId: string): Promise<Claim[]> {
    const response = await this.request<{ data: Claim[] }>(ROUTES.RESOURCE_CLAIMS(resourceId));
    return response.data;
  }

  async createClaim(resourceId: string, data: {
    start_time: string;
    end_time: string;
    is_recurring?: boolean;
    recurring_pattern?: 'weekly' | 'monthly';
    notes?: string;
  }): Promise<Claim> {
    const validated = CreateClaimSchema.parse(data);
    const response = await this.request<{ data: Claim }>(ROUTES.RESOURCE_CLAIMS(resourceId), {
      method: 'POST',
      body: JSON.stringify(validated),
    });
    return response.data;
  }

  async getClaim(id: string): Promise<Claim> {
    return this.request<Claim>(ROUTES.CLAIM_DETAIL(id));
  }

  async updateClaim(id: string, data: {
    start_time?: string;
    end_time?: string;
    notes?: string;
  }): Promise<Claim> {
    return this.request<Claim>(ROUTES.CLAIM_DETAIL(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async returnClaim(id: string): Promise<Claim> {
    const response = await this.request<{ data: Claim }>(ROUTES.CLAIM_RETURN(id), {
      method: 'POST',
    });
    return response.data;
  }

  async deleteClaim(id: string): Promise<void> {
    await this.request<void>(ROUTES.CLAIM_DETAIL(id), {
      method: 'DELETE',
    });
  }

  // SSE for real-time updates
  createEventSource(slug: string): EventSource {
    const userId = this.getUserId();
    const url = new URL(`${API_BASE}${ROUTES.CIRCLE_EVENTS(slug)}`);
    
    if (userId) {
      url.searchParams.set('user_id', userId);
    }

    return new EventSource(url.toString());
  }
}

export const api = new APIClient();