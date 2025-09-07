// ======================================================================
// THEME TOGGLE FUNCTIONALITY
// Handles light/dark mode switching with system preference detection
// ======================================================================

class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById("theme-toggle");
    this.prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

    this.init();
  }

  init() {
    // Load saved theme or use system preference
    const savedTheme = localStorage.getItem("theme");
    const initialTheme =
      savedTheme || (this.prefersDark.matches ? "dark" : "light");

    this.setTheme(initialTheme);
    this.bindEvents();
  }

  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    this.themeToggle.classList.toggle("dark", theme === "dark");
    this.themeToggle.setAttribute("aria-checked", theme === "dark");

    // Save theme preference
    localStorage.setItem("theme", theme);
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    this.setTheme(newTheme);
  }

  bindEvents() {
    this.themeToggle.addEventListener("click", () => this.toggleTheme());

    // Listen for system theme changes
    this.prefersDark.addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        this.setTheme(e.matches ? "dark" : "light");
      }
    });
  }
}

// ======================================================================
// MOBILE NAVIGATION
// Responsive menu handling for smaller screens
// ======================================================================

class MobileNavigation {
  constructor() {
    this.hamburger = document.getElementById("mobile-menu-toggle");
    this.navMenu = document.querySelector(".nav-menu");

    this.init();
  }

  init() {
    this.bindEvents();
  }

  toggleMenu() {
    this.hamburger.classList.toggle("active");
    this.navMenu.classList.toggle("active");

    // Update accessibility attributes
    const isOpen = this.navMenu.classList.contains("active");
    this.hamburger.setAttribute("aria-expanded", isOpen);
  }

  closeMenu() {
    this.hamburger.classList.remove("active");
    this.navMenu.classList.remove("active");
    this.hamburger.setAttribute("aria-expanded", "false");
  }

  bindEvents() {
    this.hamburger.addEventListener("click", () => this.toggleMenu());

    // Close menu when clicking on nav links
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => this.closeMenu());
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".navbar")) {
        this.closeMenu();
      }
    });
  }
}

// ======================================================================
// SMOOTH SCROLLING
// Enhanced smooth scrolling with offset for fixed header
// ======================================================================

class SmoothScroll {
  constructor() {
    this.headerHeight = 80; // Height of fixed navbar
    this.init();
  }

  init() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const href = anchor.getAttribute("href");
        if (href === "#") return;

        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
          const targetPosition = target.offsetTop - this.headerHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });
        }
      });
    });
  }
}

// ======================================================================
// INTERSECTION OBSERVER
// Animate elements as they come into view
// ======================================================================

class ScrollAnimations {
  constructor() {
    this.observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    this.init();
  }

  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    }, this.observerOptions);

    // Observe elements with animation
    document
      .querySelectorAll(".project-card, .skill-item, .glass-card")
      .forEach((el) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        observer.observe(el);
      });
  }
}

// ======================================================================
// FORM HANDLING
// Contact form submission with basic validation
// ======================================================================

class ContactForm {
  constructor() {
    this.form = document.querySelector(".contact-form");
    this.init();
  }

  init() {
    if (this.form) {
      this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);

    // Basic validation
    if (!this.validateForm(data)) {
      return;
    }

    // Simulate form submission
    this.showSuccess();
    this.form.reset();
  }

  validateForm(data) {
    const { name, email, subject, message } = data;

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      alert("Please fill in all fields.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return false;
    }

    return true;
  }

  showSuccess() {
    const button = this.form.querySelector('button[type="submit"]');
    const originalText = button.innerHTML;

    button.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
    button.style.background = "linear-gradient(135deg, #10b981, #059669)";

    setTimeout(() => {
      button.innerHTML = originalText;
      button.style.background = "";
    }, 3000);
  }
}

// ======================================================================
// INITIALIZATION
// Initialize all functionality when DOM is loaded
// ======================================================================

document.addEventListener("DOMContentLoaded", () => {
  new ThemeManager();
  new MobileNavigation();
  new SmoothScroll();
  new ScrollAnimations();
  new ContactForm();
});

// ======================================================================
// PERFORMANCE OPTIMIZATIONS
// Lazy loading and performance enhancements
// ======================================================================

// Preload critical resources
const criticalResources = [
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
];

criticalResources.forEach((url) => {
  const link = document.createElement("link");
  link.rel = "preload";
  link.href = url;
  link.as = "style";
  link.onload = function () {
    this.rel = "stylesheet";
  };
  document.head.appendChild(link);
});
