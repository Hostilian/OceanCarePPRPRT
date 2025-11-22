# OceanCare Initiative: Paper Prototype Presentation

## 1. Introduction

**Client:** OceanCare Initiative

**Project Goal:** To create a compelling online presence for the OceanCare Initiative, a non-profit organization dedicated to protecting the world's oceans. The primary goals of the website are to raise awareness about ocean conservation issues, showcase the organization's work, and encourage user engagement through donations and volunteering.

**Prototype Overview:** This document outlines the structure, functionality, and design rationale of the OceanCare Initiative website paper prototype. This prototype is a collection of interconnected HTML pages that simulate the user experience and demonstrate how the website meets the project requirements.

---

## 2. Target Audience (Personas)

To guide the design process, we've identified two primary user personas:

### Persona 1: The Potential Donor

*   **Name:** Alex Chen
*   **Age:** 35
*   **Occupation:** Software Engineer
*   **Bio:** Alex is environmentally conscious and is looking for a reputable organization to support financially. They have a busy schedule and need a quick and easy way to understand the organization's impact and make a donation.
*   **Goals:**
    *   Quickly understand the mission and impact of OceanCare.
    *   Find transparent information about the projects they can support.
    *   Make a secure and easy online donation.
    *   Track their donation history.

### Persona 2: The Aspiring Volunteer

*   **Name:** Maria Garcia
*   **Age:** 22
*   **Occupation:** University Student
*   **Bio:** Maria is passionate about marine life and wants to get actively involved in ocean conservation. She is looking for opportunities to volunteer, either in person or remotely.
*   **Goals:**
    *   Learn about the different ways she can contribute.
    *   Find volunteer opportunities that match her skills and interests.
    *   Easily sign up to become a volunteer.

---

## 3. User Scenarios (User Flow)

### Scenario 1: Making a Donation (Alex's Journey)

1.  **Landing:** Alex arrives at the **Homepage (`index.html`)**. They are greeted with a powerful hero image and a clear mission statement.
2.  **Exploration:** Alex scrolls down to the **"Latest News"** section to see the organization's recent activities. Intrigued, they navigate to the **"Projects"** page (`projects.html`) to see the core initiatives.
3.  **Decision:** Impressed by the "Coral Reef Restoration" project, Alex decides to donate. They click on the **"How to Help"** page (`how-to-help.html`).
4.  **Donation:** On the "How to Help" page, Alex interacts with the **"Donation Calculator"**. They use the slider to select a donation amount and see a description of the impact their contribution will have. They click "Donate Now".
5.  **Post-Donation:** After a simulated donation, Alex creates an account and can log in to their **"Dashboard"** (`dashboard.html`) to see their donation history.

### Scenario 2: Becoming a Volunteer (Maria's Journey)

1.  **Landing:** Maria lands on the **Homepage (`index.html`)** and is inspired by the organization's mission.
2.  **Exploration:** She explores the **"How to Help"** page (`how-to-help.html`) and sees the "Become a Volunteer" section.
3.  **Sign-up:** She clicks the link and is taken to the **"Volunteer"** page (`volunteer.html`).
4.  **Application:** Maria fills out the volunteer application form, selecting her areas of interest (e.g., "Online Advocacy" and "Research Support"). She submits the form.
5.  **Feedback:** The website provides instant feedback, confirming that her application has been received.

---

## 4. Prototype Description (Screen by Screen)

### 1. Homepage (`index.html`)

*   **Purpose:** To create a strong first impression, communicate the organization's mission, and provide a gateway to other sections of the site.
*   **Features:**
    *   **Hero Section:** A full-screen image with a compelling headline.
    *   **Mission Statement:** A clear and concise description of the organization's purpose.
    *   **Latest News:** A dynamically populated section with recent news articles related to ocean conservation (powered by the GNews API).
    *   **Navigation:** A clear and consistent navigation bar with links to all major sections.

### 2. Projects (`projects.html`)

*   **Purpose:** To showcase the core projects of the OceanCare Initiative.
*   **Features:**
    *   A grid of project cards, each with an image, title, and brief description.
    *   "Learn More" links on each card (intended to lead to detailed project pages in a full build).

### 3. Our Team (`team.html`)

*   **Purpose:** To build trust and transparency by introducing the key people behind the organization.
*   **Features:**
    *   Profiles of team members with their photos, roles, and short bios.

### 4. How to Help (`how-to-help.html`)

*   **Purpose:** To provide clear pathways for users to support the organization.
*   **Features:**
    *   **Interactive Donation Calculator:** Allows users to select a donation amount and see the tangible impact of their contribution. This provides immediate feedback and a sense of agency.
    *   **Volunteer Section:** A call-to-action that directs users to the volunteer sign-up page.

### 5. Volunteer (`volunteer.html`)

*   **Purpose:** To capture information from potential volunteers.
*   **Features:**
    *   **Volunteer Application Form:** A simple form that collects the user's name, email, and areas of interest.
    *   **Immediate Feedback:** Upon submission, the user receives a confirmation message.

### 6. Login & Dashboard (`login.html`, `dashboard.html`)

*   **Purpose:** To provide a personalized experience for registered donors.
*   **Features:**
    *   **Simulated Login:** A simple login form that mimics the authentication process.
    *   **Donation History:** The dashboard displays a table with the user's past donations, providing a sense of recognition and a record of their support.

---

## 5. Design Rationale (HCI Principles)

The design of the OceanCare Initiative website is guided by several key HCI principles:

*   **Visibility of System Status:** The donation calculator provides immediate feedback on the impact of the selected donation amount. The volunteer form submission also gives immediate confirmation.
*   **Match Between System and the Real World:** The language used is straightforward and avoids jargon. The visual design uses high-quality images of oceans and marine life to connect with the user's understanding of the subject matter.
*   **User Control and Freedom:** The navigation is clear and consistent, allowing users to easily move between sections and backtrack if needed. The donation calculator gives users control over how much they want to give.
*   **Consistency and Standards:** The visual design (colors, fonts, layout) and navigation are consistent across all pages, creating a cohesive and predictable user experience.
*   **Aesthetic and Minimalist Design:** The design is clean and focuses on the essential information, using a limited color palette and high-quality imagery to create an emotional connection without overwhelming the user.
*   **Recognition Rather Than Recall:** Navigation labels are clear and descriptive. The dashboard allows donors to see their history without having to remember it.

---

## 6. Future Work

This paper prototype provides a solid foundation for the OceanCare Initiative website. Future development could include:

*   **Full-fledged Donation System:** Integration with a real payment gateway (e.g., Stripe, PayPal).
*   **Detailed Project Pages:** Individual pages for each project with more in-depth information, progress updates, and galleries.
*   **Volunteer Portal:** A logged-in section for volunteers to see available tasks, log hours, and communicate with the team.
*   **Blog/News Section:** A more robust news/blog section with articles written by the OceanCare team.
*   **Accessibility Improvements:** A thorough audit to ensure the website is fully accessible to users with disabilities, following WCAG guidelines.
*   **Interactive Map:** A map showcasing the locations of OceanCare's projects around the world.
*   **Social Media Integration:** Deeper integration with social media to encourage sharing and community building.

This presentation should give you a comprehensive overview to present for your class. Good luck!
