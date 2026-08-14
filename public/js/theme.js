// Premium Theme Toggle & Interactive Liquid Cyber Background Engine
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

        // Initialize Liquid Cyber & 3D Prism Background Canvas Engine
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

    // Interactive Liquid Cyber & 3D Holographic Prism Background Canvas System
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

        let time = 0;
        const ripples = [];

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        // Trigger interactive shockwave ripples on click or mousemove
        window.addEventListener('click', (e) => {
            createRipple(e.clientX, e.clientY);
        });

        window.addEventListener('mousemove', (e) => {
            if (Math.random() < 0.12) {
                createRipple(e.clientX, e.clientY, true);
            }
        });

        function createRipple(x, y, isSubtle = false) {
            ripples.push({
                x,
                y,
                radius: isSubtle ? 10 : 15,
                maxRadius: isSubtle ? 80 + Math.random() * 50 : 200 + Math.random() * 80,
                alpha: isSubtle ? 0.35 : 0.7,
                color: getThemeGlowColor()
            });
        }

        function getThemeGlowColor() {
            const isDark = (document.documentElement.getAttribute('data-theme') || 'light') === 'dark';
            const colors = isDark 
                ? ['255, 30, 86', '168, 85, 247', '236, 72, 153', '244, 63, 94', '192, 132, 252']
                : ['225, 29, 72', '147, 51, 234', '219, 39, 119', '192, 38, 211', '244, 114, 182'];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        // Floating 3D Geometric Prisms
        class Prism {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = 16 + Math.random() * 24;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotSpeed = (Math.random() - 0.5) * 0.02;
                this.vx = (Math.random() - 0.5) * 0.6;
                this.vy = (Math.random() - 0.5) * 0.6;
                this.alpha = 0.2 + Math.random() * 0.35;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.rotation += this.rotSpeed;

                if (this.x < -40) this.x = width + 40;
                if (this.x > width + 40) this.x = -40;
                if (this.y < -40) this.y = height + 40;
                if (this.y > height + 40) this.y = -40;
            }
            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);

                const rgb = getThemeGlowColor();
                ctx.strokeStyle = `rgba(${rgb}, ${this.alpha})`;
                ctx.fillStyle = `rgba(${rgb}, ${this.alpha * 0.12})`;
                ctx.lineWidth = 1.5;
                ctx.shadowBlur = 14;
                ctx.shadowColor = `rgba(${rgb}, 0.6)`;

                // Draw 3D Wireframe Diamond / Octahedron
                ctx.beginPath();
                ctx.moveTo(0, -this.size);
                ctx.lineTo(this.size * 0.65, 0);
                ctx.lineTo(0, this.size);
                ctx.lineTo(-this.size * 0.65, 0);
                ctx.closePath();
                ctx.stroke();
                ctx.fill();

                // Inner cross line for 3D depth perspective
                ctx.beginPath();
                ctx.moveTo(0, -this.size);
                ctx.lineTo(0, this.size);
                ctx.moveTo(-this.size * 0.65, 0);
                ctx.lineTo(this.size * 0.65, 0);
                ctx.strokeStyle = `rgba(${rgb}, ${this.alpha * 0.45})`;
                ctx.stroke();

                ctx.restore();
            }
        }

        const prisms = Array.from({ length: 16 }, () => new Prism());

        // Liquid Sine Waves Render Function
        function drawLiquidWaves() {
            const isDark = (document.documentElement.getAttribute('data-theme') || 'light') === 'dark';
            const waveConfigs = isDark ? [
                { color: 'rgba(255, 30, 86, 0.07)', speed: 0.008, freq: 0.004, amp: 45, yOffset: height * 0.65 },
                { color: 'rgba(168, 85, 247, 0.08)', speed: 0.012, freq: 0.006, amp: 60, yOffset: height * 0.5 },
                { color: 'rgba(236, 72, 153, 0.07)', speed: 0.006, freq: 0.003, amp: 50, yOffset: height * 0.75 }
            ] : [
                { color: 'rgba(225, 29, 72, 0.08)', speed: 0.008, freq: 0.004, amp: 40, yOffset: height * 0.65 },
                { color: 'rgba(147, 51, 234, 0.07)', speed: 0.012, freq: 0.005, amp: 55, yOffset: height * 0.5 },
                { color: 'rgba(219, 39, 119, 0.06)', speed: 0.006, freq: 0.003, amp: 45, yOffset: height * 0.75 }
            ];

            waveConfigs.forEach(wave => {
                ctx.beginPath();
                ctx.moveTo(0, height);
                for (let x = 0; x <= width; x += 15) {
                    const y = Math.sin(x * wave.freq + time * wave.speed) * wave.amp + wave.yOffset;
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(width, height);
                ctx.closePath();
                ctx.fillStyle = wave.color;
                ctx.fill();
            });
        }

        // Main Render Loop
        function animate() {
            ctx.clearRect(0, 0, width, height);
            time += 1;

            // 1. Draw Liquid Sine Waves
            drawLiquidWaves();

            // 2. Draw Floating 3D Wireframe Prisms
            prisms.forEach(p => {
                p.update();
                p.draw();
            });

            // 3. Draw & Update Interactive Shockwave Ripples
            for (let i = ripples.length - 1; i >= 0; i--) {
                const r = ripples[i];
                r.radius += 2.5;
                r.alpha *= 0.96;

                ctx.beginPath();
                ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${r.color}, ${r.alpha})`;
                ctx.lineWidth = 2;
                ctx.shadowBlur = 18;
                ctx.shadowColor = `rgba(${r.color}, 0.7)`;
                ctx.stroke();

                if (r.alpha <= 0.01 || r.radius >= r.maxRadius) {
                    ripples.splice(i, 1);
                }
            }

            requestAnimationFrame(animate);
        }

        animate();
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
