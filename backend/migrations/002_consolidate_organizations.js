import { db } from '../src/db/connection.js';
import { sql } from 'drizzle-orm';

// This migration script consolidates organizations with the same name
// and updates all associated users and students to use the same organization ID
async function consolidateOrganizations() {
  console.log('Starting organization consolidation...');

  try {
    // Get all organizations
    const organizations = await db.execute(sql`SELECT id, name FROM organizations`);
    
    // Create a map to track organization names and their canonical IDs
    const orgMap = new Map();
    
    // First pass: Identify canonical organization IDs for each organization name
    for (const org of organizations) {
      if (!orgMap.has(org.name)) {
        // The first occurrence of an organization name becomes the canonical one
        orgMap.set(org.name, org.id);
        console.log(`Organization "${org.name}" with ID ${org.id} set as canonical`);
      }
    }
    
    // Second pass: Update users with non-canonical organization IDs
    for (const org of organizations) {
      const canonicalId = orgMap.get(org.name);
      
      // Skip if this is already the canonical organization
      if (org.id === canonicalId) continue;
      
      console.log(`Updating users from organization ID ${org.id} to ${canonicalId}`);
      
      // Update all users associated with this organization ID
      await db.execute(sql`
        UPDATE user 
        SET organization_id = ${canonicalId} 
        WHERE organization_id = ${org.id}
      `);
      
      // Update all students associated with this organization ID
      await db.execute(sql`
        UPDATE students 
        SET organization_id = ${canonicalId} 
        WHERE organization_id = ${org.id}
      `);
      
      // Update all created badges associated with this organization ID
      await db.execute(sql`
        UPDATE created_badges 
        SET organization_id = ${canonicalId} 
        WHERE organization_id = ${org.id}
      `);
      
      // Delete the redundant organization record
      await db.execute(sql`DELETE FROM organizations WHERE id = ${org.id}`);
      
      console.log(`Removed redundant organization ID ${org.id}`);
    }
    
    console.log('Organization consolidation completed successfully');
  } catch (error) {
    console.error('Error during organization consolidation:', error);
    throw error;
  }
}

// Execute the migration
consolidateOrganizations()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 