// Theme Toggle Functionality
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;
const themeIcon = themeToggle.querySelector('i');

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

themeToggle.addEventListener('click', () => {
    const theme = html.getAttribute('data-theme');
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    if (theme === 'dark') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
}

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        if (hamburger) {
            hamburger.classList.remove('active');
        }
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Skip if it's just '#'
        if (href === '#') {
            e.preventDefault();
            return;
        }
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add active class to navigation links based on scroll position - Debounced
const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('.nav-links a');
let activeNavTicking = false;

const updateActiveNav = () => {
    if (!activeNavTicking) {
        window.requestAnimationFrame(() => {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (pageYOffset >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });

            navItems.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
            
            activeNavTicking = false;
        });
        activeNavTicking = true;
    }
};

window.addEventListener('scroll', updateActiveNav, { passive: true });

// Initial call
updateActiveNav();

// Form submission handler with validation
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form values
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();

        // Validation
        if (!name || !email || !subject || !message) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        // This is a static site (GitHub Pages), so the form posts to Formspree
        // instead of a custom backend. Replace the form's action URL with your
        // own Formspree endpoint - see DEPLOYMENT.md for setup steps.
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnHTML = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: new FormData(contactForm),
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                showNotification('Thank you for your message! I will get back to you soon.', 'success');
                contactForm.reset();
            } else {
                showNotification('Something went wrong. Please email me directly instead.', 'error');
            }
        } catch (error) {
            showNotification('Network error. Please email me directly instead.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
        }
    });
}

// Notification function
function showNotification(message, type = 'success') {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 600;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Add CSS for notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for animation
const animatedElements = document.querySelectorAll(
    '.about-card, .timeline-item, .skill-category, .project-card, .education-card'
);
animatedElements.forEach(el => observer.observe(el));

// Animate action buttons on scroll
const actionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0) translateX(0)';
            actionObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

const actionButtons = document.querySelectorAll('.project-actions, .timeline-actions');
actionButtons.forEach(btn => actionObserver.observe(btn));

// Navbar scroll behavior - Optimized with requestAnimationFrame
let lastScroll = 0;
const navbar = document.querySelector('.navbar');
let navbarTicking = false;

window.addEventListener('scroll', () => {
    if (!navbarTicking) {
        window.requestAnimationFrame(() => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll <= 0) {
                navbar.classList.remove('scroll-up', 'scroll-down');
                navbarTicking = false;
                return;
            }
            
            if (currentScroll > lastScroll && currentScroll > 100) {
                // Scrolling down
                navbar.classList.remove('scroll-up');
                navbar.classList.add('scroll-down');
            } else if (currentScroll < lastScroll) {
                // Scrolling up
                navbar.classList.remove('scroll-down');
                navbar.classList.add('scroll-up');
            }
            
            lastScroll = currentScroll;
            navbarTicking = false;
        });
        navbarTicking = true;
    }
}, { passive: true });

// Scroll indicator functionality
const scrollIndicator = document.querySelector('.scroll-indicator');
if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
            aboutSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
    
    // Hide scroll indicator after scrolling past hero - Optimized
    let scrollIndTicking = false;
    
    window.addEventListener('scroll', () => {
        if (!scrollIndTicking) {
            window.requestAnimationFrame(() => {
                const heroHeight = document.querySelector('.hero').offsetHeight;
                const opacity = window.pageYOffset > heroHeight - 200 ? '0' : '1';
                scrollIndicator.style.opacity = opacity;
                scrollIndTicking = false;
            });
            scrollIndTicking = true;
        }
    }, { passive: true });
}

// Dynamic year in footer
const footerYear = document.querySelector('.footer-bottom p');
if (footerYear) {
    const currentYear = new Date().getFullYear();
    footerYear.innerHTML = footerYear.innerHTML.replace('2026', currentYear);
}

// Typing effect for hero subtitle (optional) - Disabled on mobile for performance
const heroSubtitle = document.querySelector('.hero-subtitle');
if (heroSubtitle && window.innerWidth > 768) {
    const text = heroSubtitle.textContent;
    heroSubtitle.textContent = '';
    heroSubtitle.style.borderRight = '2px solid white';
    heroSubtitle.style.paddingRight = '4px';
    let i = 0;
    
    const typeWriter = () => {
        if (i < text.length) {
            heroSubtitle.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 60);
        } else {
            // Remove cursor after typing is complete
            setTimeout(() => {
                heroSubtitle.style.borderRight = 'none';
                heroSubtitle.style.paddingRight = '0';
            }, 500);
        }
    };
    
    // Start typing effect after a short delay
    setTimeout(typeWriter, 600);
}

// Add parallax effect to hero section (subtle) - Only on desktop
if (window.innerWidth > 1024) {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const hero = document.querySelector('.hero');
                
                if (hero && scrolled < hero.offsetHeight) {
                    hero.style.transform = `translateY(${scrolled * 0.3}px)`;
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// Skill items hover effect - add animation
const skillItems = document.querySelectorAll('.skill-category li');
skillItems.forEach((item, index) => {
    item.style.animationDelay = `${index * 0.05}s`;
});

// Project tags interaction
const projectTags = document.querySelectorAll('.tag');
projectTags.forEach(tag => {
    tag.addEventListener('click', (e) => {
        e.preventDefault();
        const tagText = tag.textContent.trim();
        console.log(`Clicked on technology: ${tagText}`);
        // You could implement filtering functionality here
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Animate hero content on load
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.animation = 'fadeInUp 0.8s ease-out';
    }
});

// Console easter egg for developers
console.log('%c👋 Hello, Developer!', 'font-size: 24px; font-weight: bold; color: #667eea;');
console.log('%c🔧 Interested in how this was built?', 'font-size: 16px; color: #475569;');
console.log('%cFeel free to explore the code and reach out if you have questions!', 'font-size: 14px; color: #64748b;');
console.log('%c📧 Contact: skafrozahamedtpo@gmail.com', 'font-size: 14px; color: #3b82f6;');

// Performance optimization: Debounce scroll event
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

// Lazy loading images (if you add images later)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Add smooth reveal animation to sections on scroll
const revealSections = document.querySelectorAll('section');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

revealSections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    revealObserver.observe(section);
});

// Prevent hero section from being affected by reveal animation
const heroSection = document.querySelector('.hero');
if (heroSection) {
    heroSection.style.opacity = '1';
    heroSection.style.transform = 'none';
}

// Contact Reveal Functionality
const revealButtons = document.querySelectorAll('.reveal-contact');

revealButtons.forEach(button => {
    let isRevealed = false;
    
    button.addEventListener('click', () => {
        const fullValue = button.dataset.full;
        const hiddenValue = button.dataset.hidden;
        const contactType = button.dataset.type;
        const valueSpan = button.querySelector('.contact-value');
        
        if (!isRevealed) {
            // Reveal full contact
            valueSpan.textContent = fullValue;
            button.classList.add('revealed');
            isRevealed = true;
            
            // Show success notification
            showNotification(`${contactType === 'email' ? 'Email' : 'Phone'} revealed! Click again to copy.`, 'success');
        } else {
            // Copy to clipboard
            copyToClipboard(fullValue).then(() => {
                showNotification(`${contactType === 'email' ? 'Email' : 'Phone'} copied to clipboard!`, 'success');
            }).catch(() => {
                showNotification('Failed to copy. Please select and copy manually.', 'error');
            });
        }
    });
    
    // Hide contact on mouse leave after a delay (optional)
    button.addEventListener('mouseleave', () => {
        if (isRevealed) {
            setTimeout(() => {
                if (!button.matches(':hover')) {
                    const hiddenValue = button.dataset.hidden;
                    const valueSpan = button.querySelector('.contact-value');
                    valueSpan.textContent = hiddenValue;
                    button.classList.remove('revealed');
                    isRevealed = false;
                }
            }, 3000); // Hide after 3 seconds
        }
    });
});

// Copy to clipboard helper function
function copyToClipboard(text) {
    return new Promise((resolve, reject) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .then(resolve)
                .catch(reject);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                const successful = document.execCommand('copy');
                textArea.remove();
                if (successful) {
                    resolve();
                } else {
                    reject();
                }
            } catch (err) {
                textArea.remove();
                reject(err);
            }
        }
    });
}
