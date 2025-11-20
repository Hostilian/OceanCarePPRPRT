# OceanCare Initiative Website

This project is a website for the "OceanCare Initiative," a non-profit organization dedicated to ocean protection. The goal is to raise awareness, share the organization's work, and collect donations.

## Features

*   **Homepage (`index.html`):** Displays the organization's mission and features a "Recent News" section that dynamically fetches the latest articles on ocean conservation using the GNews API.
*   **Our Projects (`projects.html`):** Showcases the various projects and initiatives the organization is working on.
*   **Our Team (`team.html`):** Introduces the members of the OceanCare Initiative.
*   **How to Help (`how-to-help.html`):** Provides information on how people can contribute, including donations.
*   **Volunteer (`volunteer.html`):** A page for visitors to sign up as volunteers for events or other activities.
*   **Donor Dashboard (`dashboard.html`):** A password-protected page for donors to view their donation history after logging in (`login.html`).

## Technologies Used

*   **Frontend:** HTML, CSS, JavaScript
*   **Backend:** Node.js, Express.js
*   **API:** Axios is used to fetch data from the GNews API for the news section.

## Setup and Running the Project

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Start the server:**
    ```bash
    npm start
    ```

3.  Open your web browser and navigate to `http://localhost:3000` to see the website.
