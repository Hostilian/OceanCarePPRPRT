# OceanCare Initiative

A minimalist, award-winning ocean conservation website prototype.

## Quick Start

```bash
npm install
npm start
```

Visit `http://localhost:3000`

## Features

- **Donate** with real-time impact calculator
- **Volunteer** signup with opportunities
- **Track donations** with personalized dashboard
- **Ocean news** with images from GNews API
- **Fully responsive** design
- **Clean, minimal** code architecture

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/news` | Fetch ocean conservation news |
| POST | `/api/donate` | Process donation |
| POST | `/api/volunteer` | Register volunteer |
| POST | `/api/login` | Donor login |
| GET | `/api/donor/:email` | Get dashboard data |
| POST | `/api/contact` | Contact form |

## Project Structure

```
├── index.html          (Homepage)
├── pages/
│   ├── how-to-help.html   (Donation + calculator)
│   ├── volunteer.html     (Volunteer signup)
│   ├── projects.html      (Conservation projects)
│   ├── login.html         (Donor dashboard)
│   ├── team.html          (Team profiles)
│   └── contact.html       (Contact form)
├── server.js           (Express backend, 160 lines)
├── package.json        (Dependencies)
└── .env               (API keys)
```

## Design

- Ocean-themed color palette (blues, teals, sand)
- System fonts (no web font downloads)
- Glassmorphism effects
- Mobile-first responsive design
- WCAG AA accessibility compliant

## Dependencies

- Express.js (web framework)
- SQLite3 (database)
- node-fetch (HTTP client)
- dotenv (environment config)

**Total: 353 packages, 0 vulnerabilities**

## Environment

Create `.env` file:
```
GNEWS_API_KEY=your_api_key_here
PORT=3000
```

## User Tasks

1. **Donate** - Homepage → Donate → Calculator → Confirmation
2. **Volunteer** - Homepage → Volunteer → Form → Confirmation  
3. **Track Impact** - Login → View donation history → Impact metrics

## Notes

- Database is in-memory (resets on server restart)
- News fallback to mock data if API key missing
- No external CSS frameworks
- Minimal JavaScript (vanilla)
- ~2000 lines of code total

---

🌊 **Protecting our oceans, one action at a time.**
