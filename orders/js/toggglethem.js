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
  
  
  // ==== Rest of your existing admin.js ====
  document.addEventListener('DOMContentLoaded', () => {
    // Hook the toggle button
    document.querySelector('.theme-toggle')
      .addEventListener('click', themeToggle);
  
    // Sidebar Navigation Tab Switching
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a[data-tab]');
    const mainTabContents = document.querySelectorAll('.tab-content');
    sidebarLinks.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        sidebarLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        mainTabContents.forEach(c => c.classList.remove('active'));
        document.getElementById(link.getAttribute('data-tab'))
          .classList.add('active');
      });
    });
  
    // Menu Item Tabs
    const menuTabs = document.querySelectorAll('[data-menu-tab]');
    const menuTabContents = document.querySelectorAll('.menu-tab-content');
    menuTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        menuTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        menuTabContents.forEach(c => c.classList.remove('active'));
        document.getElementById(`${tab.dataset.menuTab}-content`)
          .classList.add('active');
      });
    });
  
    // Order Tabs
    const orderTabs = document.querySelectorAll('[data-order-tab]');
    const orderContents = document.querySelectorAll('.order-tab-content');
    orderTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        orderTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        orderContents.forEach(c => c.classList.remove('active'));
        document.getElementById(`${tab.dataset.orderTab}-orders`)
          .classList.add('active');
      });
    });
  
    // Modals Config
    const modals = {
      menu: ['add-menu-item-btn', 'menuItemModalBackdrop', 'menuItemModalClose', 'menuItemForm'],
      gallery: ['add-gallery-item-btn', 'galleryItemModalBackdrop', 'galleryItemModalClose', 'galleryItemForm'],
      message: [null, 'messageModalBackdrop', 'messageModalClose', null, '.view-message-btn']
    };
  
    // Initialize each modal
    Object.values(modals).forEach(cfg => {
      const [openBtnId, backdropId, closeBtnId, formId, viewBtnSel] = cfg;
      const backdrop = document.getElementById(backdropId);
      if (openBtnId) document.getElementById(openBtnId)
        .addEventListener('click', () => backdrop.classList.add('active'));
      if (closeBtnId) document.getElementById(closeBtnId)
        .addEventListener('click', () => backdrop.classList.remove('active'));
      if (formId) document.getElementById(formId)
        .addEventListener('submit', e => { e.preventDefault(); backdrop.classList.remove('active'); });
      if (viewBtnSel) document.querySelectorAll(viewBtnSel)
        .forEach(btn => btn.addEventListener('click', () => backdrop.classList.add('active')));
    });
  
    // Settings Form
    document.getElementById('settingsForm')
      .addEventListener('submit', e => { e.preventDefault(); /* TODO: save */ });
  });
  