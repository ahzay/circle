import { Response } from 'express';
import { CircleEvent } from '@/shared/types';

interface SSEClient {
  id: string;
  response: Response;
  circleSlug: string;
}

class SSEManager {
  private clients: Map<string, SSEClient[]> = new Map();

  addClient(circleSlug: string, clientId: string, response: Response) {
    if (!this.clients.has(circleSlug)) {
      this.clients.set(circleSlug, []);
    }
    
    const clients = this.clients.get(circleSlug)!;
    clients.push({ id: clientId, response, circleSlug });

    response.on('close', () => {
      this.removeClient(circleSlug, clientId);
    });
  }

  removeClient(circleSlug: string, clientId: string) {
    const clients = this.clients.get(circleSlug);
    if (clients) {
      const index = clients.findIndex(client => client.id === clientId);
      if (index !== -1) {
        clients.splice(index, 1);
      }
    }
  }

  broadcast(circleSlug: string, event: CircleEvent) {
    const clients = this.clients.get(circleSlug) || [];
    const eventData = JSON.stringify(event);
    
    clients.forEach(client => {
      try {
        client.response.write(`data: ${eventData}\n\n`);
      } catch (error) {
        this.removeClient(circleSlug, client.id);
      }
    });
  }
}

export const sseManager = new SSEManager();