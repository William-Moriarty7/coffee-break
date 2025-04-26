const menu = document.querySelector(".nav-links");
const menuBtn = document.querySelector(".mobile-menu-toggle");
const navLinks = document.querySelectorAll(".nav-links a");

function mobileMenu() {
  menuBtn.classList.toggle("active");
  menu.classList.toggle("active");
}

function closeMenu() {
  menu.classList.remove("active");
  menuBtn.classList.remove("active");
}

menuBtn.addEventListener("click", mobileMenu);

navLinks.forEach(link => {
  link.addEventListener("click", closeMenu);
});
