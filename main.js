//import './style.css';

// DOM Elements
const app = document.querySelector('#app');
const themeToggles = document.querySelectorAll('.theme-toggle');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');
const header = document.querySelector('.header');
const menuTabs = document.querySelectorAll('.menu-tab');
const menuContents = document.querySelectorAll('.menu-tab-content');
const contactForm = document.getElementById('contactForm');
const allAnimElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in, .stagger-item');

// Theme Toggle
function initThemeToggle() {
  // Check for system preference
  const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Check for saved preference
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDarkMode)) {
    app.classList.remove('light-mode');
    app.classList.add('dark-mode');
  } else {
    app.classList.remove('dark-mode');
    app.classList.add('light-mode');
  }
  
  // Add event listeners to all theme toggles
  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      app.classList.toggle('dark-mode');
      app.classList.toggle('light-mode');
      
      const currentTheme = app.classList.contains('dark-mode') ? 'dark' : 'light';
      localStorage.setItem('theme', currentTheme);
    });
  });
  
  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
      if (e.matches) {
        app.classList.remove('light-mode');
        app.classList.add('dark-mode');
      } else {
        app.classList.remove('dark-mode');
        app.classList.add('light-mode');
      }
    }
  });
}

// Mobile Menu Toggle
function initMobileMenu() {
  mobileMenuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    
    // Create overlay if doesn't exist
    let overlay = document.querySelector('.overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'overlay';
      document.body.appendChild(overlay);
      
      overlay.addEventListener('click', () => {
        navLinks.classList.remove('active');
        overlay.classList.remove('active');
      });
    }
    
    overlay.classList.toggle('active');
  });
  
  // Close mobile menu when a link is clicked
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      const overlay = document.querySelector('.overlay');
      if (overlay) {
        overlay.classList.remove('active');
      }
    });
  });
}

// Scroll Events
function initScrollEvents() {
  // Header scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    // Update active nav link based on scroll position
    const scrollPosition = window.scrollY;
    
    document.querySelectorAll('section').forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        document.querySelectorAll('.nav-links a').forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
    
    // Handle scroll animations
    handleScrollAnimations();
  });
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Menu Tabs
function initMenuTabs() {
  menuTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      menuTabs.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Hide all content
      menuContents.forEach(content => content.classList.remove('active'));
      
      // Show selected content
      const tabId = tab.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
}

// Contact Form
function initContactForm() {
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form data
      const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value
      };
      
      // In a real app, you would send this data to a server
      // For demo purposes, show a success message
      contactForm.innerHTML = `
        <div class="success-message">
          <h3>Thank you for your message, ${formData.name}!</h3>
          <p>We'll get back to you soon at ${formData.email}.</p>
        </div>
      `;
    });
  }
}

// Scroll Animations
function handleScrollAnimations() {
  allAnimElements.forEach(element => {
    const elementPos = element.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    
    if (elementPos < windowHeight * 0.9) {
      element.classList.add('visible');
    }
  });
}

// Gallery Lightbox
function initGallery() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const imgSrc = item.querySelector('img').getAttribute('src');
      
      // Create lightbox if it doesn't exist
      let lightbox = document.querySelector('.lightbox');
      if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        
        const lightboxContent = document.createElement('div');
        lightboxContent.className = 'lightbox-content';
        
        const lightboxImg = document.createElement('img');
        lightboxContent.appendChild(lightboxImg);
        
        const closeBtn = document.createElement('div');
        closeBtn.className = 'lightbox-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => {
          lightbox.classList.remove('active');
        });
        
        lightbox.appendChild(lightboxContent);
        lightbox.appendChild(closeBtn);
        document.body.appendChild(lightbox);
        
        // Close on click outside the image
        lightbox.addEventListener('click', (e) => {
          if (e.target === lightbox) {
            lightbox.classList.remove('active');
          }
        });
      }
      
      // Set the image source and open the lightbox
      const lightboxImg = lightbox.querySelector('.lightbox-content img');
      lightboxImg.setAttribute('src', imgSrc);
      lightbox.classList.add('active');
    });
  });
}

// Initialize all functions
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileMenu();
  initScrollEvents();
  initMenuTabs();
  initContactForm();
  initGallery();
  
  // Initial animation check
  setTimeout(handleScrollAnimations, 300);
});