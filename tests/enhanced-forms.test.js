/**
 * E2E Tests for Enhanced Form System
 * Tests form validation, loading states, and notifications
 */

describe('Enhanced Forms E2E Tests', () => {
  let handler;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <form class="enhanced-form" id="test-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required>
          <span class="error-message"></span>
        </div>
        <div class="form-group">
          <label for="phone">Phone</label>
          <input type="tel" id="phone" name="phone" minlength="10">
          <span class="error-message"></span>
        </div>
        <div class="form-group">
          <label for="message">Message</label>
          <textarea id="message" name="message" minlength="10" required></textarea>
          <span class="error-message"></span>
        </div>
        <button type="submit" id="submit-btn">Submit</button>
      </form>
    `;

    // Initialize handler
    handler = new EnhancedFormHandler('#test-form');
  });

  describe('Email Validation', () => {
    test('should accept valid email', () => {
      const input = document.getElementById('email');
      input.value = 'test@example.com';
      
      const field = input.closest('.form-group');
      handler.validateField(input);
      
      expect(field.classList.contains('valid')).toBe(true);
      expect(field.classList.contains('error')).toBe(false);
    });

    test('should reject invalid email format', () => {
      const input = document.getElementById('email');
      input.value = 'invalid-email';
      
      const field = input.closest('.form-group');
      handler.validateField(input);
      
      expect(field.classList.contains('error')).toBe(true);
      expect(field.classList.contains('valid')).toBe(false);
    });

    test('should require email field', () => {
      const input = document.getElementById('email');
      input.value = '';
      
      const field = input.closest('.form-group');
      handler.validateField(input);
      
      expect(field.classList.contains('error')).toBe(true);
    });

    test('should show error message for invalid email', () => {
      const input = document.getElementById('email');
      input.value = 'invalid';
      
      handler.validateField(input);
      
      const errorMsg = input.closest('.form-group').querySelector('.error-message');
      expect(errorMsg.textContent).toBeTruthy();
      expect(errorMsg.textContent.length).toBeGreaterThan(0);
    });
  });

  describe('Phone Validation', () => {
    test('should accept valid phone number', () => {
      const input = document.getElementById('phone');
      input.value = '5550123456';
      
      const field = input.closest('.form-group');
      handler.validateField(input);
      
      expect(field.classList.contains('valid')).toBe(true);
    });

    test('should reject phone number that is too short', () => {
      const input = document.getElementById('phone');
      input.value = '555';
      
      const field = input.closest('.form-group');
      handler.validateField(input);
      
      expect(field.classList.contains('error')).toBe(true);
    });

    test('should allow optional phone field', () => {
      const input = document.getElementById('phone');
      input.value = '';
      
      const field = input.closest('.form-group');
      handler.validateField(input);
      
      // Optional field, should not error when empty
      expect(field.classList.contains('error')).toBe(false);
    });
  });

  describe('Required Field Validation', () => {
    test('should reject empty required field', () => {
      const input = document.getElementById('message');
      input.value = '';
      
      const field = input.closest('.form-group');
      handler.validateField(input);
      
      expect(field.classList.contains('error')).toBe(true);
    });

    test('should accept filled required field', () => {
      const input = document.getElementById('message');
      input.value = 'This is a valid message';
      
      const field = input.closest('.form-group');
      handler.validateField(input);
      
      expect(field.classList.contains('valid')).toBe(true);
    });
  });

  describe('Minimum Length Validation', () => {
    test('should reject text below minimum length', () => {
      const input = document.getElementById('message');
      input.value = 'Short';
      
      const field = input.closest('.form-group');
      handler.validateField(input);
      
      expect(field.classList.contains('error')).toBe(true);
    });

    test('should accept text meeting minimum length', () => {
      const input = document.getElementById('message');
      input.value = 'This is long enough message';
      
      const field = input.closest('.form-group');
      handler.validateField(input);
      
      expect(field.classList.contains('valid')).toBe(true);
    });
  });

  describe('Form Validation', () => {
    test('should validate entire form', () => {
      const emailInput = document.getElementById('email');
      const messageInput = document.getElementById('message');
      
      emailInput.value = 'test@example.com';
      messageInput.value = 'Valid message content';
      
      const isValid = handler.validateForm();
      expect(isValid).toBe(true);
    });

    test('should fail validation with invalid fields', () => {
      const emailInput = document.getElementById('email');
      emailInput.value = 'invalid';
      
      const isValid = handler.validateForm();
      expect(isValid).toBe(false);
    });

    test('should mark multiple invalid fields', () => {
      const emailInput = document.getElementById('email');
      const messageInput = document.getElementById('message');
      
      emailInput.value = 'invalid';
      messageInput.value = 'short';
      
      handler.validateForm();
      
      expect(emailInput.closest('.form-group').classList.contains('error')).toBe(true);
      expect(messageInput.closest('.form-group').classList.contains('error')).toBe(true);
    });
  });

  describe('Loading States', () => {
    test('should show loading spinner', (done) => {
      const button = document.getElementById('submit-btn');
      handler.showLoading('#submit-btn');
      
      setTimeout(() => {
        const spinner = document.querySelector('.spinner');
        expect(spinner).toBeTruthy();
        done();
      }, 100);
    });

    test('should disable form inputs during loading', (done) => {
      handler.showLoading('#submit-btn');
      
      setTimeout(() => {
        const inputs = document.querySelectorAll('input, textarea, button');
        inputs.forEach(input => {
          expect(input.disabled).toBe(true);
        });
        done();
      }, 100);
    });

    test('should hide loading spinner', (done) => {
      handler.showLoading('#submit-btn');
      
      setTimeout(() => {
        handler.hideLoading('#submit-btn');
        setTimeout(() => {
          const spinner = document.querySelector('.spinner');
          // Spinner should be removed or hidden
          expect(spinner === null || spinner.style.display === 'none').toBe(true);
          done();
        }, 100);
      }, 100);
    });

    test('should re-enable form inputs after loading', (done) => {
      handler.showLoading('#submit-btn');
      
      setTimeout(() => {
        handler.hideLoading('#submit-btn');
        setTimeout(() => {
          const inputs = document.querySelectorAll('input, textarea, button');
          inputs.forEach(input => {
            expect(input.disabled).toBe(false);
          });
          done();
        }, 100);
      }, 100);
    });

    test('should change button text during loading', (done) => {
      const button = document.getElementById('submit-btn');
      const originalText = button.textContent;
      
      handler.showLoading('#submit-btn');
      
      setTimeout(() => {
        expect(button.textContent).not.toBe(originalText);
        expect(button.textContent).toContain('Loading');
        done();
      }, 100);
    });
  });

  describe('Notifications', () => {
    test('should create success notification', (done) => {
      handler.showSuccess('Submission successful!');
      
      setTimeout(() => {
        const notification = document.querySelector('.notification-success');
        expect(notification).toBeTruthy();
        expect(notification.textContent).toContain('Submission successful!');
        done();
      }, 100);
    });

    test('should create error notification', (done) => {
      handler.showError('An error occurred!');
      
      setTimeout(() => {
        const notification = document.querySelector('.notification-error');
        expect(notification).toBeTruthy();
        expect(notification.textContent).toContain('An error occurred!');
        done();
      }, 100);
    });

    test('should create notification with custom type', (done) => {
      handler.showNotification('Test warning', 'warning');
      
      setTimeout(() => {
        const notification = document.querySelector('.notification-warning');
        expect(notification).toBeTruthy();
        done();
      }, 100);
    });

    test('should auto-dismiss notification after duration', (done) => {
      handler.showNotification('Auto dismiss', 'info', 500);
      
      setTimeout(() => {
        const notification = document.querySelector('.notification-info');
        expect(notification).toBeFalsy();
        done();
      }, 700);
    });

    test('should include close button on notification', (done) => {
      handler.showSuccess('Test');
      
      setTimeout(() => {
        const closeBtn = document.querySelector('.notification-close');
        expect(closeBtn).toBeTruthy();
        done();
      }, 100);
    });

    test('should dismiss notification on close button click', (done) => {
      handler.showSuccess('Test');
      
      setTimeout(() => {
        const closeBtn = document.querySelector('.notification-close');
        closeBtn.click();
        
        setTimeout(() => {
          const notification = document.querySelector('.notification');
          expect(notification).toBeFalsy();
          done();
        }, 300);
      }, 100);
    });
  });

  describe('Form Reset', () => {
    test('should reset form after success', (done) => {
      const emailInput = document.getElementById('email');
      const messageInput = document.getElementById('message');
      
      emailInput.value = 'test@example.com';
      messageInput.value = 'Test message content';
      
      handler.showSuccess('Success!');
      
      setTimeout(() => {
        expect(emailInput.value).toBe('');
        expect(messageInput.value).toBe('');
        done();
      }, 300);
    });

    test('should remove error classes on reset', (done) => {
      const emailInput = document.getElementById('email');
      emailInput.value = 'invalid';
      handler.validateField(emailInput);
      
      expect(emailInput.closest('.form-group').classList.contains('error')).toBe(true);
      
      handler.showSuccess('Success!');
      
      setTimeout(() => {
        expect(emailInput.closest('.form-group').classList.contains('error')).toBe(false);
        done();
      }, 300);
    });
  });

  describe('Form Submission', () => {
    test('should handle successful form submission', (done) => {
      const form = document.getElementById('test-form');
      const emailInput = document.getElementById('email');
      const messageInput = document.getElementById('message');
      
      emailInput.value = 'test@example.com';
      messageInput.value = 'Valid message content';
      
      // Mock fetch
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      );
      
      form.addEventListener('submit', (e) => {
        handler.handleSubmit(e);
      });
      
      form.dispatchEvent(new Event('submit'));
      
      setTimeout(() => {
        const notification = document.querySelector('.notification-success');
        expect(notification).toBeTruthy();
        done();
      }, 500);
    });

    test('should handle failed form submission', (done) => {
      const form = document.getElementById('test-form');
      const emailInput = document.getElementById('email');
      const messageInput = document.getElementById('message');
      
      emailInput.value = 'test@example.com';
      messageInput.value = 'Valid message content';
      
      // Mock fetch to fail
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ success: false, message: 'Error' })
        })
      );
      
      form.addEventListener('submit', (e) => {
        handler.handleSubmit(e);
      });
      
      form.dispatchEvent(new Event('submit'));
      
      setTimeout(() => {
        const notification = document.querySelector('.notification-error');
        expect(notification).toBeTruthy();
        done();
      }, 500);
    });
  });
});
