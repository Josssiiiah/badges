# OpenBadges 3.0 Implementation Guide

Your platform is now OpenBadges 3.0 compliant! This guide will help you complete the setup.

## ✅ What's Been Implemented

### Backend
- ✅ Database schema extended with OpenBadges 3.0 fields
- ✅ Cryptographic signing service using Ed25519
- ✅ Public API endpoints for issuer, achievement, and credential data
- ✅ Export endpoints (JSON, PNG, SVG) with embedded credentials
- ✅ Automatic credential generation when assigning badges
- ✅ Credential verification endpoint

### Frontend
- ✅ Download buttons for JSON, PNG, and SVG exports
- ✅ OpenBadges 3.0 compliance indicator on badge pages
- ✅ Required validation for description and earningCriteria fields

## 🚀 Setup Steps

### 1. Apply Database Migration

The schema has been updated, but you need to apply the migration to your database:

```bash
cd backend
bun run migrations/apply_openbadges.ts
```

Or manually run the SQL commands in `migrations/0003_modern_puma.sql`.

### 2. Generate Signing Keys

Each organization needs cryptographic keys to sign badges:

```bash
cd backend
bun run src/scripts/generate-keys.ts
```

This will output:
- **Private Key**: Add to your `.env` file
- **Public Key**: Store in your organization's database record

### 3. Update Environment Variables

Add to your `backend/.env`:

```bash
# OpenBadges 3.0 Configuration
OPENBADGES_PRIVATE_KEY=<your-private-key-from-step-2>
BACKEND_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

⚠️ **IMPORTANT**:
- Keep the private key SECRET
- Never commit it to version control
- Use different keys for development and production

### 4. Update Organization Records

For each organization in your database, add:

1. **Public Key** (from step 2)
2. **Organization URL** (website)
3. **Organization Email** (public contact)
4. **Description** (optional but recommended)
5. **Logo Image URL** (optional)

You can do this via SQL:

```sql
UPDATE organizations
SET
  public_key = '<public-key-from-step-2>',
  url = 'https://yourschool.edu',
  email = 'badges@yourschool.edu',
  description = 'Your organization description',
  image = 'https://yourschool.edu/logo.png'
WHERE id = '<organization-id>';
```

### 5. Verify Installation

1. **Create a test badge** with description and earning criteria
2. **Assign it to a user**
3. **View the badge page** - you should see download buttons
4. **Download JSON** and verify it contains:
   - `@context` with OpenBadges URLs
   - `type: ["VerifiableCredential", "OpenBadgeCredential"]`
   - `issuer` profile
   - `credentialSubject` with achievement
   - `proof` with cryptographic signature

5. **Test verification**:
   ```bash
   curl https://yourdomain.com/api/badges/api/credentials/<credentialId>/verify
   ```

## 📋 New API Endpoints

### Public Endpoints (No Authentication)

```
GET /api/badges/api/issuers/:organizationId
GET /api/badges/api/achievements/:badgeId
GET /api/badges/api/credentials/:credentialId
GET /api/badges/api/credentials/:credentialId/verify
```

### Export Endpoints (Authenticated)

```
GET /api/badges/export/:assignmentId/json
GET /api/badges/export/:assignmentId/png
GET /api/badges/export/:assignmentId/svg
```

## 🎯 What Happens Now

### When a Badge is Assigned

1. System generates a unique credential ID
2. Creates an OpenBadgeCredential with:
   - Issuer profile (from organization data)
   - Achievement definition (from badge template)
   - Recipient identifier (email)
   - Issuance date
3. Signs the credential with Ed25519 signature
4. Stores the signed credential in the database
5. Sends email notification to recipient

### When a User Downloads Their Badge

**JSON Format:**
- Pure OpenBadgeCredential JSON
- Can be imported into other platforms
- Contains cryptographic proof

**PNG Format:**
- Badge image with embedded credential JSON
- "Baked badge" - portable and verifiable
- Credential stored in PNG metadata

**SVG Format:**
- Scalable vector graphic
- Credential embedded in SVG metadata
- High quality for printing/display

## 🔐 Security Notes

1. **Private Key Storage**
   - Store in environment variables only
   - Never in database or code
   - Rotate periodically (generate new keys)

2. **Public Key Distribution**
   - Published in issuer profile endpoint
   - Used by verifiers to check signatures
   - Can be shared publicly

3. **Credential Verification**
   - Anyone can verify a credential's authenticity
   - Uses public key to verify signature
   - Checks that credential hasn't been tampered with

## 📚 Required Fields for Compliance

When creating badges, these fields are now **required**:

- ✅ **Name** - Badge title
- ✅ **Description** - What the badge represents
- ✅ **Earning Criteria** - How to earn the badge
- ✅ **Issued By** - Issuing organization name
- ✅ **Image** - Badge visual

Optional but recommended:
- Skills (comma-separated)
- Course Link
- Achievement Type (Badge, Certificate, etc.)

## 🧪 Testing Checklist

- [ ] Database migration applied successfully
- [ ] Keys generated and stored in .env
- [ ] Organization record updated with public key and URL
- [ ] Can create a new badge with required fields
- [ ] Can assign badge to a user
- [ ] Credential automatically generated and signed
- [ ] Download JSON works and contains valid OpenBadgeCredential
- [ ] Download PNG works
- [ ] Download SVG works
- [ ] Verification endpoint returns `verified: true`
- [ ] Public API endpoints are accessible

## 🎓 OpenBadges 3.0 Certification

To get officially certified by 1EdTech:

1. **Membership Required**: Join 1EdTech as a member
2. **Submit Test Credential**: Create and submit a badge to `conformance@imsglobal.org`
3. **Documentation**: Provide video showing how users retrieve badges
4. **Validation**: 1EdTech will test your implementation

Official certification info: https://www.imsglobal.org/spec/ob/v3p0/cert/

## 🆘 Troubleshooting

### "Badge credential not generated"
- Check that OPENBADGES_PRIVATE_KEY is set in .env
- Verify organization has a public_key in database
- Check backend logs for errors

### "Verification fails"
- Ensure public key in database matches the key used to sign
- Check that credential hasn't been modified
- Verify the signature format is correct

### "Missing required fields" error
- Make sure description and earningCriteria are filled in
- These are now required for OpenBadges 3.0 compliance

## 📖 Resources

- [OpenBadges 3.0 Specification](https://www.imsglobal.org/spec/ob/v3p0)
- [Implementation Guide](https://www.imsglobal.org/spec/ob/v3p0/impl/)
- [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)

## 🎉 Success!

Your platform now issues cryptographically signed, industry-standard digital credentials that can be verified by anyone and imported into other OpenBadges-compliant systems!
