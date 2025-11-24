/**
 * Toast Notification System
 * Professional toast notifications with auto-dismiss and manual close
 */

class Toast {
    constructor() {
        this.container = null;
        this.initContainer();
    }

    initContainer() {
        if (document.querySelector('.toast-container')) {
            this.container = document.querySelector('.toast-container');
            return;
        }
        
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Icon based on type
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ',
            warning: '⚠'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-content">${message}</div>
            <button class="toast-close" aria-label="Close notification">×</button>
            <div class="toast-progress"></div>
        `;

        this.container.appendChild(toast);

        // Close button handler
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.remove(toast));

        // Auto-dismiss
        if (duration > 0) {
            setTimeout(() => this.remove(toast), duration);
        }

        return toast;
    }

    remove(toast) {
        toast.style.animation = 'slideOut 300ms ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }

    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }

    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }

    warning(message, duration = 4000) {
        return this.show(message, 'warning', duration);
    }
}

// Create global toast instance
const toast = new Toast();
