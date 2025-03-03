/**
 * Car City - Custom JavaScript
 * Interactive features and animations for car resale business website
 */

document.addEventListener('DOMContentLoaded', function() {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
            navbar.classList.add('glass-nav');
        } else {
            navbar.classList.remove('scrolled');
            navbar.classList.remove('glass-nav');
        }
    });
    
    // Initialize AOS animations with enhanced settings
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: false,
        mirror: true,
        offset: 50
    });
    
    // Add smooth scrolling to all links
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
    
    // Grid/List view toggle
    const gridViewBtn = document.getElementById('grid-view');
    const listViewBtn = document.getElementById('list-view');
    const carGrid = document.getElementById('car-grid');
    
    if (gridViewBtn && listViewBtn && carGrid) {
        // Set default view from localStorage or use grid view
        const savedView = localStorage.getItem('carCityViewPreference') || 'grid';
        if (savedView === 'list') {
            listViewBtn.classList.add('active');
            gridViewBtn.classList.remove('active');
            carGrid.classList.add('list-view');
        } else {
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
            carGrid.classList.remove('list-view');
        }
        
        // Grid view button click handler
        gridViewBtn.addEventListener('click', function() {
            this.classList.add('active');
            listViewBtn.classList.remove('active');
            carGrid.classList.remove('list-view');
            localStorage.setItem('carCityViewPreference', 'grid');
        });
        
        // List view button click handler
        listViewBtn.addEventListener('click', function() {
            this.classList.add('active');
            gridViewBtn.classList.remove('active');
            carGrid.classList.add('list-view');
            localStorage.setItem('carCityViewPreference', 'list');
        });
    }
    
    // Car filter functionality (for browse.html)
    const filterForm = document.getElementById('car-filter-form');
    if (filterForm) {
        // Add event listeners to all filter inputs for automatic filtering
        const filterInputs = filterForm.querySelectorAll('select, input');
        filterInputs.forEach(input => {
            input.addEventListener('change', function() {
                filterCars();
            });
        });
        
        // Keep the submit event for the Apply button
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            filterCars();
        });
        
        // Reset filters
        const resetButton = document.getElementById('reset-filters');
        if (resetButton) {
            resetButton.addEventListener('click', function() {
                filterForm.reset();
                filterCars();
            });
        }
        
        // Clear filters button in no results message
        const clearFiltersButton = document.getElementById('clear-filters');
        if (clearFiltersButton) {
            clearFiltersButton.addEventListener('click', function() {
                filterForm.reset();
                filterCars();
            });
        }
    }
    
    // Pagination functionality
    setupPagination();
    
    // Car search functionality
    const searchInput = document.getElementById('car-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            filterCars();
        }, 300));
    }
    
    // Car image gallery (for car-details.html)
    const mainImage = document.getElementById('main-car-image');
    const thumbnails = document.querySelectorAll('.car-thumbnail');
    
    if (mainImage && thumbnails.length > 0) {
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', function() {
                // Remove active class from all thumbnails
                thumbnails.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked thumbnail
                this.classList.add('active');
                
                // Update main image
                const newSrc = this.getAttribute('data-src');
                mainImage.src = newSrc;
                
                // Add fade effect
                mainImage.classList.add('fade');
                setTimeout(() => {
                    mainImage.classList.remove('fade');
                }, 300);
            });
        });
    }
    
    // EMI Calculator (already implemented in index.html)
    
    // Contact form validation
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation
            let isValid = true;
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            
            if (!nameInput.value.trim()) {
                showError(nameInput, 'Please enter your name');
                isValid = false;
            } else {
                removeError(nameInput);
            }
            
            if (!emailInput.value.trim()) {
                showError(emailInput, 'Please enter your email');
                isValid = false;
            } else if (!isValidEmail(emailInput.value)) {
                showError(emailInput, 'Please enter a valid email');
                isValid = false;
            } else {
                removeError(emailInput);
            }
            
            if (!messageInput.value.trim()) {
                showError(messageInput, 'Please enter your message');
                isValid = false;
            } else {
                removeError(messageInput);
            }
            
            if (isValid) {
                // Show success message (in a real app, you would submit the form)
                const successMessage = document.createElement('div');
                successMessage.className = 'alert alert-success mt-3';
                successMessage.textContent = 'Your message has been sent successfully! We will contact you soon.';
                
                contactForm.appendChild(successMessage);
                contactForm.reset();
                
                // Remove success message after 5 seconds
                setTimeout(() => {
                    successMessage.remove();
                }, 5000);
            }
        });
    }
    
    // Newsletter subscription
    const newsletterForm = document.querySelector('footer form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            if (!emailInput.value.trim() || !isValidEmail(emailInput.value)) {
                alert('Please enter a valid email address');
                return;
            }
            
            // Show success message (in a real app, you would submit the form)
            const button = newsletterForm.querySelector('button');
            const originalText = button.textContent;
            
            button.textContent = 'Subscribed!';
            button.disabled = true;
            
            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
                emailInput.value = '';
            }, 3000);
        });
    }
    
    // Add parallax effect to hero section
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        window.addEventListener('scroll', function() {
            const scrollPosition = window.scrollY;
            heroSection.style.backgroundPositionY = scrollPosition * 0.5 + 'px';
        });
    }
    
    // Add tilt effect to car cards
    const carCards = document.querySelectorAll('.car-card');
    carCards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const cardRect = card.getBoundingClientRect();
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const cardCenterY = cardRect.top + cardRect.height / 2;
            const mouseX = e.clientX - cardCenterX;
            const mouseY = e.clientY - cardCenterY;
            
            const rotateX = mouseY * -0.05;
            const rotateY = mouseX * 0.05;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
    
    // Add counter animation to statistics
    const counters = document.querySelectorAll('.counter');
    if (counters.length > 0) {
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.getAttribute('data-target'));
                    const duration = 2000; // 2 seconds
                    const step = target / (duration / 16); // 60fps
                    
                    let current = 0;
                    const updateCounter = () => {
                        current += step;
                        if (current < target) {
                            counter.textContent = Math.floor(current);
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.textContent = target;
                        }
                    };
                    
                    updateCounter();
                    observer.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }
    
    // Add image comparison slider
    const imageComparisonSliders = document.querySelectorAll('.image-comparison');
    imageComparisonSliders.forEach(slider => {
        const beforeImage = slider.querySelector('.before-image');
        const afterImage = slider.querySelector('.after-image');
        const sliderHandle = slider.querySelector('.slider-handle');
        
        slider.addEventListener('mousemove', function(e) {
            const sliderRect = slider.getBoundingClientRect();
            const position = (e.clientX - sliderRect.left) / sliderRect.width;
            const percentage = Math.max(0, Math.min(1, position)) * 100;
            
            afterImage.style.width = `${percentage}%`;
            sliderHandle.style.left = `${percentage}%`;
        });
    });
    
    // Add lazy loading for images
    const lazyImages = document.querySelectorAll('.lazy-image');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy-image');
                    img.classList.add('fade-in');
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // Add typing animation for hero text
    const heroText = document.querySelector('.hero-typing-text');
    if (heroText) {
        const text = heroText.textContent;
        heroText.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                heroText.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        
        typeWriter();
    }
    
    // Floating Contact Button
    const floatingContact = document.getElementById('floating-contact');
    const floatingContactMenu = document.getElementById('floating-contact-menu');
    
    if (floatingContact && floatingContactMenu) {
        floatingContact.addEventListener('click', function() {
            floatingContactMenu.classList.toggle('active');
            floatingContact.classList.toggle('pulse');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!floatingContact.contains(e.target) && !floatingContactMenu.contains(e.target)) {
                floatingContactMenu.classList.remove('active');
                if (!floatingContact.classList.contains('pulse')) {
                    floatingContact.classList.add('pulse');
                }
            }
        });
    }
    
    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const darkModeIcon = darkModeToggle.querySelector('i');
    
    // Check for saved theme preference or use device preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    if (savedTheme === 'light' || (!savedTheme && !prefersDarkScheme.matches)) {
        document.body.classList.add('light-mode');
        darkModeIcon.classList.remove('fa-sun');
        darkModeIcon.classList.add('fa-moon');
    }
    
    darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('light-mode');
        
        // Update icon
        if (document.body.classList.contains('light-mode')) {
            darkModeIcon.classList.remove('fa-sun');
            darkModeIcon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light');
        } else {
            darkModeIcon.classList.remove('fa-moon');
            darkModeIcon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark');
        }
    });
    
    // Initialize car image navigation
    initCarImageNavigation();
});

/**
 * Initialize car image navigation functionality
 * This handles the navigation arrows for car images in both grid view and details page
 */
function initCarImageNavigation() {
    console.log('Initializing car image navigation');
    
    // Delegate event handling to the document for dynamically added elements
    document.addEventListener('click', function(e) {
        // Handle previous image button click
        if (e.target.closest('.prev-image')) {
            const button = e.target.closest('.prev-image');
            navigateCarImage(button, 'prev');
        }
        
        // Handle next image button click
        if (e.target.closest('.next-image')) {
            const button = e.target.closest('.next-image');
            navigateCarImage(button, 'next');
        }
    });
    
    // Make image navigation visible on hover for grid view
    document.querySelectorAll('.car-image-container').forEach(container => {
        container.addEventListener('mouseenter', function() {
            const nav = this.querySelector('.image-navigation');
            if (nav) {
                nav.style.opacity = '1';
            }
        });
        
        container.addEventListener('mouseleave', function() {
            const nav = this.querySelector('.image-navigation:not(.details-page-nav)');
            if (nav) {
                nav.style.opacity = '0';
            }
        });
    });
}

/**
 * Navigate to the previous or next car image
 * @param {HTMLElement} button The clicked navigation button
 * @param {string} direction 'prev' or 'next'
 */
function navigateCarImage(button, direction) {
    console.log('Navigating car image:', direction);
    
    const carId = button.getAttribute('data-car-id');
    let currentIndex = parseInt(button.getAttribute('data-index'));
    console.log('Car ID:', carId, 'Current index:', currentIndex);
    
    // Find the image container
    const container = button.closest('.car-image-container') || button.closest('.main-image-container');
    if (!container) {
        console.error('Could not find image container');
        return;
    }
    
    const imageData = container.querySelector('.image-data');
    const mainImage = container.querySelector('.car-main-image') || container.querySelector('#main-car-image');
    const currentIndexEl = container.querySelector('.current-index') || 
                          container.closest('.image-indicator')?.querySelector('.current-index') ||
                          document.querySelector('.current-index');
    
    console.log('Container:', container);
    console.log('Image data element:', imageData);
    console.log('Main image element:', mainImage);
    console.log('Current index element:', currentIndexEl);
    
    if (!imageData || !mainImage) {
        console.error('Missing required elements for image navigation');
        return;
    }
    
    // Get all images for this car
    let images;
    try {
        images = JSON.parse(imageData.getAttribute('data-images'));
        console.log('Parsed images for navigation:', images);
    } catch (error) {
        console.error('Error parsing image data:', error);
        return;
    }
    
    if (!images || images.length <= 1) {
        console.log('Not enough images for navigation');
        return;
    }
    
    console.log('Current index:', currentIndex, 'Total images:', images.length);
    
    // Calculate the new index
    let newIndex;
    if (direction === 'prev') {
        newIndex = (currentIndex - 1 + images.length) % images.length;
    } else {
        newIndex = (currentIndex + 1) % images.length;
    }
    
    console.log('New index:', newIndex, 'New image:', images[newIndex]);
    
    // Update the image with a transition effect
    mainImage.classList.add('changing');
    setTimeout(() => {
        mainImage.src = images[newIndex];
        mainImage.classList.remove('changing');
    }, 300);
    
    // Update the index on both navigation buttons
    container.querySelectorAll('.image-nav').forEach(nav => {
        nav.setAttribute('data-index', newIndex);
    });
    
    // Update the indicator
    if (currentIndexEl) {
        currentIndexEl.textContent = newIndex + 1;
    }
    
    // If we're on the details page, also update the gallery thumbnails
    const thumbnails = document.querySelectorAll('.car-thumbnail');
    if (thumbnails.length > 0) {
        console.log('Updating thumbnails. Total thumbnails:', thumbnails.length);
        thumbnails.forEach((thumbnail, index) => {
            if (index === newIndex) {
                thumbnail.classList.add('active');
                console.log(`Set thumbnail ${index} as active`);
            } else {
                thumbnail.classList.remove('active');
            }
        });
    }
}

// Helper Functions

// Filter cars based on form inputs
function filterCars() {
    console.log('filterCars function called');
    const searchTerm = document.getElementById('car-search')?.value.toLowerCase() || '';
    const make = document.getElementById('make')?.value.toLowerCase() || '';
    const bodyType = document.getElementById('body-type')?.value.toLowerCase() || '';
    const priceMin = parseFloat(document.getElementById('price-min')?.value) || 0;
    const priceMax = parseFloat(document.getElementById('price-max')?.value) || 9999999;
    const yearMin = parseInt(document.getElementById('year-min')?.value) || 0;
    const yearMax = parseInt(document.getElementById('year-max')?.value) || 9999;
    const fuelType = document.getElementById('fuel-type')?.value.toLowerCase() || 'all';
    const transmission = document.getElementById('transmission')?.value.toLowerCase() || 'all';
    const kilometers = document.getElementById('kilometers')?.value || '';
    
    console.log('Filtering with criteria:', {
        searchTerm, make, bodyType, priceMin, priceMax, yearMin, yearMax, fuelType, transmission, kilometers
    });
    
    // Try multiple selectors to find car elements
    let carElements = document.querySelectorAll('.col-md-6.col-lg-4.mb-4');
    console.log(`Found ${carElements.length} car elements with primary selector`);
    
    if (carElements.length === 0) {
        carElements = document.querySelectorAll('.col-md-6.col-lg-4');
        console.log(`Found ${carElements.length} car elements with secondary selector`);
    }
    
    if (carElements.length === 0) {
        carElements = document.querySelectorAll('[data-make]');
        console.log(`Found ${carElements.length} car elements with data-make attribute`);
    }
    
    if (carElements.length === 0) {
        console.error('No car elements found with any selector. Check the HTML structure.');
        return;
    }
    
    // Process the car elements
    let visibleCount = 0;
    
    carElements.forEach((cardElement, index) => {
        console.log(`Processing car element ${index + 1}`);
        
        const card = cardElement.querySelector('.car-card');
        if (!card) {
            console.log(`No car card found in element ${index + 1}`);
            return;
        }
        
        const title = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
        const price = parseFloat(cardElement.getAttribute('data-price') || '0');
        const year = parseInt(cardElement.getAttribute('data-year') || '0');
        const fuel = cardElement.getAttribute('data-fuel')?.toLowerCase() || '';
        const trans = cardElement.getAttribute('data-transmission')?.toLowerCase() || '';
        const cardMake = cardElement.getAttribute('data-make')?.toLowerCase() || '';
        const cardBodyType = cardElement.getAttribute('data-body-type')?.toLowerCase() || '';
        const cardKilometers = parseInt(cardElement.getAttribute('data-kilometers') || '0');
        
        console.log(`Car ${index + 1} data:`, {
            title, price, year, fuel, trans, cardMake, cardBodyType, cardKilometers
        });
        
        // Check if the car matches the search term
        const matchesSearch = searchTerm === '' || 
                            title.includes(searchTerm) || 
                            cardMake.includes(searchTerm);
        
        // Check if the car matches the make filter
        const matchesMake = make === '' || cardMake === make;
        
        // Check if the car matches the body type filter
        const matchesBodyType = bodyType === '' || cardBodyType === bodyType;
        
        // Check if the car matches the price range
        const matchesPrice = price >= priceMin && (priceMax === 9999999 || price <= priceMax);
        
        // Check if the car matches the year range
        const matchesYear = year >= yearMin && (yearMax === 9999 || year <= yearMax);
        
        // Check if the car matches the fuel type
        const matchesFuel = fuelType === 'all' || fuel === fuelType;
        
        // Check if the car matches the transmission
        const matchesTransmission = transmission === 'all' || trans === transmission;
        
        // Check if the car matches the kilometers range
        let matchesKilometers = true;
        if (kilometers !== '') {
            const [minKm, maxKm] = kilometers.split('-').map(k => parseInt(k));
            matchesKilometers = cardKilometers >= minKm && cardKilometers <= maxKm;
        }
        
        const isVisible = matchesSearch && matchesMake && matchesBodyType && matchesPrice && 
                        matchesYear && matchesFuel && matchesTransmission && matchesKilometers;
        
        console.log(`Car ${index + 1} visibility check:`, {
            matchesSearch, matchesMake, matchesBodyType, matchesPrice, matchesYear, 
            matchesFuel, matchesTransmission, matchesKilometers, isVisible
        });
        
        if (isVisible) {
            cardElement.style.display = 'block';
            visibleCount++;
            
            // Add staggered animation
            card.style.animationDelay = `${visibleCount * 0.1}s`;
            card.classList.add('animate-fadeInUp');
        } else {
            cardElement.style.display = 'none';
            card.classList.remove('animate-fadeInUp');
        }
    });
    
    // Show/hide no results message
    const noResultsMessage = document.getElementById('no-results');
    if (noResultsMessage) {
        noResultsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
    }
    
    // Update results count
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        resultsCount.textContent = `Showing ${visibleCount} vehicles`;
    }
    
    // Reset pagination after filtering
    if (typeof setupPagination === 'function') {
        setupPagination();
    }
    
    console.log(`Filtering complete. ${visibleCount} cars visible.`);
}

// Form validation helpers
function showError(input, message) {
    const formGroup = input.closest('.mb-3');
    const errorElement = formGroup.querySelector('.invalid-feedback') || document.createElement('div');
    
    errorElement.className = 'invalid-feedback';
    errorElement.textContent = message;
    
    if (!formGroup.querySelector('.invalid-feedback')) {
        formGroup.appendChild(errorElement);
    }
    
    input.classList.add('is-invalid');
}

function removeError(input) {
    input.classList.remove('is-invalid');
}

function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
}

// Debounce function to limit how often a function can be called
function debounce(func, delay) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// Pagination functionality
function setupPagination() {
    const carGrid = document.getElementById('car-grid');
    if (!carGrid) return;
    
    const carCards = carGrid.querySelectorAll('.car-card');
    const carsPerPage = 6; // Show 6 cars per page
    const totalPages = Math.ceil(carCards.length / carsPerPage);
    
    // Create pagination if more than one page
    if (totalPages > 1) {
        const paginationElement = document.querySelector('.pagination');
        if (paginationElement) {
            // Clear existing pagination
            paginationElement.innerHTML = '';
            
            // Previous button
            const prevLi = document.createElement('li');
            prevLi.className = 'page-item';
            prevLi.innerHTML = '<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>';
            paginationElement.appendChild(prevLi);
            
            // Page numbers
            for (let i = 1; i <= totalPages; i++) {
                const pageLi = document.createElement('li');
                pageLi.className = 'page-item' + (i === 1 ? ' active' : '');
                pageLi.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
                paginationElement.appendChild(pageLi);
            }
            
            // Next button
            const nextLi = document.createElement('li');
            nextLi.className = 'page-item';
            nextLi.innerHTML = '<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>';
            paginationElement.appendChild(nextLi);
            
            // Add event listeners to pagination links
            paginationElement.querySelectorAll('.page-link').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Handle previous and next buttons
                    if (this.getAttribute('aria-label') === 'Previous') {
                        const activePage = paginationElement.querySelector('.page-item.active');
                        const prevPage = activePage.previousElementSibling;
                        if (prevPage && prevPage.querySelector('.page-link').getAttribute('data-page')) {
                            changePage(parseInt(prevPage.querySelector('.page-link').getAttribute('data-page')));
                        }
                        return;
                    }
                    
                    if (this.getAttribute('aria-label') === 'Next') {
                        const activePage = paginationElement.querySelector('.page-item.active');
                        const nextPage = activePage.nextElementSibling;
                        if (nextPage && nextPage.querySelector('.page-link').getAttribute('data-page')) {
                            changePage(parseInt(nextPage.querySelector('.page-link').getAttribute('data-page')));
                        }
                        return;
                    }
                    
                    // Handle number buttons
                    const pageNum = parseInt(this.getAttribute('data-page'));
                    if (pageNum) {
                        changePage(pageNum);
                    }
                });
            });
            
            // Initially show only first page
            changePage(1);
        }
    }
}

function changePage(pageNum) {
    const carGrid = document.getElementById('car-grid');
    if (!carGrid) return;
    
    const carCards = carGrid.querySelectorAll('.col-md-6.col-lg-4');
    const carsPerPage = 6; // Show 6 cars per page
    const totalPages = Math.ceil(carCards.length / carsPerPage);
    
    // Update active page in pagination
    const paginationElement = document.querySelector('.pagination');
    if (paginationElement) {
        paginationElement.querySelectorAll('.page-item').forEach(item => {
            item.classList.remove('active');
            const link = item.querySelector('.page-link');
            if (link && link.getAttribute('data-page') == pageNum) {
                item.classList.add('active');
            }
        });
        
        // Enable/disable previous button
        const prevButton = paginationElement.querySelector('.page-item:first-child');
        if (pageNum === 1) {
            prevButton.classList.add('disabled');
        } else {
            prevButton.classList.remove('disabled');
        }
        
        // Enable/disable next button
        const nextButton = paginationElement.querySelector('.page-item:last-child');
        if (pageNum === totalPages) {
            nextButton.classList.add('disabled');
        } else {
            nextButton.classList.remove('disabled');
        }
    }
    
    // Show cars for current page
    const startIndex = (pageNum - 1) * carsPerPage;
    const endIndex = startIndex + carsPerPage;
    
    carCards.forEach((card, index) => {
        if (index >= startIndex && index < endIndex) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Scroll to top of car listings
    const carListingsSection = document.querySelector('#car-grid').closest('section');
    if (carListingsSection) {
        window.scrollTo({
            top: carListingsSection.offsetTop - 100,
            behavior: 'smooth'
        });
    }
    
    // Update results count
    updateResultsCount();
}

function updateResultsCount() {
    const resultsCount = document.getElementById('results-count');
    if (!resultsCount) return;
    
    const carGrid = document.getElementById('car-grid');
    if (!carGrid) return;
    
    const visibleCards = Array.from(carGrid.querySelectorAll('.col-md-6.col-lg-4')).filter(card => 
        card.style.display !== 'none'
    );
    
    resultsCount.textContent = `Showing ${visibleCards.length} vehicles`;
}