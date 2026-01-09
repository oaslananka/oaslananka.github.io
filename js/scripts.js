/**
 * Portfolio Site JavaScript
 * Handles navigation, theme toggle, animations, and interactions
 */

(function () {
    'use strict';

    // ============================================
    // DOM Elements
    // ============================================
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.getElementById('navbar');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const contactForm = document.getElementById('contact-form');

    // ============================================
    // Theme Management
    // ============================================
    const ThemeManager = {
        STORAGE_KEY: 'theme-preference',

        init() {
            // Check for saved preference, then system preference
            const savedTheme = localStorage.getItem(this.STORAGE_KEY);

            if (savedTheme) {
                this.setTheme(savedTheme);
            } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.setTheme('dark');
            } else {
                this.setTheme('light');
            }

            // Listen for system preference changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem(this.STORAGE_KEY)) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        },

        setTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            this.updateIcon(theme);
            localStorage.setItem(this.STORAGE_KEY, theme);
        },

        updateIcon(theme) {
            if (themeIcon) {
                themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        },

        toggle() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
        }
    };

    // ============================================
    // Navigation
    // ============================================
    const Navigation = {
        init() {
            // Mobile menu toggle
            if (hamburger) {
                hamburger.addEventListener('click', () => this.toggleMobileMenu());
            }

            // Close mobile menu on link click
            navLinks.forEach(link => {
                link.addEventListener('click', () => this.closeMobileMenu());
            });

            // Smooth scrolling for anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => this.smoothScroll(e));
            });

            // Navbar scroll effect
            window.addEventListener('scroll', () => this.handleScroll(), { passive: true });

            // Active section highlighting
            window.addEventListener('scroll', debounce(() => this.highlightActiveSection(), 50), { passive: true });
        },

        toggleMobileMenu() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            hamburger.setAttribute('aria-expanded',
                hamburger.classList.contains('active').toString()
            );
        },

        closeMobileMenu() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        },

        smoothScroll(e) {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('href');
            const target = document.querySelector(targetId);

            if (target) {
                const navHeight = navbar ? navbar.offsetHeight : 70;
                const targetPosition = target.offsetTop - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        },

        handleScroll() {
            if (navbar) {
                if (window.scrollY > 50) {
                    navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
                } else {
                    navbar.style.boxShadow = 'none';
                }
            }
        },

        highlightActiveSection() {
            const sections = document.querySelectorAll('section[id]');
            let current = '';

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                const scrollPosition = window.scrollY + 200;

                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        }
    };

    // ============================================
    // Animations
    // ============================================
    const Animations = {
        init() {
            this.setupScrollAnimations();
            this.setupCounterAnimation();
            this.setupSkillsAnimation();
        },

        setupScrollAnimations() {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            // Observe animated elements
            const animatedElements = document.querySelectorAll(
                '.timeline-item, .project-card, .skill-category, .education-card, ' +
                '.case-study-card, .stack-category, .stat'
            );

            animatedElements.forEach(el => {
                el.classList.add('animate-on-scroll');
                observer.observe(el);
            });

            // Add CSS for animations
            this.injectAnimationStyles();
        },

        injectAnimationStyles() {
            const style = document.createElement('style');
            style.textContent = `
                .animate-on-scroll {
                    opacity: 0;
                    transform: translateY(30px);
                    transition: opacity 0.6s ease, transform 0.6s ease;
                }
                .animate-on-scroll.animate-in {
                    opacity: 1;
                    transform: translateY(0);
                }
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        },

        setupCounterAnimation() {
            const statsObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateCounters();
                        statsObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                statsObserver.observe(aboutSection);
            }
        },

        animateCounters() {
            const counters = document.querySelectorAll('.stat-number');

            counters.forEach(counter => {
                const text = counter.textContent;
                const target = parseInt(text.replace(/\D/g, ''));
                const suffix = text.replace(/\d/g, '');
                let count = 0;
                const increment = target / 50;

                const timer = setInterval(() => {
                    count += increment;
                    if (count >= target) {
                        counter.textContent = target + suffix;
                        clearInterval(timer);
                    } else {
                        counter.textContent = Math.floor(count) + suffix;
                    }
                }, 40);
            });
        },

        setupSkillsAnimation() {
            const skillsObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const skillItems = entry.target.querySelectorAll('.skill-item, .stack-item');
                        skillItems.forEach((item, index) => {
                            setTimeout(() => {
                                item.style.opacity = '1';
                                item.style.transform = 'scale(1)';
                            }, index * 30);
                        });
                        skillsObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });

            const skillsSection = document.getElementById('skills');
            const stackSection = document.getElementById('stack');

            if (skillsSection) skillsObserver.observe(skillsSection);
            if (stackSection) skillsObserver.observe(stackSection);

            // Initialize skill items as hidden
            document.querySelectorAll('.skill-item, .stack-item').forEach(item => {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
                item.style.transition = 'all 0.3s ease';
            });
        }
    };

    // ============================================
    // Contact Form
    // ============================================
    const ContactFormHandler = {
        init() {
            if (contactForm) {
                contactForm.addEventListener('submit', (e) => this.handleSubmit(e));
            }
        },

        handleSubmit(e) {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            // Validation
            if (!name || !email || !message) {
                this.showNotification('Please fill in all fields.', 'error');
                return;
            }

            if (!this.isValidEmail(email)) {
                this.showNotification('Please enter a valid email address.', 'error');
                return;
            }

            // Simulate form submission (replace with actual backend)
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalContent = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            // Simulated delay
            setTimeout(() => {
                this.showNotification('Thank you for your message! I\'ll get back to you soon.', 'success');
                contactForm.reset();
                submitBtn.innerHTML = originalContent;
                submitBtn.disabled = false;
            }, 1500);
        },

        isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },

        showNotification(message, type = 'info') {
            // Remove existing notification
            const existing = document.querySelector('.notification');
            if (existing) existing.remove();

            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;

            const colors = {
                error: '#ef4444',
                success: '#10b981',
                info: '#3b82f6'
            };

            notification.style.cssText = `
                position: fixed;
                top: 90px;
                right: 20px;
                background: ${colors[type]};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 0.5rem;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 1rem;
                font-weight: 500;
                animation: slideIn 0.3s ease;
                max-width: calc(100vw - 40px);
            `;

            notification.innerHTML = `
                <span>${message}</span>
                <button style="background:none;border:none;color:white;font-size:1.2rem;cursor:pointer;padding:0;">&times;</button>
            `;

            notification.querySelector('button').addEventListener('click', () => {
                notification.remove();
            });

            document.body.appendChild(notification);

            // Auto remove after 5 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'slideIn 0.3s ease reverse';
                    setTimeout(() => notification.remove(), 300);
                }
            }, 5000);
        }
    };

    // ============================================
    // Utility Functions
    // ============================================
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ============================================
    // Initialize Everything
    // ============================================
    function init() {
        ThemeManager.init();
        Navigation.init();
        Animations.init();
        ContactFormHandler.init();

        // Theme toggle button
        if (themeToggle) {
            themeToggle.addEventListener('click', () => ThemeManager.toggle());
        }

        console.log('Portfolio site initialized successfully');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
