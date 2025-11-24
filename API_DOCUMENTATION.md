# OceanCare Initiative API Documentation

**Base URL:** `https://oceancare.org` (Production) / `http://localhost:3000` (Development)

**Version:** 1.0.0  
**Last Updated:** November 24, 2025

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Donations](#donations)
3. [Volunteers](#volunteers)
4. [Debris Reporting](#debris-reporting)
5. [Contact](#contact)
6. [News & Information](#news--information)
7. [Ocean Data](#ocean-data)
8. [Error Handling](#error-handling)
9. [Rate Limiting](#rate-limiting)
10. [Security](#security)

---

## Authentication

### JWT Bearer Token Authentication

Some endpoints require authentication using JWT tokens. Include the token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

### Request Headers

All API requests should include:

```
Content-Type: application/json
Authorization: Bearer <token> (if required)
```

---

## Donations

### Create Payment Intent

Create a Stripe payment intent for a one-time donation.

**Endpoint:** `POST /api/donate/create-payment-intent`

**Rate Limit:** 10 requests/hour per IP

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "amount": 25.00,
  "purpose": "Coral Restoration"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Donor's full name (2-100 characters) |
| `email` | string | Yes | Valid email address |
| `amount` | number | Yes | Donation amount in USD ($0.50-$1,000,000) |
| `purpose` | string | No | Donation purpose (max 500 characters) |

**Success Response (200):**

```json
{
  "success": true,
  "clientSecret": "pi_1234567890_secret_xxxxx",
  "paymentIntentId": "pi_1234567890",
  "amount": 25.00,
  "currency": "usd"
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Invalid email address"
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:3000/api/donate/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "amount": 25.00,
    "purpose": "Coral Restoration"
  }'
```

---

### Confirm Payment

Confirm a Stripe payment and record the donation.

**Endpoint:** `POST /api/donate/confirm`

**Rate Limit:** 10 requests/hour per IP

**Request Body:**

```json
{
  "paymentIntentId": "pi_1234567890",
  "name": "John Doe",
  "email": "john@example.com",
  "amount": 25.00,
  "purpose": "Coral Restoration"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "id": 1,
  "message": "Thank you for your generous donation!",
  "emailSent": true
}
```

---

### Legacy Donation Endpoint

For backward compatibility, submit donations without Stripe integration.

**Endpoint:** `POST /api/donate`

**Rate Limit:** 10 requests/hour per IP

**Request Body:** Same as Create Payment Intent

**Note:** This endpoint does not process payments. Use the Stripe integration above for real payments.

---

## Volunteers

### Register as Volunteer

Sign up to volunteer with OceanCare.

**Endpoint:** `POST /api/volunteer`

**Rate Limit:** 10 requests/hour per IP

**Request Body:**

```json
{
  "name": "Sarah Chen",
  "email": "sarah@example.com",
  "phone": "+1-555-0123",
  "location": "San Francisco, CA",
  "area": "beach_cleanup",
  "experience": "5 years of beach cleanup experience",
  "availability": "Weekends"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Full name (2-100 characters) |
| `email` | string | Yes | Valid email address |
| `phone` | string | No | Phone number (7+ digits) |
| `location` | string | Yes | City/region (2-100 characters) |
| `area` | string | No | Area of interest (e.g., beach_cleanup, research, education) |
| `experience` | string | No | Past experience (max 1000 characters) |
| `availability` | string | No | When you're available |

**Success Response (200):**

```json
{
  "success": true,
  "id": 42,
  "message": "Thank you for volunteering! We will contact you soon.",
  "emailSent": true
}
```

---

## Debris Reporting

### Report Ocean Debris

Report plastic, debris, or marine pollution with GPS coordinates and photos.

**Endpoint:** `POST /api/report-debris`

**Rate Limit:** 10 requests/hour per IP

**Request Body:**

```json
{
  "location": "Ocean Beach, San Francisco",
  "debrisType": "plastic",
  "quantity": 15,
  "description": "Plastic bags and bottles washed ashore",
  "latitude": 37.7597,
  "longitude": -122.4868,
  "photoBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "reporterName": "John Doe",
  "reporterEmail": "john@example.com"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `location` | string | Yes | Location description (2-200 characters) |
| `debrisType` | string | Yes | Type: plastic, plastic_bags, fishing_net, glass, metal, foam, rubber, wood, other |
| `quantity` | number | Yes | Number of items (1-10,000) |
| `description` | string | No | Additional details (max 1000 characters) |
| `latitude` | number | No | Latitude (-90 to 90) |
| `longitude` | number | No | Longitude (-180 to 180) |
| `photoBase64` | string | No | Photo as base64 (max 5MB) |
| `reporterName` | string | No | Name of person reporting |
| `reporterEmail` | string | No | Email for confirmation |

**Valid Debris Types:**

- `plastic` - General plastic debris
- `plastic_bags` - Plastic bags and film
- `fishing_net` - Fishing nets and rope
- `glass` - Glass bottles and shards
- `metal` - Metal cans and debris
- `foam` - Styrofoam and foam materials
- `rubber` - Rubber and tires
- `wood` - Wood and lumber
- `other` - Other debris types

**Success Response (200):**

```json
{
  "success": true,
  "id": 567,
  "message": "Debris report recorded. Thank you for helping protect our oceans!"
}
```

---

## Contact

### Send Contact Message

Submit a message through the contact form.

**Endpoint:** `POST /api/contact`

**Rate Limit:** 10 requests/hour per IP

**Request Body:**

```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1-555-0456",
  "subject": "Partnership Inquiry",
  "message": "We would like to discuss potential collaboration opportunities."
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Full name (2-100 characters) |
| `email` | string | Yes | Valid email address |
| `phone` | string | No | Phone number (7+ digits) |
| `subject` | string | No | Message subject (max 200 characters) |
| `message` | string | Yes | Message content (10-5000 characters) |

**Success Response (200):**

```json
{
  "success": true,
  "id": 123,
  "message": "Thank you for contacting us. We will review your message and respond within 24-48 hours.",
  "emailSent": true
}
```

---

## News & Information

### Get Ocean Conservation News

Fetch latest news about ocean conservation from GNews API.

**Endpoint:** `GET /api/news`

**Rate Limit:** 100 requests per 15 minutes

**Query Parameters:** None

**Success Response (200):**

```json
{
  "articles": [
    {
      "title": "Global Coral Restoration Hits New Milestone",
      "description": "Community-led coral nurseries restore 50,000 coral fragments across three oceans.",
      "source": "OceanCare Newsroom",
      "publishedAt": "2025-11-24T12:00:00.000Z",
      "image": "https://example.com/coral.jpg",
      "url": "https://example.com/news/coral"
    }
  ]
}
```

**Fallback Data:** If the news API is unavailable, the endpoint returns curated fallback articles.

---

## Ocean Data

### Get Ocean Conditions

Retrieve real-time weather, air quality, and ocean condition data.

**Endpoint:** `GET /api/ocean-conditions`

**Query Parameters:**

```
?latitude=37.7749
&longitude=-122.4194
```

**Success Response (200):**

```json
{
  "success": true,
  "weather": {
    "temperature": 65,
    "humidity": 75,
    "windSpeed": 12,
    "windDirection": "NW"
  },
  "airQuality": {
    "aqi": 45,
    "pm25": 12.5,
    "pm10": 25.0
  },
  "lastUpdated": "2025-11-24T12:00:00.000Z"
}
```

---

### Get Debris Reports

Retrieve all debris reports (with optional filtering).

**Endpoint:** `GET /api/debris`

**Query Parameters:**

```
?status=pending        // Filter by status (pending, cleanup_scheduled, completed)
&debrisType=plastic    // Filter by debris type
&limit=20              // Limit results (default: 50)
&offset=0              // Pagination offset
```

**Success Response (200):**

```json
{
  "success": true,
  "count": 156,
  "debris": [
    {
      "id": 567,
      "location": "Ocean Beach, San Francisco",
      "debrisType": "plastic",
      "quantity": 15,
      "latitude": 37.7597,
      "longitude": -122.4868,
      "status": "pending",
      "createdAt": "2025-11-24T10:30:00.000Z"
    }
  ]
}
```

---

## Error Handling

### Error Response Format

All errors follow this standard format:

```json
{
  "success": false,
  "message": "Description of what went wrong",
  "details": {} // Optional additional error details
}
```

### Common HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | OK | Request succeeded |
| 400 | Bad Request | Invalid input parameters |
| 401 | Unauthorized | Missing/invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 413 | Payload Too Large | File/photo too large |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

### Example Error Responses

**Invalid Email:**

```json
{
  "success": false,
  "message": "Please enter a valid email address."
}
```

**Amount Out of Range:**

```json
{
  "success": false,
  "message": "Donation amount must be between $0.50 and $1,000,000."
}
```

**Rate Limit Exceeded:**

```json
{
  "success": false,
  "message": "Too many requests to this endpoint. Please try again in an hour."
}
```

---

## Rate Limiting

### Rate Limit Rules

**General Endpoints:** 100 requests per 15 minutes per IP

**Sensitive Endpoints** (donations, volunteers, contact, debris):  
- 10 requests per hour per IP

**GET Requests:** Not rate-limited

### Rate Limit Headers

All responses include rate limit information:

```
RateLimit-Limit: 100
RateLimit-Remaining: 87
RateLimit-Reset: 1700826000
```

---

## Security

### API Security Practices

1. **HTTPS Only** (Production)
   - All requests must use HTTPS
   - HTTP requests are redirected to HTTPS

2. **CORS Protection**
   - Cross-Origin requests are restricted to approved domains
   - Preflight requests are validated

3. **Input Validation**
   - All input is validated and sanitized
   - SQL injection prevention via parameterized queries
   - XSS protection through input sanitization

4. **Rate Limiting**
   - Prevents abuse and DDoS attacks
   - Different limits for different endpoint types

5. **Security Headers**
   - X-Frame-Options: DENY (prevents clickjacking)
   - X-Content-Type-Options: nosniff
   - Content-Security-Policy: Restrictive policy
   - Strict-Transport-Security (HSTS) in production

### API Key Security

- **Never share API keys** in code, commits, or public forums
- Use environment variables for all sensitive configuration
- Rotate keys periodically
- Monitor key usage for suspicious activity

### PCI DSS Compliance

- **Card handling:** Delegated to Stripe (fully PCI-compliant)
- **No card data** stored by OceanCare servers
- **Secure payment flow** with server-side token validation

---

## Webhooks (Coming Soon)

Webhook support for real-time payment and event notifications:

- `payment_intent.succeeded`
- `customer.subscription.created`
- `customer.subscription.deleted`
- `charge.refunded`

---

## Support

**Email:** support@oceancare.org  
**Phone:** +1 (555) OCEAN-CARE  
**Documentation:** https://oceancare.org/docs  
**Status Page:** https://status.oceancare.org

---

## Changelog

### Version 1.0.0 (November 24, 2025)

- ✅ Initial release
- ✅ Stripe payment integration
- ✅ Email notification service
- ✅ JWT authentication framework
- ✅ Debris reporting with GPS
- ✅ Volunteer registration
- ✅ Contact form submissions
- ✅ Rate limiting and security middleware
- ✅ Comprehensive error handling

---

*Last updated: November 24, 2025*  
*OceanCare Initiative - Protecting oceans, one action at a time.*
