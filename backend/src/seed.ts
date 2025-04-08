import { db } from "./db/connection";
import * as schema from "./db/schema";
import { nanoid } from "nanoid";
import { badgeImageData } from "./public/imagedata";

// ============= SEED DATA =============
// Modify this object to change your seed data
const seedData = {
  organizations: [
    {
      id: "h5l3I4HJU5h45kcdova_K", // Required organization ID
      name: "National Louis University",
      short_code: "W3KZRD",
    },
  ],
  users: [
    {
      id: "5Yr4ZaPcRknqqSZNbMvfiGhPnJqWslqc", // User ID
      name: "Carolyn Griggs",
      email: "ctheardgriggs@nl.edu",
      role: "administrator",
      organization: "National Louis University", // Optional organization name
      organizationId: "h5l3I4HJU5h45kcdova_K", // Must match an organization ID
    },
    {
        id: "wnPGLZMBEjLNSXzqVJ5usnB6i7yg7e11", // User ID
        name: "Josiah Griggs",
        email: "josiah@test.com",
        role: "student",
    },
    {
        id: "iDFSkfwHCOPQoO3CcVyfpDvtqCoAC4nS", // User ID
        name: "Vishodana Thamotharan",
        email: "vthamotharan@nl.edu",
        role: "student",
    },
  ],
  // New accounts data
  accounts: [
    {
      id: "JvxunO9RttIzQOAY49LHSUaSfe6Q59Wt", // Account ID
      accountId: "5Yr4ZaPcRknqqSZNbMvfiGhPnJqWslqc", // External provider account ID
      userId: "5Yr4ZaPcRknqqSZNbMvfiGhPnJqWslqc", // Reference to user ID
      providerId: "credential",
      password: "5b82297ac70abf64e597f84516dfc9ab:f2d192bcd21f0add55c28b3af1606602d8f72a98934e8fa856e97d88a380b09109a166b748c26dc17631c5991998cf530cd509369c2ac061be3562e238dc7618", // In a real app, use proper password hashing
    },
    {
      id: "heVlQgdN5KYMu0MysOe1FjJc7jj0elEi", // Account ID
      accountId: "wnPGLZMBEjLNSXzqVJ5usnB6i7yg7e11", // External provider account ID
      userId: "wnPGLZMBEjLNSXzqVJ5usnB6i7yg7e11", // Reference to Josiah's user ID
      providerId: "credential",
      password: "28fffdfd862b07fbb42a06b0c92d8829:3a8f0fb4fcb96dac89379c79539faa68f679c4d4677305a56bfc6fdf22e8eb6f1f9e81cda57e6e1f63636f0be06df3ca4d7b93b9c48c8528177a4f4c703a3564", // In a real app, use proper password hashing
    },
    {
      id: "MheUao0SCUYqY9juVmU5LI1odOnpW5jJ", // Account ID
      accountId: "iDFSkfwHCOPQoO3CcVyfpDvtqCoAC4nS", // External provider account ID
      userId: "iDFSkfwHCOPQoO3CcVyfpDvtqCoAC4nS", // Reference to Vishodana's user ID
      providerId: "credential", 
      password: "a999f4485b638d08abb09d5704d26ef2:9f5b25f943f0a12b4ef7b94883a85a5a482406f76f3ef452cddcb65f646af1cafd6ae62c5aafacf9443a5541bcde7a8c36a2927880fa96bbd05014cb3e2b5e30", // In a real app, use proper password hashing
    },
  ],
  // Organization Users junction data
  organizationUsers: [
    {
      id: "_vRZQIGl4B7hOjIVhsHlC", // Organization user relationship ID
      organizationId: "h5l3I4HJU5h45kcdova_K", // Must match an organization ID
      userId: "5Yr4ZaPcRknqqSZNbMvfiGhPnJqWslqc", // Must match a user ID
      role: "administrator",
    },

  ],
  createdBadges: [
    {
      id: "S3FZK8QfRdn6DddDYwBhd", // Badge ID
      issuedBy: "National Louis University",
      name: "AI Innovations in Teaching & Learning Badge",
      description: "Through the AI Badge, the badge earner has learned to effectively, efficiently, and ethically use AI to transform their teaching practice and pedagogy. They have learned to use AI to design culturally responsive lesson plans and assessments that align with standards and promote equity. They can apply Universal Design for Learning (UDL) principles by using AI to create differentiated learning experiences and provide real-time feedback to improve student learning. Additionally, they are able to use AI to support multilingual learners by seamlessly integrating translanguaging strategies into lessons. They can also use AI to strengthen family connections, fostering a more collaborative and supportive learning environment. Finally, they are able to create personalized GPTs tailored to the unique needs of their classroom, ensuring customized support for both themselves and their students.",
      imageData: badgeImageData.nlBadge, // Using the imported image data
      courseLink: "https://nl.edu/national-college-of-education/ai-innovations-in-teaching-and-learning-badge/", // Added course link
      skills: "Culturally Responsive Teaching, Universal Design for Learning, Translanguaging, Personalized GPT, Curriculum Design",
      earningCriteria: "To earn the AI Innovations in Teaching & Learning Badge, participants must: Attend all 8 synchronous 1-hour Zoom sessions or actively engage with asynchronous learning materials if unable to attend live sessions. Create a custom GPT to improve teaching, learning, or collaboration with families. Complete all required tasks and activities aligned with the Badge objectives.",
      organizationId: "h5l3I4HJU5h45kcdova_K", // Updated to valid organization ID
    },
  ],
  // Assigned badges data
  badges: [
    {
      id: "lqLKPa9Hd4cBUsjtgKKHS", // Badge ID
      badgeId: "S3FZK8QfRdn6DddDYwBhd", // Must match a created badge ID (AI Badge)
      userId: "wnPGLZMBEjLNSXzqVJ5usnB6i7yg7e11", // Updated to match Josiah's user ID
    },
    {
      id: "z0M5owHsy9UdumL83bliX", // Badge ID
      badgeId: "S3FZK8QfRdn6DddDYwBhd", // Must match a created badge ID (AI Badge)
      userId: "iDFSkfwHCOPQoO3CcVyfpDvtqCoAC4nS", // Updated to match Vishodana's user ID
    }
  ],
  students: [
    {
      studentId: "O7wI8RnO",
      name: "Josiah Griggs",
      email: "josiahgriggs8@stanford.edu",
      hasBadge: true,
      badgeId: "lqLKPa9Hd4cBUsjtgKKHS", // ID of Josiah's badge
      organizationId: "h5l3I4HJU5h45kcdova_K", // Updated to valid organization ID
    },
    {
      studentId: "UxlJOc9g",
      name: "Vishodana Thamotharan",
      email: "vthamotharan@nl.edu",
      hasBadge: true,
      badgeId: "z0M5owHsy9UdumL83bliX", // ID of Vishodana's badge
      organizationId: "h5l3I4HJU5h45kcdova_K", // Updated to valid organization ID
    },
  ],
};

// ============= SEEDING FUNCTIONS =============

async function clearTables() {
  console.log("Clearing existing data...");
  // Delete in reverse order of dependencies
  await db.delete(schema.students);
  await db.delete(schema.badges);
  await db.delete(schema.createdBadges);
  await db.delete(schema.organizationUsers);
  await db.delete(schema.account);
  await db.delete(schema.session);
  await db.delete(schema.verification);
  await db.delete(schema.user);
  await db.delete(schema.organizations);
  console.log("All tables cleared.");
}

async function seedOrganizations() {
  console.log("Seeding organizations...");
  
  for (const org of seedData.organizations) {
    await db.insert(schema.organizations).values({
      id: org.id,
      name: org.name,
      short_code: org.short_code,
    });
    
    console.log(`Added organization: ${org.name} (${org.id})`);
  }
}

async function seedUsers() {
  console.log("Seeding users...");
  
  for (const userData of seedData.users) {
    // Create user with organization field
    await db.insert(schema.user).values({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role as "student" | "administrator",
      organization: userData.organization, // Handle optional organization name
      organizationId: userData.organizationId,
    });
    
    console.log(`Added user: ${userData.name} (${userData.id}) ${userData.organization ? `in organization ${userData.organization}` : ''}`);
  }
}

async function seedAccounts() {
  console.log("Seeding accounts...");
  
  for (const accountData of seedData.accounts) {
    await db.insert(schema.account).values({
      id: accountData.id,
      userId: accountData.userId,
      accountId: accountData.accountId,
      providerId: accountData.providerId,
      password: accountData.password,
    });
    
    console.log(`Added account ${accountData.id} for user: ${accountData.userId}`);
  }
}

async function seedOrganizationUsers() {
  console.log("Seeding organization users...");
  
  for (const orgUser of seedData.organizationUsers) {
    await db.insert(schema.organizationUsers).values({
      id: orgUser.id,
      organizationId: orgUser.organizationId,
      userId: orgUser.userId,
      role: orgUser.role as "student" | "administrator",
    });
    
    console.log(`Added organization user relationship: ${orgUser.id} - ${orgUser.userId} in ${orgUser.organizationId} as ${orgUser.role}`);
  }
}

async function seedCreatedBadges() {
  console.log("Seeding created badges...");
  
  for (const badge of seedData.createdBadges) {
    await db.insert(schema.createdBadges).values({
      id: badge.id,
      issuedBy: badge.issuedBy,
      name: badge.name,
      description: badge.description,
      imageData: badge.imageData,
      courseLink: badge.courseLink,
      skills: badge.skills,
      earningCriteria: badge.earningCriteria,
      organizationId: badge.organizationId,
    });
    
    console.log(`Added created badge: ${badge.name} (${badge.id})`);
  }
}

async function seedAssignedBadges() {
  console.log("Seeding assigned badges...");
  
  for (const assignment of seedData.badges) {
    await db.insert(schema.badges).values({
      id: assignment.id,
      badgeId: assignment.badgeId,
      userId: assignment.userId,
    });
    
    console.log(`Assigned badge ${assignment.badgeId} to user ${assignment.userId}`);
  }
}

async function seedStudents() {
  console.log("Seeding students...");
  
  for (const student of seedData.students) {
    await db.insert(schema.students).values({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      hasBadge: student.hasBadge,
      badgeId: student.badgeId,
      organizationId: student.organizationId,
      createdAt: new Date(),
      updatedAt: new Date(),

    });
    
    console.log(`Added student: ${student.name} (${student.studentId})`);
  }
}

async function seed() {
  try {
    console.log("Starting database seeding...");
    
    // Clear existing data - uncomment to clear all data
    await clearTables();
    
    // Seed data in order of dependencies
    await seedOrganizations();
    await seedUsers();
    await seedAccounts();
    await seedOrganizationUsers();
    await seedCreatedBadges();
    await seedAssignedBadges();
    await seedStudents();
    
    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seed(); 