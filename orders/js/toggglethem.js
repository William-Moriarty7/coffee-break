function themeToggle() {
    const body = document.body;
    const app = document.getElementById('app');

    // Toggle between light-mode and dark-mode
    if (body.classList.contains("light-mode")) {
        body.classList.remove("light-mode");
        body.classList.add("dark-mode");
        app.classList.remove("light-mode");
        app.classList.add("dark-mode");
        localStorage.setItem("theme-preference", "dark");
    } else {
        body.classList.remove("dark-mode");
        body.classList.add("light-mode");
        app.classList.remove("dark-mode");
        app.classList.add("light-mode");
        localStorage.setItem("theme-preference", "light");
    }

    // Get the new current theme
    const currentTheme = body.classList.contains("dark-mode") ? "dark" : "light";

    // Update the sun and moon icons
    document.querySelectorAll('.theme-toggle .sun').forEach(sun => {
        sun.style.transform = currentTheme === 'dark' ? 'translateY(-40px)' : 'translateY(0)';
        sun.style.opacity = currentTheme === 'dark' ? '0' : '1';
    });

    document.querySelectorAll('.theme-toggle .moon').forEach(moon => {
        moon.style.transform = currentTheme === 'dark' ? 'translateY(0)' : 'translateY(40px)';
        moon.style.opacity = currentTheme === 'dark' ? '1' : '0';
    });
}

window.themeToggle = themeToggle;

function applySavedTheme() {
    const body = document.body;
    const app = document.getElementById('app');
    const savedTheme = localStorage.getItem('theme-preference');
    if (!savedTheme) {
        // Default to light mode if no preference is saved
        body.classList.add("dark-mode");
        app.classList.add("dark-mode");
        return;
    }
    if (savedTheme === 'dark') {
        body.classList.remove("light-mode");
        body.classList.add("dark-mode");
        app.classList.remove("light-mode");
        app.classList.add("dark-mode");
    } else {
        body.classList.remove("dark-mode");
        body.classList.add("light-mode");
        app.classList.remove("dark-mode");
        app.classList.add("light-mode");
    }
}

// Apply the saved theme immediately
applySavedTheme();
