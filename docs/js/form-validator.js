/**
 * Form Validation & Enhancement System
 * Real-time validation with error messages and visual feedback
 */

class FormValidator {
    constructor(formElement) {
        this.form = formElement;
        this.errors = {};
        this.setupValidation();
    }

    setupValidation() {
        const inputs = this.form.querySelectorAll('input[required], textarea[required], select[required]');
        
        inputs.forEach(input => {
            // Real-time validation as user types
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('change', () => this.validateField(input));
            
            if (input.type === 'text' || input.type === 'email' || input.type === 'tel' || 
                input.type === 'number' || input.tagName === 'TEXTAREA') {
                input.addEventListener('input', () => this.validateField(input));
            }
        });

        // Form submission
        this.form.addEventListener('submit', (e) => {
            if (!this.validateForm()) {
                e.preventDefault();
                toast.error('Please fix all errors before submitting', 4000);
            }
        });
    }

    validateField(input) {
        const fieldName = input.name || input.id;
        let errorMessage = '';

        // Check required
        if (input.required && !input.value.trim()) {
            errorMessage = `${this.formatLabel(input.name)} is required`;
        }
        // Email validation
        else if (input.type === 'email' && input.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                errorMessage = 'Please enter a valid email address';
            }
        }
        // Phone validation (basic)
        else if (input.type === 'tel' && input.value.trim()) {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (input.value.length < 10 || !phoneRegex.test(input.value)) {
                errorMessage = 'Please enter a valid phone number';
            }
        }
        // Number validation
        else if (input.type === 'number' && input.value.trim()) {
            const num = parseFloat(input.value);
            if (isNaN(num) || num <= 0) {
                errorMessage = 'Please enter a valid number';
            }
            if (input.min && num < parseFloat(input.min)) {
                errorMessage = `Must be at least ${input.min}`;
            }
            if (input.max && num > parseFloat(input.max)) {
                errorMessage = `Must be no more than ${input.max}`;
            }
        }
        // Password strength (optional)
        else if (input.type === 'password' && input.value.trim()) {
            if (input.dataset.strength === 'strong' && input.value.length < 8) {
                errorMessage = 'Password must be at least 8 characters';
            }
        }

        // Update error state
        if (errorMessage) {
            this.setFieldError(input, errorMessage);
            this.errors[fieldName] = errorMessage;
        } else {
            this.clearFieldError(input);
            delete this.errors[fieldName];
        }

        return !errorMessage;
    }

    setFieldError(input, message) {
        // Remove existing error if any
        const existingError = input.parentElement.querySelector('.field-error');
        if (existingError) existingError.remove();

        // Add error state
        input.classList.add('field-invalid');
        input.classList.remove('field-valid');

        // Add error message
        const errorEl = document.createElement('div');
        errorEl.className = 'field-error';
        errorEl.textContent = message;
        errorEl.style.cssText = `
            color: #ef4444;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: block;
        `;
        input.parentElement.appendChild(errorEl);

        // Add aria-invalid
        input.setAttribute('aria-invalid', 'true');
    }

    clearFieldError(input) {
        const errorEl = input.parentElement.querySelector('.field-error');
        if (errorEl) errorEl.remove();

        input.classList.remove('field-invalid');
        input.classList.add('field-valid');
        input.removeAttribute('aria-invalid');
    }

    validateForm() {
        const inputs = this.form.querySelectorAll('input[required], textarea[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    formatLabel(fieldName) {
        return fieldName
            .split(/(?=[A-Z])/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    reset() {
        this.errors = {};
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            this.clearFieldError(input);
        });
        this.form.reset();
    }
}

// Add CSS for field validation states
function initFormValidationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        input.field-invalid,
        textarea.field-invalid,
        select.field-invalid {
            border-color: #ef4444 !important;
            background-color: #fef2f2;
        }

        input.field-valid,
        textarea.field-valid,
        select.field-valid {
            border-color: #10b981 !important;
        }

        .field-error {
            color: #ef4444;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: block;
        }

        button[type="submit"]:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .form-loading {
            position: relative;
            pointer-events: none;
            opacity: 0.6;
        }

        .form-loading::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 20px;
            height: 20px;
            border: 2px solid #f3f4f6;
            border-top-color: var(--color-primary);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to { transform: translate(-50%, -50%) rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initFormValidationStyles);

// Helper to set form loading state
function setFormLoading(form, isLoading) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (isLoading) {
        submitBtn.disabled = true;
        form.classList.add('form-loading');
        submitBtn.dataset.originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
    } else {
        submitBtn.disabled = false;
        form.classList.remove('form-loading');
        submitBtn.textContent = submitBtn.dataset.originalText || 'Submit';
    }
}
