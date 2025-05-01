// ==== Theme Persistence & Animation ====
function themeToggle() {
    const body = document.body;
    const app = document.getElementById('app');
  
    // Toggle between light-mode and dark-mode
    if (body.classList.contains("light-mode")) {
      body.classList.replace("light-mode", "dark-mode");
      app.classList.replace("light-mode", "dark-mode");
      localStorage.setItem("theme-preference", "dark");
    } else {
      body.classList.replace("dark-mode", "light-mode");
      app.classList.replace("dark-mode", "light-mode");
      localStorage.setItem("theme-preference", "light");
    }
  
    // Get the new current theme
    const currentTheme = body.classList.contains("dark-mode") ? "dark" : "light";
  
    // Animate sun and moon icons
    document.querySelectorAll('.theme-toggle .sun').forEach(sun => {
      sun.style.transform = currentTheme === 'dark'
        ? 'translateY(-40px)'
        : 'translateY(0)';
      sun.style.opacity = currentTheme === 'dark' ? '0' : '1';
    });
    document.querySelectorAll('.theme-toggle .moon').forEach(moon => {
      moon.style.transform = currentTheme === 'dark'
        ? 'translateY(0)'
        : 'translateY(40px)';
      moon.style.opacity = currentTheme === 'dark' ? '1' : '0';
    });
  }
  
  function applySavedTheme() {
    const body = document.body;
    const app = document.getElementById('app');
    const saved = localStorage.getItem('theme-preference');
    // Default to dark if none
    const useDark = !saved || saved === 'dark';
  
    body.classList.toggle("dark-mode", useDark);
    body.classList.toggle("light-mode", !useDark);
    app.classList.toggle("dark-mode", useDark);
    app.classList.toggle("light-mode", !useDark);
  }
  
  // Expose and apply on load
  window.themeToggle = themeToggle;
  applySavedTheme();
  
  
