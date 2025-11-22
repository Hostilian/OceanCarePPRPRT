# OceanCare Initiative: HCI Paper Prototype

A user-centered website prototype for the "OceanCare Initiative," a non-profit dedicated to ocean protection and marine conservation. This project applies **Human-Computer Interaction (HCI) principles** to create an effective, engaging, and accessible platform for raising awareness, encouraging donations, and supporting volunteer efforts.

## Project Overview

### Purpose
This is an **interactive paper prototype** designed to validate user flows and test the effectiveness of navigation and task completion for key personas:
- **Alex** — Potential Donor (wants to donate easily)
- **Maria** — Aspiring Volunteer (wants to sign up)
- **John** — Existing Donor/Citizen (tracks donation history, reports issues)

### Core User Tasks
1. **Make a Donation** — Browse projects, use impact calculator, complete donation with thank-you confirmation
2. **Become a Volunteer** — Register for cleanup events, fill volunteer form, receive confirmation
3. **Report Marine Debris** — Submit reports about ocean pollution with location and photo

## Features Implemented

### Frontend Pages
- **Homepage** (`index.html`) — Mission statement, featured projects, impact statistics, news, CTAs
- **Projects** (`pages/projects.html`) — Showcase of conservation work (coral restoration, marine life protection, cleanup, research)
- **How to Help / Donation** (`pages/how-to-help.html`) — Donation form with interactive **impact calculator** showing real-time donation effects
- **Volunteer Signup** (`pages/volunteer.html`) — Multi-field form with experience level, availability, interest area
- **Debris Reporting** (`pages/debris.html`) — Report marine debris with location, type, description, and photo upload
- **Team** (`pages/team.html`) — Leadership and team information
- **Donor Login/Dashboard** (`pages/login.html`) — Login, donation history, impact summary
- **Contact** (`pages/contact.html`) — Contact form and organization details

### Backend Functionality (Node.js + Express + SQLite)

**API Endpoints:**
- `GET /api/news` — Fetch ocean conservation news (GNews API integration)
- `POST /api/donate` — Process donations with donor tracking
- `POST /api/volunteer` — Register volunteers with detailed information
- `POST /api/report-debris` — Submit marine debris reports
- `POST /api/contact` — Contact form submission
- `POST /api/donor-login` — Authenticate donors
- `GET /api/donor/:email` — Retrieve donor dashboard data

**Database (SQLite):**
- `users` — Registered donors and volunteers
- `donations` — Donation history with amounts, purposes, dates
- `volunteers` — Volunteer applications with interests, experience, location
- `debris_reports` — Marine debris reports with locations and types
- `contact_messages` — Contact form submissions

## Technology Stack

### Frontend
- **HTML5** — Semantic markup for accessibility
- **CSS3** — Glassmorphism design, responsive grid layouts, animations
- **Vanilla JavaScript** — Form handling, API calls, localStorage for session management

### Backend
- **Node.js** — Runtime environment
- **Express.js** — Web server framework
- **SQLite3** — Lightweight, file-based database
- **node-fetch** — HTTP client for news API integration

### Design System
- **Color Scheme** — Ocean blue (#0077BE), teal (#00A8CC), sand/gold (#FDD835)
- **Typography** — Segoe UI, Roboto (system fonts for performance)
- **Layout** — CSS Grid & Flexbox for responsive design
- **Accessibility** — WCAG-compliant forms, semantic HTML, high contrast text

## Setup & Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Installation Steps

```bash
# Clone or navigate to the project directory
cd OceanCarePPRPRT

# Install dependencies
npm install

# Create .env file (optional for news API)
echo "GNEWS_API_KEY=your_api_key_here" > .env

# Start the server
npm start
```

The application will be available at `http://localhost:3000`

## HCI Design Principles Applied

### 1. **User-Centered Design**
- Each page supports specific user personas (donor, volunteer, citizen)
- Clear navigation hierarchy with CTAs aligned to user goals
- Confirmation pages provide immediate feedback for task completion

### 2. **Simplicity & Clarity**
- Minimal form fields focused on essential information
- Impact calculator shows immediate, tangible results of donations
- Single-action focus per page (one primary CTA)

### 3. **Accessibility**
- Semantic HTML structure
- High contrast color ratios for readability
- Responsive design for mobile users
- Form validation with clear error messages

### 4. **Feedback & Confirmation**
- Modals show thank-you messages after donation
- Confirmation alerts for volunteer applications
- Success messages for debris reports
- Dashboard displays donation history and impact metrics

### 5. **Trust & Transparency**
- Mission statement visible on homepage
- Impact metrics (acres protected, volunteers, funds raised)
- Team page builds credibility
- Contact information easily accessible

## User Flow Examples

### Alex (Potential Donor)
1. Lands on homepage → reads mission
2. Clicks "Make a Donation" → reviews projects
3. Enters donation amount → watches impact calculator update in real-time
4. Completes form → receives thank-you confirmation
5. Can login later to view donation history

### Maria (Aspiring Volunteer)
1. Scrolls homepage → sees "Become a Volunteer" button
2. Clicks button → views volunteer opportunities
3. Fills out form (name, email, location, interest area, availability)
4. Submits → sees confirmation modal
5. Receives acknowledgment email with next steps

### John (Existing Donor/Citizen)
1. Logs into dashboard with email
2. Views total donations and impact metrics
3. Sees donation history with dates and amounts
4. Reports marine debris spotted near his location
5. Can make additional donations from dashboard

## API Examples

### Make a Donation
```bash
POST /api/donate
Content-Type: application/json

{
  "donorName": "Jane Smith",
  "donorEmail": "jane@example.com",
  "amount": 100,
  "purpose": "coral"
}
```

### Register as Volunteer
```bash
POST /api/volunteer
Content-Type: application/json

{
  "volunteerName": "Maria Garcia",
  "volunteerEmail": "maria@example.com",
  "volunteerPhone": "(555) 123-4567",
  "volunteerLocation": "Los Angeles, CA",
  "interestArea": "cleanup",
  "experience": "beginner",
  "availability": "monthly",
  "motivation": "I love the ocean and want to help protect it"
}
```

### Report Marine Debris
```bash
POST /api/report-debris
Content-Type: application/json

{
  "reporterName": "John Doe",
  "reporterEmail": "john@example.com",
  "debrisLocation": "Santa Monica Beach, 34.0195° N, 118.4912° W",
  "debrisType": "plastic",
  "debrisDescription": "Large area of plastic bags and bottles",
  "reportDate": "2025-11-22"
}
```

## Project Files Structure

```
OceanCarePPRPRT/
├── index.html                 # Homepage
├── pages/
│   ├── projects.html         # Project showcase
│   ├── how-to-help.html      # Donation page with calculator
│   ├── volunteer.html        # Volunteer signup
│   ├── debris.html           # Debris reporting
│   ├── team.html             # Team information
│   ├── login.html            # Donor dashboard
│   ├── contact.html          # Contact form
├── server.js                 # Express server + API endpoints
├── package.json              # Dependencies
├── .env                      # Environment variables (optional)
├── README.md                 # This file
└── PROJECT_SUMMARY.md        # HCI course project documentation
```

## Running Tests

```bash
npm test
```

Currently includes basic tests for the donation and volunteer endpoints.

## Extending the Prototype

### To Add Email Confirmations
Install nodemailer and configure SMTP:
```bash
npm install nodemailer
```

### To Enable Payment Processing
Integrate Stripe or PayPal for real donations:
```bash
npm install stripe
```

### To Add Database Persistence
Switch to PostgreSQL or MongoDB:
```bash
npm install pg  # or mongodb
```

## Accessibility & Performance

- **Lighthouse Score Target:** 90+
- **Mobile Responsive:** Tested on screens from 320px to 2560px
- **Form Validation:** Real-time client-side + server-side validation
- **Error Handling:** User-friendly messages for all error states
- **Loading States:** Visual feedback during API calls

## Environmental Notes

This prototype uses mock data for news when the GNews API key is not configured. For production:
1. Obtain a GNews API key from https://gnews.io
2. Add to `.env` file as `GNEWS_API_KEY=your_key`

## Future Enhancements

1. **Email Notifications** — Send confirmations to donors and volunteers
2. **Admin Dashboard** — Manage volunteers, donations, and reports
3. **Data Export** — Export impact reports and donation summaries
4. **Multi-language Support** — Reach global audience
5. **Social Sharing** — Let users share their impact on social media
6. **Advanced Analytics** — Track user behavior and donation patterns

## Support & Contact

For questions or feedback about this HCI prototype:
- Email: info@oceancare.org
- Phone: (555) 123-4567

---

**OceanCare Initiative** — Protecting our oceans, one action at a time. 🌊
