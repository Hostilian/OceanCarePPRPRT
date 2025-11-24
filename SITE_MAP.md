# OceanCare Initiative - Complete Site Map & Quick Guide

## 🌊 Website Structure

### **Main Pages**

#### 1. **Homepage** (`/`)
- Entry point for all users
- Hero section with CTA buttons
- Mission and values overview
- "How It Works" section (3 main actions)
- Impact statistics section
- Verified impact metrics
- Donor and volunteer testimonials
- "API Tools" showcase section (NEW)
- Link to all major sections
- **Key CTAs**: Volunteer, Donate, Report Debris

#### 2. **Donation Page** (`/pages/contact.html`)
- Impact calculator with preset amounts ($25-$1000)
- Custom donation amount input
- Donation form with validation:
  - Full name (required)
  - Email (required, validated)
  - Amount (required, min $1)
  - Focus area (dropdown)
  - Payment method (dropdown)
  - Recurring donation checkbox
  - Anonymous donation checkbox
- Form validation with real-time feedback
- Toast notifications for errors/success
- **Redirects to**: `/pages/donation-success.html?amount=XXX` on success
- Data saved to localStorage for dashboard

#### 3. **Donation Success Page** (`/pages/donation-success.html`)
- Celebratory success message with animation
- Tax receipt information
- **Dynamic impact metrics**:
  - Coral fragments planted (based on amount × 0.28)
  - Marine species protected (based on amount × 0.06)
  - Plastic removed in kg (based on amount × 0.2)
  - Students educated (based on amount × 0.04)
- 4-step "What Happens Next" process
- FAQ section (expandable)
- CTAs: Download receipt, Share, View dashboard
- Reads donor data from localStorage
- Query param: `?amount=250` for dynamic calculation

#### 4. **Donor Dashboard** (`/pages/dashboard.html`)
- Personal profile information
- **Quick stats cards**:
  - Total donated ($2,500 sample)
  - Number of donations (8 sample)
  - Corals planted (500+ calculated)
  - Animals protected (150+ calculated)
- **Donation history table**:
  - Date, amount, focus area, status, receipt link
  - 8 sample donations displayed
- **Sidebar components**:
  - Profile card (name, email, join date)
  - Impact goal tracker (50% complete to $5k goal)
  - Quick action buttons (Donate, Download, Volunteer)
- **Impact breakdown**:
  - Coral restoration (35%)
  - Coastal cleanup (40%)
  - Education (25%)
- **Recent activity** feed (4 latest updates)
- Edit profile button (shows toast: "Coming soon")
- Download receipts button (triggers download UX)

#### 5. **Volunteer Form** (`/pages/volunteer.html`)
- Signup form for volunteers
- Fields: name, email, experience, activities, frequency
- Form validation with real-time feedback
- Loading spinner during submission
- Toast notifications for success/error
- Responsive grid layout

#### 6. **Debris Report Form** (`/pages/report-debris.html`)
- Report marine debris with GPS
- Fields: location, GPS coords (with validation), photo upload, description
- "Get My Location" button (uses browser geolocation)
- Manual coordinate input
- Form validation (GPS format check)
- Toast notifications with error recovery
- Loading states during submission

#### 7. **Ocean Conditions Monitor** (`/pages/ocean-conditions.html`)
- **Purpose**: Real-time weather and ocean data for planning activities
- **Location Search**:
  - Search by place name (uses Nominatim API)
  - Manual latitude/longitude input
  - "Use My Location" button (browser GPS)
- **Current Conditions Display**:
  - Temperature, wave height, wind speed, humidity
  - Large emoji icons for each metric
  - 7-day forecast grid
- **Activity Recommendations**:
  - Suitability scoring for different ocean activities
  - Based on current conditions
- **Detailed Metrics Cards**:
  - Temperature trends
  - Wave analysis
  - Wind conditions
  - Pressure and humidity
- **APIs Used**: Open-Meteo (weather), Nominatim (geocoding)

#### 8. **Ocean News Feed** (`/pages/ocean-news.html`)
- **Purpose**: Global ocean conservation news aggregation
- **Category Filters**:
  - All news
  - Coral restoration
  - Plastic pollution
  - Marine life
  - Policy & conservation
- **News Cards** (up to 9):
  - Headline
  - Description
  - Publication date (relative: "2d ago")
  - Source attribution
  - "Read More" link (external)
- **Newsletter Subscription Form**:
  - Email input
  - Subscribe button
- **Features**:
  - Auto-categorization of articles by topic
  - Real-time data from GNews API
- **API Used**: GNews API

#### 9. **Debris Visualization Map** (`/pages/debris-map.html`)
- **Purpose**: Interactive map of reported marine debris
- **Map**:
  - Leaflet.js with OpenStreetMap tiles
  - World view, zoomable/pannable
  - Debris report markers with popups
- **Filter Controls**:
  - By debris type: plastic, fishing nets, glass, foam, other
  - By size: small, medium, large
- **Sidebar**:
  - Live statistics (active reports count)
  - Type filter dropdown
  - Size filter dropdown
  - Legend with emoji icons
  - "Report Debris" CTA button
- **Recent Reports Table**:
  - Top 10 reports filtered by current filters
  - Columns: date, location, type, quantity
- **Global Impact Cards**:
  - Total weight tracked
  - Countries involved
  - Scheduled cleanups
  - Active volunteers
- **Sample Data**: 5 example reports (fallback if API down)

#### 10. **Projects Page** (`/pages/projects.html`)
- Project listings and descriptions
- (Maintained from original site)

#### 11. **Team Page** (`/pages/team.html`)
- Team member profiles
- Leadership information
- (Maintained from original site)

### **Error Pages**

#### **404 Not Found** (`/404.html`)
- Professional not-found page
- Helpful message
- Navigation buttons (Home, Projects, Volunteer)
- Links to major sections
- Footer with contact info

#### **500 Server Error** (`/500.html`)
- Server error page with recovery suggestions
- Retry button
- Links to main sections
- Contact support info

### **Support Pages**

- Login (`/pages/login.html`) - Placeholder for auth system
- How to Help (`/pages/how-to-help.html`) - Action guide

---

## 🔧 Feature Reference

### **Form Validation** (FormValidator class)
- **Location**: `/js/form-validator.js`
- **Methods**:
  - `validateField(input)` - Real-time validation
  - `setFieldError(input, message)` - Show error
  - `clearFieldError(input)` - Clear error
  - `validateForm()` - Validate all fields
  - `reset()` - Clear all errors
- **Rules**:
  - Required field check
  - Email format (regex)
  - Phone format (10+ digits)
  - Number min/max
  - Password strength (8+ chars)
- **Applied to**: Donation, Volunteer, Debris Report forms

### **Toast Notifications** (Toast class)
- **Location**: `/js/toast.js`
- **Types**: success, error, info, warning
- **Methods**:
  - `toast.success(message, duration)` - Green toast (3s default)
  - `toast.error(message, duration)` - Red toast (5s default)
  - `toast.info(message, duration)` - Blue toast (3s default)
  - `toast.warning(message, duration)` - Yellow toast (4s default)
- **Features**: Auto-dismiss, close button, stacking, animations

### **Loading States**
- **Helper Function**: `setFormLoading(form, isLoading)`
- **Effects**:
  - Shows spinner animation
  - Disables all form buttons
  - Reduces form opacity
  - Changes button text to "Submitting..."
- **Usage**: During form submission to prevent double-submit

---

## 🎯 Key Flows

### **Donation Flow**
1. User arrives at homepage
2. Clicks "Make a Donation" button
3. Lands on `/pages/contact.html`
4. Enters donation details + selects amount
5. Form validates in real-time
6. Clicks "Complete Donation"
7. Loading spinner appears
8. Form submits to `/api/donate`
9. Success toast notification
10. **Redirects to** `/pages/donation-success.html?amount=250`
11. Shows impact metrics based on amount
12. User can view dashboard, download receipt, or share

### **Volunteer Flow**
1. User clicks "Volunteer Now"
2. Lands on `/pages/volunteer.html`
3. Fills volunteer form
4. Real-time validation provides feedback
5. Submits form to `/api/volunteer`
6. Toast notification confirms
7. Form resets for next volunteer

### **Debris Report Flow**
1. User clicks "Report Debris"
2. Lands on `/pages/report-debris.html`
3. Enters location or clicks "Get My Location"
4. Browser requests GPS permission
5. Coordinates auto-filled
6. User uploads photo and description
7. Form validates GPS coordinates
8. Submits to `/api/debris-reports`
9. Toast confirms submission
10. Data appears on debris map

### **Weather Check Flow**
1. User visits `/pages/ocean-conditions.html`
2. Enters location name or GPS coordinates
3. Clicks search
4. Real-time weather loads from Open-Meteo
5. 7-day forecast displays
6. Activity recommendations calculated
7. Detailed metrics shown

### **News Browse Flow**
1. User visits `/pages/ocean-news.html`
2. Sees latest marine news articles
3. Clicks category filter (e.g., "Coral Restoration")
4. Articles auto-filter
5. Clicks "Read More" on article
6. Opens external news link

### **Impact Dashboard Flow**
1. User makes donation
2. Lands on success page
3. Clicks "View Donor Dashboard"
4. Sees personalized dashboard
5. Views donation history
6. Checks impact metrics
7. Sets donation goal
8. Downloads receipts

---

## 📊 Database Schema

### **Donations Table**
```sql
CREATE TABLE donations (
  id INTEGER PRIMARY KEY,
  name TEXT,
  email TEXT,
  amount REAL,
  focus TEXT,
  payment_method TEXT,
  recurring BOOLEAN,
  anonymous BOOLEAN,
  date TIMESTAMP,
  status TEXT
)
```

### **Volunteers Table**
```sql
CREATE TABLE volunteers (
  id INTEGER PRIMARY KEY,
  name TEXT,
  email TEXT,
  experience TEXT,
  activities TEXT,
  frequency TEXT,
  date TIMESTAMP
)
```

### **Debris Reports Table**
```sql
CREATE TABLE debris_reports (
  id INTEGER PRIMARY KEY,
  location TEXT,
  latitude REAL,
  longitude REAL,
  type TEXT,
  quantity TEXT,
  description TEXT,
  date TIMESTAMP
)
```

### **Contact Messages Table**
```sql
CREATE TABLE contact_messages (
  id INTEGER PRIMARY KEY,
  name TEXT,
  email TEXT,
  message TEXT,
  date TIMESTAMP
)
```

---

## 🔌 API Endpoints

### **Donation API**
- `POST /api/donate` - Submit donation
- `GET /api/donation-impact` - Calculate impact metrics

### **Volunteer API**
- `POST /api/volunteer` - Submit volunteer form
- `GET /api/volunteer-stats` - Get volunteer statistics

### **Debris Report API**
- `POST /api/debris-reports` - Submit debris report
- `GET /api/debris-reports` - Get all debris reports
- `GET /api/debris-reports/:id` - Get specific report

### **Weather API**
- `GET /api/weather?lat=X&lon=Y` - Get weather for coordinates
- `GET /api/geocode?location=NAME` - Geocode location name

### **News API**
- `GET /api/news` - Get latest news articles
- `GET /api/news?category=CATEGORY` - Get news by category

### **Contact API**
- `POST /api/contact` - Submit contact form

### **Stats API**
- `GET /api/stats` - Get global impact statistics
- `GET /api/donor-stats` - Get donor dashboard data

---

## 🎨 Styling System

### **Colors**
- Primary: `#003d5c` (Navy)
- Secondary: `#2d5a6b` (Slate Blue)
- Accent: `#d97b34` (Ocean Rust)
- Success: `#28a745` (Green)
- Error: `#dc3545` (Red)
- Neutral Light: `#f5f7fa`

### **Spacing Scale** (8px base)
- space-0 through space-24 (0px to 96px)
- Use variables like `var(--space-4)` for consistency

### **Typography**
- Headings: Georgia/Garamond (serif)
- Body: System sans-serif (Arial, Helvetica)
- Monospace: For code/data

### **Shadows**
- sm, md, lg, xl, 2xl (5 levels)

### **Border Radius**
- xs (2px), sm (4px), base (8px), lg (12px), xl (16px)

### **Transitions**
- 150ms, 200ms, 300ms (for animations)

---

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 768px
- **Desktop**: > 768px

All pages use responsive grids that collapse from 3+ columns on desktop to 1 column on mobile.

---

## ✅ Testing Checklist

- [ ] All forms submit and validate
- [ ] Toast notifications appear correctly
- [ ] Donation redirects to success page
- [ ] Dashboard loads sample data
- [ ] Maps display correctly
- [ ] News feeds load articles
- [ ] Weather data displays
- [ ] Mobile layouts render properly
- [ ] Navigation links work
- [ ] Error pages display (404, 500)
- [ ] External links open in new tabs

---

## 🚀 Launch Commands

```bash
# Start server
node src/server.js

# Or with npm
npm start

# Test individual pages
curl http://localhost:3000/pages/contact.html
curl http://localhost:3000/pages/dashboard.html
curl http://localhost:3000/pages/donation-success.html

# View logs
tail -f logs/server.log
```

---

## 📞 Quick Reference

| Page | URL | Purpose |
|------|-----|---------|
| Home | `/` | Landing page with CTAs |
| Donate | `/pages/contact.html` | Donation form + impact calc |
| Volunteer | `/pages/volunteer.html` | Volunteer signup |
| Report Debris | `/pages/report-debris.html` | GPS-based debris reporting |
| Conditions | `/pages/ocean-conditions.html` | Real-time weather data |
| News | `/pages/ocean-news.html` | Marine news aggregation |
| Debris Map | `/pages/debris-map.html` | Interactive debris visualization |
| Dashboard | `/pages/dashboard.html` | Donor impact tracking |
| Success | `/pages/donation-success.html` | Post-donation confirmation |
| Projects | `/pages/projects.html` | Project listings |
| Team | `/pages/team.html` | Team information |
| 404 | `/404.html` | Not found page |
| 500 | `/500.html` | Server error page |

---

*Last Updated: November 2025*  
*OceanCare Initiative | 95% Publication Ready*
