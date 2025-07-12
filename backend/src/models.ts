import { db } from './database';
import { Circle, User, Resource, Claim, CircleMember } from '@/shared/types';
import { generateSlug } from '@/shared/utils/slug-generator';
import { randomUUID } from 'crypto';

export class CircleModel {
  static async findBySlug(slug: string): Promise<Circle | null> {
    const result = await db.query('SELECT * FROM circles WHERE slug = $1', [slug]);
    return result.rows[0] || null;
  }

  static async create(data: { name: string; description?: string }): Promise<Circle> {
    const id = randomUUID();
    const slug = generateSlug(data.name);
    
    const result = await db.query(
      'INSERT INTO circles (id, name, slug, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, data.name, slug, data.description]
    );
    
    return result.rows[0];
  }

  static async getMembers(circleId: string): Promise<User[]> {
    const result = await db.query(`
      SELECT u.* FROM users u 
      JOIN circle_members cm ON u.id = cm.user_id 
      WHERE cm.circle_id = $1 AND cm.is_active = true
    `, [circleId]);
    
    return result.rows;
  }

  static async isMember(circleId: string, userId: string): Promise<boolean> {
    const result = await db.query(
      'SELECT 1 FROM circle_members WHERE circle_id = $1 AND user_id = $2 AND is_active = true',
      [circleId, userId]
    );
    
    return result.rows.length > 0;
  }
}

export class UserModel {
  static async findById(id: string): Promise<User | null> {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create(data: { name: string }): Promise<User> {
    const id = randomUUID();
    
    const result = await db.query(
      'INSERT INTO users (id, name) VALUES ($1, $2) RETURNING *',
      [id, data.name]
    );
    
    return result.rows[0];
  }

  static async update(id: string, data: { name: string }): Promise<User> {
    const result = await db.query(
      'UPDATE users SET name = $1, last_active = NOW() WHERE id = $2 RETURNING *',
      [data.name, id]
    );
    
    return result.rows[0];
  }

  static async updateLastActive(id: string): Promise<void> {
    await db.query('UPDATE users SET last_active = NOW() WHERE id = $1', [id]);
  }
}

export class ResourceModel {
  static async findByCircle(circleId: string): Promise<Resource[]> {
    const result = await db.query(
      'SELECT * FROM resources WHERE circle_id = $1 AND is_active = true ORDER BY created_at DESC',
      [circleId]
    );
    
    return result.rows;
  }

  static async findById(id: string): Promise<Resource | null> {
    const result = await db.query('SELECT * FROM resources WHERE id = $1 AND is_active = true', [id]);
    return result.rows[0] || null;
  }

  static async create(data: {
    circle_id: string;
    created_by: string;
    name: string;
    description?: string;
    category?: string;
  }): Promise<Resource> {
    const id = randomUUID();
    
    const result = await db.query(`
      INSERT INTO resources (id, circle_id, created_by, name, description, category)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [id, data.circle_id, data.created_by, data.name, data.description, data.category]);
    
    return result.rows[0];
  }

  static async update(id: string, data: {
    name?: string;
    description?: string;
    category?: string;
  }): Promise<Resource> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.name) {
      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(data.description);
    }
    if (data.category !== undefined) {
      fields.push(`category = $${paramCount++}`);
      values.push(data.category);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await db.query(
      `UPDATE resources SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    
    return result.rows[0];
  }

  static async delete(id: string): Promise<void> {
    await db.query('UPDATE resources SET is_active = false WHERE id = $1', [id]);
  }

  static async isAvailable(resourceId: string, startTime: Date, endTime: Date, excludeClaimId?: string): Promise<boolean> {
    let query = `
      SELECT 1 FROM claims 
      WHERE resource_id = $1 
      AND status = 'active'
      AND (
        (start_time <= $2 AND end_time > $2) OR
        (start_time < $3 AND end_time >= $3) OR
        (start_time >= $2 AND end_time <= $3)
      )
    `;
    const params = [resourceId, startTime, endTime];

    if (excludeClaimId) {
      query += ' AND id != $4';
      params.push(excludeClaimId);
    }

    const result = await db.query(query, params);
    return result.rows.length === 0;
  }
}

export class ClaimModel {
  static async findByResource(resourceId: string): Promise<Claim[]> {
    const result = await db.query(
      'SELECT * FROM claims WHERE resource_id = $1 ORDER BY start_time',
      [resourceId]
    );
    
    return result.rows;
  }

  static async findById(id: string): Promise<Claim | null> {
    const result = await db.query('SELECT * FROM claims WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create(data: {
    resource_id: string;
    user_id: string;
    start_time: Date;
    end_time: Date;
    is_recurring: boolean;
    recurring_pattern?: string;
    notes?: string;
  }): Promise<Claim> {
    const id = randomUUID();
    
    const result = await db.query(`
      INSERT INTO claims (id, resource_id, user_id, start_time, end_time, is_recurring, recurring_pattern, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [
      id, data.resource_id, data.user_id, data.start_time, data.end_time,
      data.is_recurring, data.recurring_pattern, data.notes
    ]);
    
    return result.rows[0];
  }

  static async update(id: string, data: {
    start_time?: Date;
    end_time?: Date;
    notes?: string;
  }): Promise<Claim> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.start_time) {
      fields.push(`start_time = $${paramCount++}`);
      values.push(data.start_time);
    }
    if (data.end_time) {
      fields.push(`end_time = $${paramCount++}`);
      values.push(data.end_time);
    }
    if (data.notes !== undefined) {
      fields.push(`notes = $${paramCount++}`);
      values.push(data.notes);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await db.query(
      `UPDATE claims SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    
    return result.rows[0];
  }

  static async returnClaim(claimId: string): Promise<Claim> {
    const result = await db.query(
      'UPDATE claims SET status = $1, end_time = NOW() WHERE id = $2 RETURNING *',
      ['completed', claimId]
    );
    
    return result.rows[0];
  }

  static async cancel(claimId: string): Promise<Claim> {
    const result = await db.query(
      'UPDATE claims SET status = $1 WHERE id = $2 RETURNING *',
      ['cancelled', claimId]
    );
    
    return result.rows[0];
  }
}

export class CircleMemberModel {
  static async addMember(circleId: string, userId: string): Promise<CircleMember> {
    const id = randomUUID();
    
    const result = await db.query(`
      INSERT INTO circle_members (id, circle_id, user_id)
      VALUES ($1, $2, $3) 
      ON CONFLICT (circle_id, user_id) 
      DO UPDATE SET is_active = true, joined_at = NOW()
      RETURNING *
    `, [id, circleId, userId]);
    
    return result.rows[0];
  }
}