import { describe, it, expect, beforeAll, vi } from 'vitest';
import { Elysia } from 'elysia';
import { migrate } from 'drizzle-orm/libsql/migrator';
import * as schema from '../src/db/schema';
import { testDb } from './test-db';

// Mock environment variables
process.env.FRONTEND_URL = 'http://localhost:3001';
process.env.TURSO_DATABASE_URL = 'file::memory:';
process.env.TURSO_AUTH_TOKEN = 'dummy';

// Mock the database connection module
vi.mock('../src/db/connection', async () => {
  const { testDb } = await import('./test-db');
  return { db: testDb };
});

// Mock auth middleware
vi.mock('../src/middleware/auth-middleware', () => ({
  userMiddleware: async (ctx: any) => {
    return {
      user: {
        id: 'test-admin',
        role: 'administrator',
        organizationId: 'test-org',
        emailVerified: true
      },
      session: {
        id: 'test-session'
      }
    };
  },
  userInfo: (user: any, session: any) => ({ user, session })
}));

// Import the routes AFTER mocking
import { badgeRoutes } from '../src/routes/badges';

describe('Badge Routes', () => {
  let app: any;

  beforeAll(async () => {
    try {
        await migrate(testDb, { migrationsFolder: './migrations' });
    } catch (e) {
        console.error("Migration failed", e);
    }
    
    // Seed organization for admin
    await testDb.insert(schema.organizations).values({
        id: 'test-org',
        name: 'Test Organization',
        short_code: 'TO'
    });

    // Create a fresh app instance for testing
    // Type casting to any to bypass complex Elysia type inference issues during testing
    app = new Elysia()
      .use(badgeRoutes);
  });

  it('should list badges for admin', async () => {
    const response = await app.handle(
      new Request('http://localhost/badges/all', {
        method: 'GET'
      })
    );
    
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('badges');
    expect(Array.isArray(body.badges)).toBe(true);
  });
});
