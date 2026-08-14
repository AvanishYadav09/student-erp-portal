// Theme Toggle System with LocalStorage Persistence (Default Light & Smooth)
(function () {
    // Apply light theme by default if no preference is saved
    const savedTheme = localStorage.getItem('erp_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    document.addEventListener('DOMContentLoaded', () => {
        if (document.body) {
            document.body.setAttribute('data-theme', savedTheme);
        }
        updateToggleButtons(savedTheme);

        const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', newTheme);
                if (document.body) {
                    document.body.setAttribute('data-theme', newTheme);
                }
                localStorage.setItem('erp_theme', newTheme);
                updateToggleButtons(newTheme);
            });
        });
    });

    function updateToggleButtons(theme) {
        const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
        toggleBtns.forEach(btn => {
            const icon = btn.querySelector('i');
            const label = btn.querySelector('.theme-label');
            if (theme === 'light') {
                if (icon) icon.className = 'fas fa-sun';
                if (label) label.textContent = 'Light Mode';
                btn.setAttribute('title', 'Switch to Dark Mode');
            } else {
                if (icon) icon.className = 'fas fa-moon';
                if (label) label.textContent = 'Dark Mode';
                btn.setAttribute('title', 'Switch to Light Mode');
            }
        });
    }
})();
