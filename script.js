// OceanCare - Modular JS for Effects & Interactivity

const app = {
  shapes: [],
  particles: [],
  mouse: { x: 0, y: 0 },
  canvas: null,
  ctx: null,

  init() {
    this.setupCanvas();
    this.cursorFx();
    this.floatingShapes();
    this.navScroll();
    this.formHandler();
    this.audioFx();
    window.addEventListener('resize', () => this.setupCanvas());
  },

  setupCanvas() {
    this.canvas = document.getElementById('cursor-canvas');
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext('2d');
  },

  cursorFx() {
    const self = this;
    document.addEventListener('mousemove', (e) => {
      self.mouse = { x: e.clientX, y: e.clientY };
      self.drawCursorGlow();
    });
    document.addEventListener('click', (e) => self.clickRipple(e));
  },

  drawCursorGlow() {
    if (!this.ctx) return;
    const { x, y } = this.mouse;
    const glow = this.ctx.createRadialGradient(x, y, 0, x, y, 30);
    glow.addColorStop(0, 'rgba(100,255,218,0.5)');
    glow.addColorStop(1, 'rgba(100,255,218,0)');
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = glow;
    this.ctx.fillRect(x - 30, y - 30, 60, 60);
    
    // Trail particles
    if (Math.random() > 0.7) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        life: 1,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2
      });
    }
    
    this.particles = this.particles.filter(p => {
      p.life -= 0.02;
      p.x += p.vx;
      p.y += p.vy;
      if (p.life > 0) {
        this.ctx.fillStyle = `rgba(100,255,218,${p.life * 0.3})`;
        this.ctx.fillRect(p.x - 2, p.x - 2, 4, 4);
        return true;
      }
      return false;
    });
  },

  clickRipple(e) {
    if (!this.ctx) return;
    const ripple = {
      x: e.clientX,
      y: e.clientY,
      r: 0,
      maxR: 100
    };
    const animate = () => {
      ripple.r += 3;
      this.ctx.strokeStyle = `rgba(100,255,218,${1 - ripple.r / ripple.maxR})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(ripple.x, ripple.y, ripple.r, 0, Math.PI * 2);
      this.ctx.stroke();
      if (ripple.r < ripple.maxR) requestAnimationFrame(animate);
    };
    animate();
  },

  floatingShapes() {
    const container = document.getElementById('shapes-container');
    if (!container) return;
    
    const colors = ['#64ffda', '#ff0080', '#0080ff'];
    for (let i = 0; i < 5; i++) {
      const shape = document.createElement('div');
      const type = ['circle', 'square', 'tri'][Math.floor(Math.random() * 3)];
      const size = 50 + Math.random() * 200;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const delay = Math.random() * 5;
      
      shape.className = `shape ${type}`;
      shape.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        background: linear-gradient(135deg, ${color}, transparent);
        animation: float ${8 + Math.random() * 8}s ease-in-out infinite ${delay}s;
        opacity: ${0.05 + Math.random() * 0.1};
      `;
      if (type === 'tri') {
        shape.style.borderLeft = `${size / 2}px solid transparent`;
        shape.style.borderRight = `${size / 2}px solid transparent`;
        shape.style.borderBottom = `${size}px solid ${color}`;
      }
      container.appendChild(shape);
    }
  },

  navScroll() {
    const links = document.querySelectorAll('.nav-menu a');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            this.playSound(200);
          }
        }
      });
    });
    
    // Highlight active nav item
    window.addEventListener('scroll', () => {
      let current = '';
      const sections = document.querySelectorAll('section');
      sections.forEach(s => {
        const top = s.offsetTop;
        if (scrollY >= top - 200) current = s.getAttribute('id');
      });
      links.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    });
  },

  formHandler() {
    const form = document.getElementById('volunteer-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const msg = document.getElementById('form-msg');
      
      msg.textContent = `Thanks, ${name}. We got your email (${email}). We'll reach out when we're not saving fish.`;
      msg.style.color = '#64ffda';
      msg.style.animation = 'neonGlow 2s infinite';
      
      form.reset();
      this.playSound(400);
      setTimeout(() => { msg.textContent = ''; }, 5000);
    });
  },

  audioFx() {
    // Optional: Web Audio API beep on interactions
    document.addEventListener('click', (e) => {
      if (e.target.closest('.btn') || e.target.closest('a')) {
        this.playSound(300);
      }
    });
  },

  playSound(freq = 300, duration = 50) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration / 1000);
    } catch (e) {
      // Silently fail if no audio context
    }
  }
};

document.addEventListener('DOMContentLoaded', () => app.init());
