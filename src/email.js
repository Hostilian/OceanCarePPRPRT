/**
 * Email Service Module
 * Handles transactional emails for donations, volunteer signups, and notifications
 * Supports SendGrid, Mailgun, or SMTP-based email services
 */

const nodemailer = require('nodemailer');

// Initialize email transporter
let transporter = null;

/**
 * Initialize email transporter based on configuration
 * Supports: SendGrid (via SMTP), Mailgun, or standard SMTP
 * @returns {boolean} - True if transporter was initialized
 */
function initializeEmailService() {
  const emailService = process.env.EMAIL_SERVICE || 'smtp';

  try {
    if (emailService === 'sendgrid' && process.env.SENDGRID_API_KEY) {
      // SendGrid via SMTP
      transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      });
      return true;
    } else {
      // Standard SMTP configuration
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      });
      return true;
    }

    // Verify connection
    if (transporter) {
      transporter.verify((error) => {
        // Verification completed - will handle gracefully if it fails
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Email service initialization error:', error);
    return false;
  }
}

/**
 * Send donation confirmation email
 * @param {string} email - Recipient email
 * @param {string} name - Donor name
 * @param {number} amount - Donation amount
 * @param {string} purpose - Donation purpose
 * @param {string} receiptUrl - Stripe receipt URL (optional)
 * @returns {Promise<Object>} - Send result
 */
async function sendDonationConfirmation(email, name, amount, purpose, receiptUrl = null) {
  if (!transporter) {
    return { success: true, skipped: true, reason: 'Email service not configured' };
  }

  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0077BE; color: white; padding: 20px; text-align: center;">
          <h1>Thank You for Your Donation!</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f5f5f5;">
          <p>Dear ${name},</p>
          
          <p>We are deeply grateful for your generous donation to OceanCare Initiative. Your contribution will make a real difference in protecting our marine ecosystems.</p>
          
          <div style="background-color: white; padding: 15px; border-left: 4px solid #0077BE; margin: 20px 0;">
            <h3>Donation Details</h3>
            <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
            <p><strong>Purpose:</strong> ${purpose || 'General Ocean Conservation'}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <h3>What Your Donation Achieves</h3>
          <ul>
            <li><strong>$25</strong> protects 2 marine animals and restores 7 coral fragments</li>
            <li><strong>$50</strong> funds 1 full beach cleanup event</li>
            <li><strong>$100</strong> supports 40 hours of volunteer research</li>
            <li><strong>$500</strong> secures 1 acre of marine sanctuary</li>
          </ul>
          
          <p>You can view your impact in real-time on your <a href="${process.env.APP_URL || 'https://oceancare.org'}/dashboard" style="color: #0077BE;">donor dashboard</a>.</p>
          
          ${receiptUrl ? `
            <p style="text-align: center; margin: 20px 0;">
              <a href="${receiptUrl}" style="background-color: #0077BE; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">View Receipt</a>
            </p>
          ` : ''}
          
          <h3>Get Involved Further</h3>
          <ul>
            <li><a href="${process.env.APP_URL || 'https://oceancare.org'}/volunteer" style="color: #0077BE;">Join Our Volunteer Program</a></li>
            <li><a href="${process.env.APP_URL || 'https://oceancare.org'}/report-debris" style="color: #0077BE;">Report Ocean Debris</a></li>
            <li><a href="${process.env.APP_URL || 'https://oceancare.org'}#news" style="color: #0077BE;">Stay Updated with Ocean News</a></li>
          </ul>
          
          <p>Questions? Our team is here to help. Reply to this email or contact us at <a href="mailto:support@oceancare.org" style="color: #0077BE;">support@oceancare.org</a>.</p>
          
          <p style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
            Together, we're protecting our oceans for future generations.<br>
            <strong>The OceanCare Initiative Team</strong>
          </p>
        </div>
        
        <div style="background-color: #002240; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>&copy; 2025 OceanCare Initiative. All rights reserved. | <a href="${process.env.APP_URL || 'https://oceancare.org'}/privacy" style="color: #0077BE;">Privacy Policy</a></p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_FROM || 'noreply@oceancare.org',
      to: email,
      subject: `Thank You for Your $${amount.toFixed(2)} Donation to OceanCare!`,
      html: htmlContent,
      text: `Thank you for donating $${amount.toFixed(2)} to OceanCare Initiative. Your donation will protect our oceans.`
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      email
    };
  } catch (error) {
    console.error('Donation confirmation email error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send volunteer signup confirmation
 * @param {string} email - Volunteer email
 * @param {string} name - Volunteer name
 * @param {string} location - Volunteer location
 * @param {string} area - Area of interest
 * @returns {Promise<Object>} - Send result
 */
async function sendVolunteerConfirmation(email, name, location, area) {
  if (!transporter) {
    return { success: true, skipped: true, reason: 'Email service not configured' };
  }

  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0077BE; color: white; padding: 20px; text-align: center;">
          <h1>Welcome to the Ocean Guardian Community!</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f5f5f5;">
          <p>Dear ${name},</p>
          
          <p>Thank you for signing up to volunteer with OceanCare Initiative! We're excited to have you join our global community of ocean protectors.</p>
          
          <div style="background-color: white; padding: 15px; border-left: 4px solid #0077BE; margin: 20px 0;">
            <h3>Your Volunteer Profile</h3>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Area of Interest:</strong> ${area}</p>
            <p><strong>Status:</strong> Active</p>
          </div>
          
          <h3>What's Next?</h3>
          <ol>
            <li>Complete your volunteer profile on your <a href="${process.env.APP_URL || 'https://oceancare.org'}/dashboard" style="color: #0077BE;">dashboard</a></li>
            <li>Browse available <a href="${process.env.APP_URL || 'https://oceancare.org'}/projects" style="color: #0077BE;">conservation projects</a> near you</li>
            <li>Sign up for upcoming events and cleanups</li>
            <li>Track your impact in real-time</li>
          </ol>
          
          <h3>Volunteer Opportunities</h3>
          <ul>
            <li>Beach & Ocean Cleanups</li>
            <li>Marine Research Expeditions</li>
            <li>Coral Restoration Projects</li>
            <li>Educational Outreach Programs</li>
            <li>Data Collection & Analysis</li>
          </ul>
          
          <p>Check back soon for events happening in your area. You can also <a href="${process.env.APP_URL || 'https://oceancare.org'}/report-debris" style="color: #0077BE;">report ocean debris</a> you find to help coordinate cleanup efforts.</p>
          
          <p>Have questions? Contact our volunteer coordinators at <a href="mailto:volunteers@oceancare.org" style="color: #0077BE;">volunteers@oceancare.org</a>.</p>
          
          <p style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
            Together, we're making a measurable difference.<br>
            <strong>The OceanCare Initiative Team</strong>
          </p>
        </div>
        
        <div style="background-color: #002240; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>&copy; 2025 OceanCare Initiative. All rights reserved. | <a href="${process.env.APP_URL || 'https://oceancare.org'}/privacy" style="color: #0077BE;">Privacy Policy</a></p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_FROM || 'noreply@oceancare.org',
      to: email,
      subject: 'Welcome to OceanCare Initiative - Volunteer Confirmation',
      html: htmlContent,
      text: `Welcome ${name}! Thank you for signing up to volunteer with OceanCare.`
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      email
    };
  } catch (error) {
    console.error('Volunteer confirmation email error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send debris report acknowledgment
 * @param {string} email - Reporter email
 * @param {string} name - Reporter name
 * @param {Object} location - Location object with lat/long
 * @param {number} reportId - Debris report ID
 * @returns {Promise<Object>} - Send result
 */
async function sendDebrisReportConfirmation(email, name, location, reportId) {
  if (!transporter) {
    return { success: true, skipped: true, reason: 'Email service not configured' };
  }

  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0077BE; color: white; padding: 20px; text-align: center;">
          <h1>Thank You for Reporting Ocean Debris!</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f5f5f5;">
          <p>Dear ${name},</p>
          
          <p>Thank you for helping us protect our oceans by reporting debris at your location. Your report has been received and our cleanup coordination team is reviewing it.</p>
          
          <div style="background-color: white; padding: 15px; border-left: 4px solid #0077BE; margin: 20px 0;">
            <h3>Report Details</h3>
            <p><strong>Report ID:</strong> #${reportId}</p>
            <p><strong>Location:</strong> ${location.latitude?.toFixed(4)}, ${location.longitude?.toFixed(4)}</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Status:</strong> Under Review</p>
          </div>
          
          <h3>What Happens Next?</h3>
          <ol>
            <li>Our team verifies the debris report</li>
            <li>We coordinate cleanup efforts with local volunteers</li>
            <li>You'll receive updates on cleanup progress</li>
            <li>Impact data is added to global conservation metrics</li>
          </ol>
          
          <p>You can track this report's progress on your <a href="${process.env.APP_URL || 'https://oceancare.org'}/dashboard" style="color: #0077BE;">dashboard</a>.</p>
          
          <h3>How You Can Help Further</h3>
          <ul>
            <li><a href="${process.env.APP_URL || 'https://oceancare.org'}/volunteer" style="color: #0077BE;">Volunteer for cleanup efforts</a> in your area</li>
            <li><a href="${process.env.APP_URL || 'https://oceancare.org'}#donate" style="color: #0077BE;">Donate</a> to support cleanup operations</li>
            <li>Share this report with local environmental groups</li>
            <li>Provide additional photos or information if available</li>
          </ul>
          
          <p>Questions about your report? Reply to this email or contact us at <a href="mailto:support@oceancare.org" style="color: #0077BE;">support@oceancare.org</a>.</p>
          
          <p style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
            Every report creates measurable change.<br>
            <strong>The OceanCare Initiative Team</strong>
          </p>
        </div>
        
        <div style="background-color: #002240; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>&copy; 2025 OceanCare Initiative. All rights reserved. | <a href="${process.env.APP_URL || 'https://oceancare.org'}/privacy" style="color: #0077BE;">Privacy Policy</a></p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_FROM || 'noreply@oceancare.org',
      to: email,
      subject: `Debris Report Received - Report #${reportId}`,
      html: htmlContent,
      text: `Thank you for reporting ocean debris. Your report #${reportId} has been received and is under review.`
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      email,
      reportId
    };
  } catch (error) {
    console.error('Debris report email error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send contact form confirmation
 * @param {string} email - Contact email
 * @param {string} name - Contact name
 * @param {string} subject - Message subject
 * @returns {Promise<Object>} - Send result
 */
async function sendContactFormConfirmation(email, name, subject) {
  if (!transporter) {
    return { success: true, skipped: true, reason: 'Email service not configured' };
  }

  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0077BE; color: white; padding: 20px; text-align: center;">
          <h1>We Received Your Message</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f5f5f5;">
          <p>Dear ${name},</p>
          
          <p>Thank you for contacting OceanCare Initiative. We have received your message and will respond within 24-48 business hours.</p>
          
          <div style="background-color: white; padding: 15px; border-left: 4px solid #0077BE; margin: 20px 0;">
            <h3>Your Message</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Received:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Status:</strong> In Queue</p>
          </div>
          
          <p>Our support team typically responds during business hours (9 AM - 5 PM UTC, Monday - Friday).</p>
          
          <p>If you have an urgent matter, you can also:</p>
          <ul>
            <li>Call our hotline: +1 (555) OCEAN-CARE</li>
            <li>Chat with our team on our website</li>
            <li>Email us directly at <a href="mailto:support@oceancare.org" style="color: #0077BE;">support@oceancare.org</a></li>
          </ul>
          
          <p style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
            Thank you for your interest in ocean conservation.<br>
            <strong>The OceanCare Initiative Team</strong>
          </p>
        </div>
        
        <div style="background-color: #002240; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>&copy; 2025 OceanCare Initiative. All rights reserved. | <a href="${process.env.APP_URL || 'https://oceancare.org'}/privacy" style="color: #0077BE;">Privacy Policy</a></p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_FROM || 'noreply@oceancare.org',
      to: email,
      subject: 'We Received Your Message - OceanCare Support',
      html: htmlContent,
      text: `Thank you for contacting OceanCare. We received your message about "${subject}" and will respond soon.`
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      email
    };
  } catch (error) {
    console.error('Contact form email error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send email to support team about new form submission
 * @param {string} formType - Type of form (donation, volunteer, debris, contact)
 * @param {Object} data - Form submission data
 * @returns {Promise<Object>} - Send result
 */
async function sendSupportNotification(formType, data) {
  if (!transporter) {
    return { success: true, skipped: true, reason: 'Email service not configured' };
  }

  try {
    const supportEmail = process.env.SENDGRID_SUPPORT_EMAIL || 'support@oceancare.org';
    
    let subject, content;
    
    switch (formType) {
      case 'donation':
        subject = `New Donation: $${data.amount} from ${data.name}`;
        content = `New donation received:\n\nName: ${data.name}\nEmail: ${data.email}\nAmount: $${data.amount}\nPurpose: ${data.purpose || 'General'}`;
        break;
      case 'volunteer':
        subject = `New Volunteer Signup: ${data.name}`;
        content = `New volunteer registration:\n\nName: ${data.name}\nEmail: ${data.email}\nLocation: ${data.location}\nArea: ${data.area}`;
        break;
      case 'debris':
        subject = `New Debris Report from ${data.name}`;
        content = `New debris report:\n\nLocation: (${data.latitude}, ${data.longitude})\nType: ${data.debrisType}\nQuantity: ${data.quantity}`;
        break;
      case 'contact':
        subject = `New Contact Form: ${data.subject}`;
        content = `New message from ${data.name} (${data.email}): ${data.message}`;
        break;
      default:
        return { success: false, error: 'Unknown form type' };
    }

    const mailOptions = {
      from: process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_FROM || 'noreply@oceancare.org',
      to: supportEmail,
      subject,
      text: content
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Support notification email error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  initializeEmailService,
  sendDonationConfirmation,
  sendVolunteerConfirmation,
  sendDebrisReportConfirmation,
  sendContactFormConfirmation,
  sendSupportNotification
};
