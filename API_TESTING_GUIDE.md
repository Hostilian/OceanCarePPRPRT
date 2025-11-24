# OceanCare API Testing Guide

## Overview

This guide provides detailed instructions for testing all OceanCare API endpoints, including expected responses, error cases, and validation rules.

## API Base URL

```
http://localhost:3000
```

## Authentication

Most endpoints require JWT token in Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

To get a token:
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

---

## Contact & Communication Endpoints

### POST /api/contact
Submit a contact form inquiry.

**Request:**
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Partnership Inquiry",
    "message": "I would like to discuss a partnership opportunity."
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "messageId": 123,
  "message": "Thank you for contacting OceanCare. We'll get back to you soon."
}
```

**Validation Rules:**
- `name`: Required, string, 2-100 characters
- `email`: Required, valid email format
- `subject`: Required, string, 3-200 characters
- `message`: Required, string, minimum 10 characters

**Error Cases:**

Missing field (400):
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com"}'

# Response:
{
  "success": false,
  "error": "Missing required fields: subject, message"
}
```

Invalid email (400):
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "email": "invalid-email",
    "subject": "Test",
    "message": "Test message content"
  }'

# Response:
{
  "success": false,
  "error": "Invalid email format"
}
```

---

## Volunteer Management

### POST /api/volunteer
Register as a volunteer.

**Request:**
```bash
curl -X POST http://localhost:3000/api/volunteer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "555-0123",
    "experience": "intermediate",
    "availability": ["weekends", "evenings"],
    "location": "California",
    "bio": "Marine biologist with 5 years experience"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "volunteerId": 456,
  "message": "Welcome to OceanCare! Check your email for next steps."
}
```

**Validation Rules:**
- `name`: Required, string, 2-100 characters
- `email`: Required, unique, valid email
- `phone`: Required, 10+ digits
- `experience`: Required, enum: beginner|intermediate|advanced
- `availability`: Required, array of strings
- `location`: Required, string, 2-100 characters

**Error Cases:**

Duplicate email (400):
```bash
{
  "success": false,
  "error": "Email already registered as volunteer"
}
```

Invalid experience level (400):
```bash
{
  "success": false,
  "error": "Invalid experience level. Must be: beginner, intermediate, or advanced"
}
```

### GET /api/volunteers (Admin Only)
List all volunteers with pagination.

**Request:**
```bash
curl -X GET "http://localhost:3000/api/volunteers?page=1&limit=10" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "volunteers": [
    {
      "id": 456,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "experience": "intermediate",
      "status": "approved",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 145,
  "page": 1,
  "totalPages": 15
}
```

---

## Debris Reporting

### POST /api/report-debris
Report ocean debris location.

**Request:**
```bash
curl -X POST http://localhost:3000/api/report-debris \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tom Reporter",
    "email": "tom@example.com",
    "description": "Large pile of plastic bags and fishing nets",
    "location": "Malibu Beach, CA",
    "latitude": 34.0195,
    "longitude": -118.6814,
    "photo_url": "https://example.com/debris.jpg",
    "debris_type": "plastic",
    "severity": "high"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "reportId": 789,
  "message": "Thank you for reporting! Your contribution helps protect our oceans."
}
```

**Validation Rules:**
- `name`: Required, string, 2-100 characters
- `email`: Required, valid email
- `description`: Required, string, minimum 20 characters
- `location`: Required, string, 5-200 characters
- `latitude`: Required, number, range -90 to 90
- `longitude`: Required, number, range -180 to 180
- `debris_type`: Optional, enum: plastic|metal|glass|rope|other
- `severity`: Optional, enum: low|medium|high|critical

**Error Cases:**

Invalid coordinates (400):
```bash
{
  "success": false,
  "error": "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180"
}
```

Missing description (400):
```bash
{
  "success": false,
  "error": "Description must be at least 20 characters long"
}
```

### GET /api/debris-reports
Get debris reports by location (with optional filters).

**Request:**
```bash
curl -X GET "http://localhost:3000/api/debris-reports?latitude=34.0195&longitude=-118.6814&radius=50" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "reports": [
    {
      "id": 789,
      "name": "Tom Reporter",
      "description": "Large pile of plastic bags",
      "location": "Malibu Beach, CA",
      "latitude": 34.0195,
      "longitude": -118.6814,
      "debris_type": "plastic",
      "severity": "high",
      "status": "open",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 23
}
```

---

## Donation Processing

### POST /api/donate
Submit a donation.

**Request:**
```bash
curl -X POST http://localhost:3000/api/donate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Generous Donor",
    "email": "donor@example.com",
    "amount": 50,
    "purpose": "ocean_cleanup",
    "message": "Keep up the great work!",
    "payment_method": "card",
    "recurring": false
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "donationId": 1001,
  "amount": 50,
  "currency": "USD",
  "status": "completed",
  "receiptUrl": "https://example.com/receipt/1001",
  "message": "Thank you for your generous donation!"
}
```

**Validation Rules:**
- `name`: Required, string, 2-100 characters
- `email`: Required, valid email
- `amount`: Required, number, minimum 1
- `purpose`: Required, enum: ocean_cleanup|coral_restoration|marine_wildlife|research|education
- `payment_method`: Required, enum: card|bank|paypal
- `recurring`: Optional, boolean (default false)

**Error Cases:**

Invalid amount (400):
```bash
{
  "success": false,
  "error": "Donation amount must be at least $1.00"
}
```

Payment failed (400):
```bash
{
  "success": false,
  "error": "Payment processing failed. Please check your payment method and try again."
}
```

### GET /api/donations (Admin Only)
List all donations with filtering.

**Request:**
```bash
curl -X GET "http://localhost:3000/api/donations?status=completed&limit=20" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "donations": [
    {
      "id": 1001,
      "donor_name": "Generous Donor",
      "amount": 50,
      "purpose": "ocean_cleanup",
      "status": "completed",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 342,
  "totalAmount": 12540.50
}
```

---

## Environmental Data Endpoints

### GET /api/weather
Get current weather data for location.

**Request:**
```bash
curl -X GET "http://localhost:3000/api/weather?latitude=34.0195&longitude=-118.6814"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "temperature": 72,
    "humidity": 65,
    "wind_speed": 12,
    "description": "Partly cloudy",
    "feels_like": 70,
    "visibility": 10
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Parameters:**
- `latitude`: Required, number (-90 to 90)
- `longitude`: Required, number (-180 to 180)

### GET /api/uv-index
Get UV index and health recommendations.

**Request:**
```bash
curl -X GET "http://localhost:3000/api/uv-index?latitude=34.0195&longitude=-118.6814"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "uv_index": 7,
    "warning_level": "high",
    "recommendations": [
      "Wear SPF 30+ sunscreen",
      "Limit sun exposure 10am-4pm",
      "Wear protective clothing",
      "Seek shade when possible"
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Warning Levels:**
- `safe` (UV 0-2): No protection required
- `moderate` (UV 3-5): Use sunscreen
- `high` (UV 6-7): Limit exposure
- `very_high` (UV 8+): Avoid sun, wear protection

### GET /api/air-quality
Get air quality index and health warnings.

**Request:**
```bash
curl -X GET "http://localhost:3000/api/air-quality?latitude=34.0195&longitude=-118.6814"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "aqi": 89,
    "health_status": "moderate",
    "pollutants": {
      "pm25": 45,
      "pm10": 78,
      "o3": 52,
      "no2": 34
    },
    "recommendations": [
      "Sensitive groups should limit outdoor activity",
      "Keep windows closed during peak traffic"
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Health Status Levels:**
- `good` (0-50)
- `moderate` (51-100)
- `unhealthy_sensitive` (101-150)
- `unhealthy` (151-200)
- `very_unhealthy` (201-300)
- `hazardous` (301+)

### GET /api/ocean-conditions
Get comprehensive ocean conditions.

**Request:**
```bash
curl -X GET "http://localhost:3000/api/ocean-conditions?latitude=34.0195&longitude=-118.6814"
```

**Response (200 OK):**
```json
{
  "success": true,
  "weather": {
    "temperature": 72,
    "wind_speed": 12,
    "description": "Partly cloudy"
  },
  "water": {
    "temperature": 68,
    "swell_height": 4,
    "wave_period": 12,
    "tide": "incoming"
  },
  "quality": {
    "water_quality": "good",
    "visibility": 30,
    "pollution_level": "low"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### GET /api/debris-heatmap
Get debris hotspot visualization data.

**Request:**
```bash
curl -X GET "http://localhost:3000/api/debris-heatmap?latitude=34.0195&longitude=-118.6814&radius=50"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "hotspots": [
      {
        "latitude": 34.0195,
        "longitude": -118.6814,
        "intensity": 85,
        "type": "plastic",
        "reports": 12,
        "severity": "high"
      }
    ],
    "total_reports": 45,
    "coverage_area": 78.5
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Parameters:**
- `latitude`: Required, number
- `longitude`: Required, number
- `radius`: Optional, number (default 50km)

### GET /api/climate-data
Get 90-day climate trends.

**Request:**
```bash
curl -X GET "http://localhost:3000/api/climate-data?latitude=34.0195&longitude=-118.6814"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "avg_temp": 68.5,
    "max_temp": 75,
    "min_temp": 62,
    "temperature_trend": "increasing",
    "total_precipitation": 2.5,
    "rainy_days": 8,
    "precipitation_trend": "decreasing",
    "period_days": 90
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## News & Information

### GET /api/news
Get latest ocean conservation news.

**Request:**
```bash
curl -X GET "http://localhost:3000/api/news?limit=5&page=1"
```

**Response (200 OK):**
```json
{
  "success": true,
  "articles": [
    {
      "id": 1,
      "title": "New Coral Protection Initiative Launched",
      "summary": "Global effort to protect 30% of world's coral reefs",
      "source": "Ocean News Network",
      "url": "https://example.com/news/1",
      "image": "https://example.com/image.jpg",
      "publishedAt": "2024-01-15T08:00:00Z"
    }
  ],
  "total": 342,
  "page": 1,
  "limit": 5
}
```

---

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Missing required field: email"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "You do not have permission to access this resource"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**429 Too Many Requests:**
```json
{
  "success": false,
  "error": "Rate limit exceeded. Please try again later."
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error. Please try again later."
}
```

---

## Rate Limiting

- General endpoints: 100 requests per 15 minutes per IP
- Sensitive endpoints (donate, report): 10 requests per 15 minutes per IP
- Returns `429 Too Many Requests` when limit exceeded

---

## Testing Tools

### Using curl
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com",...}'
```

### Using Postman
1. Import collection from `postman_collection.json`
2. Set base URL to `http://localhost:3000`
3. Add auth tokens to environment variables
4. Run requests from collection

### Using Thunder Client (VS Code)
1. Install Thunder Client extension
2. Import collection
3. Test endpoints

---

## Test Data

Pre-made test data available at:
```
docs/TEST_DATA.md
```

---

**Last Updated**: 2024-01-15
**API Version**: 1.0.0
