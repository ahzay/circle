import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'circle',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

export const db = pool;

export const initDatabase = async () => {
  await db.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    CREATE TABLE IF NOT EXISTS circles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(120) UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      last_active TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS circle_members (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      circle_id UUID REFERENCES circles(id),
      user_id UUID REFERENCES users(id),
      joined_at TIMESTAMP DEFAULT NOW(),
      is_active BOOLEAN DEFAULT true,
      UNIQUE(circle_id, user_id)
    );
    
    CREATE TABLE IF NOT EXISTS resources (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      circle_id UUID REFERENCES circles(id),
      created_by UUID REFERENCES users(id),
      name VARCHAR(100) NOT NULL,
      description TEXT,
      category VARCHAR(50),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS claims (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      resource_id UUID REFERENCES resources(id),
      user_id UUID REFERENCES users(id),
      start_time TIMESTAMP NOT NULL,
      end_time TIMESTAMP NOT NULL,
      is_recurring BOOLEAN DEFAULT false,
      recurring_pattern VARCHAR(20),
      status VARCHAR(20) DEFAULT 'active',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_circles_slug ON circles(slug);
    CREATE INDEX IF NOT EXISTS idx_circle_members_circle_id ON circle_members(circle_id);
    CREATE INDEX IF NOT EXISTS idx_resources_circle_id ON resources(circle_id);
    CREATE INDEX IF NOT EXISTS idx_claims_resource_id ON claims(resource_id);
    CREATE INDEX IF NOT EXISTS idx_claims_time_range ON claims(start_time, end_time);
  `);
};
