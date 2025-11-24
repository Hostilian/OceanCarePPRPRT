/**
 * Enhanced Form Handler with Loading States and Feedback
 * Provides professional UX with validation, loading spinners, and success/error messages
 */

class EnhancedFormHandler {
  constructor(formSelector) {
    this.form = document.querySelector(formSelector);
    if (!this.form) {
      console.error(`Form not found: ${formSelector}`);
      return;
    }

    this.isSubmitting = false;
    this.originalButtonText = '';
    this.init();
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Real-time validation
    const inputs = this.form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.validateField(input));
    });
  }

  /**
   * Validate a single field
   */
  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Required check
    if (field.hasAttribute('required') && !value) {
      isValid = false;
      errorMessage = 'This field is required';
    }

    // Email validation
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
      }
    }

    // Phone validation
    if (field.type === 'tel' && value) {
      const phoneRegex = /^[\d\s\-\(\)\+\.]+$/;
      if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
        isValid = false;
        errorMessage = 'Please enter a valid phone number';
      }
    }

    // Min length validation
    if (field.hasAttribute('minlength')) {
      const minLength = parseInt(field.getAttribute('minlength'));
      if (value.length < minLength && value.length > 0) {
        isValid = false;
        errorMessage = `Minimum ${minLength} characters required`;
      }
    }

    // Update UI
    this.updateFieldUI(field, isValid, errorMessage);
    return isValid;
  }

  /**
   * Update field UI with error state
   */
  updateFieldUI(field, isValid, errorMessage) {
    const fieldGroup = field.closest('.form-group') || field.parentElement;
    
    if (isValid) {
      fieldGroup.classList.remove('error');
      fieldGroup.classList.add('valid');
      
      // Remove error message if exists
      const errorEl = fieldGroup.querySelector('.error-message');
      if (errorEl) errorEl.remove();
    } else {
      fieldGroup.classList.add('error');
      fieldGroup.classList.remove('valid');
      
      // Add or update error message
      let errorEl = fieldGroup.querySelector('.error-message');
      if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        fieldGroup.appendChild(errorEl);
      }
      errorEl.textContent = errorMessage;
    }
  }

  /**
   * Validate entire form
   */
  validateForm() {
    const inputs = this.form.querySelectorAll('input, textarea, select');
    let isFormValid = true;

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isFormValid = false;
      }
    });

    return isFormValid;
  }

  /**
   * Show loading state
   */
  showLoading(buttonSelector = 'button[type="submit"]') {
    const button = this.form.querySelector(buttonSelector);
    if (!button) return;

    this.originalButtonText = button.textContent;
    button.disabled = true;
    button.classList.add('loading');
    
    // Create or show spinner
    let spinner = button.querySelector('.spinner');
    if (!spinner) {
      spinner = document.createElement('span');
      spinner.className = 'spinner';
      button.insertBefore(spinner, button.firstChild);
    }

    button.textContent = '';
    button.prepend(spinner);
    button.append(' Loading...');

    // Disable all form inputs
    const inputs = this.form.querySelectorAll('input, textarea, select, button');
    inputs.forEach(input => input.disabled = true);
  }

  /**
   * Hide loading state
   */
  hideLoading(buttonSelector = 'button[type="submit"]') {
    const button = this.form.querySelector(buttonSelector);
    if (!button) return;

    button.disabled = false;
    button.classList.remove('loading');
    button.textContent = this.originalButtonText;

    // Enable all form inputs
    const inputs = this.form.querySelectorAll('input, textarea, select, button');
    inputs.forEach(input => input.disabled = false);
  }

  /**
   * Show success message
   */
  showSuccess(message = 'Form submitted successfully!') {
    this.showNotification(message, 'success', 5000);
    this.form.reset();
    
    // Clear validation UI
    this.form.querySelectorAll('.form-group').forEach(group => {
      group.classList.remove('error', 'valid');
    });
  }

  /**
   * Show error message
   */
  showError(message = 'An error occurred. Please try again.') {
    this.showNotification(message, 'error', 5000);
  }

  /**
   * Show notification toast
   */
  showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${this.getIcon(type)}</span>
        <span class="notification-text">${message}</span>
        <button class="notification-close" aria-label="Close">&times;</button>
      </div>
    `;

    // Insert into DOM
    const container = document.querySelector('.notifications-container') || document.body;
    container.appendChild(notification);

    // Close button handler
    notification.querySelector('.notification-close').addEventListener('click', () => {
      this.removeNotification(notification);
    });

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => this.removeNotification(notification), duration);
    }

    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
  }

  /**
   * Remove notification with animation
   */
  removeNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }

  /**
   * Get icon for notification type
   */
  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }

  /**
   * Handle form submission
   */
  async handleSubmit(e) {
    e.preventDefault();

    // Validate form
    if (!this.validateForm()) {
      this.showError('Please fix the errors above');
      return;
    }

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    this.showLoading();

    try {
      // Get form data
      const formData = new FormData(this.form);
      const data = Object.fromEntries(formData);

      // Get form action
      const action = this.form.getAttribute('action');
      if (!action) {
        throw new Error('Form action not defined');
      }

      // Submit form
      const response = await fetch(action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Form submission failed');
      }

      this.showSuccess(result.message || 'Form submitted successfully!');

      // Optional: Redirect after success
      if (result.redirect) {
        setTimeout(() => {
          window.location.href = result.redirect;
        }, 1500);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      this.showError(error.message || 'An error occurred. Please try again.');
    } finally {
      this.hideLoading();
      this.isSubmitting = false;
    }
  }
}

/**
 * Initialize all enhanced forms
 */
function initializeEnhancedForms() {
  // Initialize specific forms
  const forms = document.querySelectorAll('form[data-enhanced]');
  forms.forEach(form => {
    new EnhancedFormHandler(form);
  });

  // Or initialize all forms with specific class
  const allForms = document.querySelectorAll('form.enhanced-form');
  allForms.forEach(form => {
    new EnhancedFormHandler(form);
  });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeEnhancedForms);
} else {
  initializeEnhancedForms();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedFormHandler;
}
