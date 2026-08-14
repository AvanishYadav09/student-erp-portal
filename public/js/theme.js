// Premium Theme Toggle & Interactive Background Canvas System
(function () {
    // Determine initial theme: localStorage -> system preference -> fallback 'light'
    const getInitialTheme = () => {
        const saved = localStorage.getItem('erp_theme');
        if (saved && (saved === 'dark' || saved === 'light')) {
            return saved;
        }
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    };

    const initialTheme = getInitialTheme();
    document.documentElement.setAttribute('data-theme', initialTheme);

    // Audio Feedback Generator using Web Audio API
    function playToggleSound(isDark) {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            if (ctx.state === 'suspended') {
                ctx.resume();
            }
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            const freq = isDark ? 320 : 580;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(isDark ? 540 : 880, ctx.currentTime + 0.08);
            
            gain.gain.setValueAtTime(0.04, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.08);
        } catch (e) {
            // Audio context unsupported
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const savedTheme = document.documentElement.getAttribute('data-theme') || initialTheme;
        if (document.body) {
            document.body.setAttribute('data-theme', savedTheme);
        }
        updateToggleButtons(savedTheme);

        // Initialize Interactive Canvas Background
        initCrazyBackgroundCanvas();

        // Global Event Listener for Theme Toggle Buttons
        document.addEventListener('click', (e) => {
            const toggleBtn = e.target.closest('.theme-toggle-btn');
            if (!toggleBtn) return;

            // Trigger smooth transition effect across page
            document.documentElement.classList.add('theme-transitioning');
            
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            if (document.body) {
                document.body.setAttribute('data-theme', newTheme);
            }
            localStorage.setItem('erp_theme', newTheme);
            updateToggleButtons(newTheme);
            playToggleSound(newTheme === 'dark');

            setTimeout(() => {
                document.documentElement.classList.remove('theme-transitioning');
            }, 400);
        });

        // Setup Mobile Sidebar Drawer functionality if present
        setupMobileSidebar();
    });

    function updateToggleButtons(theme) {
        const isDark = theme === 'dark';
        const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
        
        toggleBtns.forEach(btn => {
            btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
            
            const icon = btn.querySelector('.theme-icon-box i') || btn.querySelector('i');
            const label = btn.querySelector('.theme-label');
            const badge = btn.querySelector('.theme-mode-badge');
            
            if (theme === 'light') {
                if (icon) icon.className = 'fas fa-sun sun-icon';
                if (label) label.textContent = 'Light';
                if (badge) badge.innerHTML = '<i class="fas fa-sun"></i> Light';
                btn.setAttribute('title', 'Switch to Dark Mode');
            } else {
                if (icon) icon.className = 'fas fa-moon moon-icon';
                if (label) label.textContent = 'Dark';
                if (badge) badge.innerHTML = '<i class="fas fa-moon"></i> Dark';
                btn.setAttribute('title', 'Switch to Light Mode');
            }
        });
    }

    // Mobile Sidebar Navigation Drawer System
    function setupMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const menuToggleBtns = document.querySelectorAll('.mobile-menu-toggle');
        
        if (!sidebar) return;

        // Create overlay if not present
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
        }

        const openSidebar = () => {
            sidebar.classList.add('mobile-open');
            overlay.classList.add('active');
            document.body.classList.add('sidebar-active-lock');
        };

        const closeSidebar = () => {
            sidebar.classList.remove('mobile-open');
            overlay.classList.remove('active');
            document.body.classList.remove('sidebar-active-lock');
        };

        menuToggleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (sidebar.classList.contains('mobile-open')) {
                    closeSidebar();
                } else {
                    openSidebar();
                }
            });
        });

        overlay.addEventListener('click', closeSidebar);

        // Close sidebar on esc key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('mobile-open')) {
                closeSidebar();
            }
        });

        // Close sidebar when clicking nav links on mobile
        sidebar.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 992) {
                    closeSidebar();
                }
            });
        });
    }

    // Interactive Crazy Particle & Aurora Background Canvas System
    function initCrazyBackgroundCanvas() {
        let canvas = document.getElementById('heroBgCanvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'heroBgCanvas';
            canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:0;opacity:0.85;transition:opacity 0.5s ease;';
            document.body.prepend(canvas);
        }

        const ctx = canvas.getContext('2d');
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        let mouse = { x: width / 2, y: height / 2, active: false };

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            mouse.active = true;
        });

        window.addEventListener('mouseleave', () => {
            mouse.active = false;
        });

        const particleCount = Math.min(Math.floor((width * height) / 16000), 60);
        const particles = [];

        const getColors = () => {
            const theme = document.documentElement.getAttribute('data-theme') || 'light';
            return theme === 'dark' 
                ? ['rgba(0, 229, 255, ', 'rgba(59, 130, 246, ', 'rgba(168, 85, 247, ', 'rgba(244, 63, 94, ']
                : ['rgba(56, 189, 248, ', 'rgba(129, 140, 248, ', 'rgba(236, 72, 153, ', 'rgba(52, 211, 153, '];
        };

        let colors = getColors();

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.radius = Math.random() * 2.5 + 1.2;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.vx = (Math.random() - 0.5) * 0.8;
                this.vy = (Math.random() - 0.5) * 0.8;
                this.alpha = Math.random() * 0.5 + 0.3;
                this.pulseSpeed = 0.015 + Math.random() * 0.02;
                this.angle = Math.random() * Math.PI * 2;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.angle += this.pulseSpeed;
                this.currentAlpha = this.alpha + Math.sin(this.angle) * 0.25;

                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;

                if (mouse.active) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        const force = (150 - dist) / 150;
                        this.x -= (dx / dist) * force * 3;
                        this.y -= (dy / dist) * force * 3;
                    }
                }
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color + Math.max(0.1, Math.min(1, this.currentAlpha)) + ')';
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color + '0.8)';
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);

            // Connect nearby nodes
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 130) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        const opacity = (1 - dist / 130) * 0.28;
                        ctx.strokeStyle = particles[i].color + opacity + ')';
                        ctx.lineWidth = 0.9;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(animate);
        }

        animate();

        // Re-assign colors when theme changes
        const observer = new MutationObserver(() => {
            colors = getColors();
            particles.forEach(p => p.color = colors[Math.floor(Math.random() * colors.length)]);
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }

    // Listen for OS theme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem('erp_theme')) {
                const newTheme = e.matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', newTheme);
                if (document.body) document.body.setAttribute('data-theme', newTheme);
                updateToggleButtons(newTheme);
            }
        });
    }
})();
