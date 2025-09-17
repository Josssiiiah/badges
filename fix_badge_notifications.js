#!/usr/bin/env node

/**
 * Script to fix badge notifications for users who didn't receive the initial email
 * 
 * This script will:
 * 1. Delete existing badge assignments for users who didn't receive notifications
 * 2. Re-add the badge assignments for those users
 * 3. Send the "Create account to view your badge" email to each user
 */

const DATABASE_URL = process.env.DATABASE_URL || 'your_database_connection_string';
const BACKEND_URL = process.env.BACKEND_URL
const BADGE_ID = 'CxRoAiDGH_72A55pOZMvb';

// List of emails that DID receive the notification (should be excluded)
const EMAILS_THAT_RECEIVED_NOTIFICATION = [
  'ams.sheppard@gmail.com',
  'agcolon@cps.edu',
  'ajurado1@my.nl.edu',
  'ajames4@my.nl.edu',
  'amcoon.bill@gmail.com',
  'ngreen9@nl.edu',
  'ctheardgriggs@nl.edu',
  'escola1@nl.edu',
  'anitajhill@gmail.com',
  'vthamotharan@gmail.com',
  'vthamotharan@nl.edu'
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getEmailsToProcess() {
  // This should be replaced with actual database query
  // For now, you'll need to run this SQL query manually and provide the results:
  
  const query = `
    SELECT DISTINCT u.email 
    FROM user u
    JOIN badges b ON u.id = b.user_id
    JOIN created_badges cb ON b.badge_id = cb.id
    WHERE cb.id = '${BADGE_ID}'
    AND u.email NOT IN (${EMAILS_THAT_RECEIVED_NOTIFICATION.map(email => `'${email}'`).join(', ')});
  `;
  
  console.log('🔍 Run this query to get emails that NEED processing (those who DIDN\'T receive notifications):');
  console.log(query);
  console.log('\n📝 Please manually run this query and update the EMAILS_TO_PROCESS array below:');
  console.log('⚠️  IMPORTANT: Only emails NOT in the received list will be processed!');
  
  // TODO: Replace this with actual results from the database query
  const EMAILS_TO_PROCESS = [
    "tracyf100@comcast.net",
  ];
  
  return EMAILS_TO_PROCESS;
}



async function reAssignBadgesAndSendEmails(emails) {
  console.log('🎖️  Re-assigning badges and sending emails...');
  
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    console.log(`\n📧 Processing ${i + 1}/${emails.length}: ${email}`);
    
    try {
      // Call the assign-by-email endpoint which handles both badge assignment and email sending
      const response = await fetch(`http://localhost:3000/api/badges/assign-by-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // You'll need to include proper authentication headers here
          // 'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
        },
        body: JSON.stringify({
          badgeId: BADGE_ID,
          email: email
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Success: Badge assigned and email sent to ${email}`);
        if (result.assignment) {
          console.log(`   Assignment ID: ${result.assignment.id}`);
        }
      } else {
        const error = await response.text();
        console.error(`❌ Failed for ${email}: ${response.status} - ${error}`);
      }
      
      // Rate limiting: wait 2 seconds between requests to avoid hitting rate limits
      if (i < emails.length - 1) {
        console.log('⏱️  Waiting 2 seconds to avoid rate limiting...');
        await delay(2000);
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${email}:`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting badge notification fix process...');
  console.log(`📍 Badge ID: ${BADGE_ID}`);
  console.log(`🌐 Backend URL: ${BACKEND_URL}`);
  
  try {
    // Step 1: Get emails that need processing
    const emailsToProcess = await getEmailsToProcess();
    
    if (emailsToProcess.length === 0) {
      console.log('ℹ️  No emails to process. Please update the EMAILS_TO_PROCESS array in the script.');
      console.log('   Run the SQL query shown above to get the list of emails.');
      return;
    }
    
    console.log(`\n📊 Found ${emailsToProcess.length} emails that DIDN'T receive notifications:`);
    emailsToProcess.forEach((email, index) => {
      console.log(`   ${index + 1}. ${email}`);
    });
    
    console.log('\n✅ These emails are NOT in the received notification list:');
    console.log('   [' + EMAILS_THAT_RECEIVED_NOTIFICATION.join(', ') + ']');
    
    
    // Wait for user input (in a real scenario, you might want to automate this)
    // For now, we'll just continue with a warning
    console.log('\n⚠️  WARNING: Make sure you ran the deletion query before the next step!');
    
    // Step 3: Re-assign badges and send emails
    await reAssignBadgesAndSendEmails(emailsToProcess);
    
    console.log('\n✅ Badge notification fix process completed!');
    console.log('📈 Summary:');
    console.log(`   - Processed ${emailsToProcess.length} emails`);
    console.log(`   - Badge ID: ${BADGE_ID}`);
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// CLI version that can be run with specific emails
if (process.argv.length > 2) {
  // Allow passing emails as command line arguments
  const cliEmails = process.argv.slice(2);
  console.log('📧 Processing emails from command line arguments:');
  cliEmails.forEach((email, index) => {
    console.log(`   ${index + 1}. ${email}`);
  });
  
  reAssignBadgesAndSendEmails(cliEmails)
    .then(() => {
      console.log('\n✅ Command line processing completed!');
    })
    .catch(error => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
} else {
  main();
}

module.exports = {
  getEmailsToProcess,
  reAssignBadgesAndSendEmails,
  BADGE_ID,
  EMAILS_THAT_RECEIVED_NOTIFICATION
};