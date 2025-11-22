import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../src/db/schema';

const client = createClient({ url: ':memory:' });
export const testDb = drizzle(client, { schema });

