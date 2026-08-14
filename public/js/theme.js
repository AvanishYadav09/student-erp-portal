// Premium Theme Toggle & Mobile Menu Drawer System
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
            // Audio context not allowed or unsupported
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const savedTheme = document.documentElement.getAttribute('data-theme') || initialTheme;
        if (document.body) {
            document.body.setAttribute('data-theme', savedTheme);
        }
        updateToggleButtons(savedTheme);

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

    // Listen for OS theme changes if user hasn't explicitly saved a preference
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
