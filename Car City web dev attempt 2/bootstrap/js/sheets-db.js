/**
 * Car City - Google Sheets Database Integration
 * This file handles the connection to Google Sheets as a database for car listings
 */

// Configuration - Replace with your own values
const SHEET_ID = '1EkTCSxg_rzZVuepaTQgs7R9BZHJDkmAMttN5h-YzsZI'; // User's Sheet ID
const API_KEY = 'AIzaSyBnoR-UJ4-Oi1vZBvCxo8V9j2dRnVZb3rQ'; // Your API key

// Base URL for Google Sheets API
const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

/**
 * Fetch all car listings from the Google Sheet
 * @returns {Promise<Array>} Array of car objects
 */
async function fetchCarListings() {
    try {
        // Fetch the data from the 'Cars' sheet
        const response = await fetch(
            `${SHEETS_API_BASE}/${SHEET_ID}/values/Cars!A2:N?key=${API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch car listings');
        }
        
        const data = await response.json();
        
        // If no values are returned, return an empty array
        if (!data.values) {
            return [];
        }
        
        // Map the row data to car objects
        return data.values.map(row => {
            return {
                id: row[0] || '',
                make: row[1] || '',
                model: row[2] || '',
                year: parseInt(row[3]) || 0,
                price: parseInt(row[4]) || 0,
                mileage: parseInt(row[5]) || 0,
                fuel: row[6] || '',
                transmission: row[7] || '',
                color: row[8] || '',
                features: (row[9] || '').split(',').map(item => item.trim()),
                description: row[10] || '',
                mainImage: row[11] || '',
                galleryImages: (row[12] || '').split(',').map(item => item.trim()),
                featured: row[13] === 'TRUE' || row[13] === 'true'
            };
        });
    } catch (error) {
        console.error('Error fetching car listings:', error);
        return [];
    }
}

/**
 * Fetch a single car by ID
 * @param {string} id The car ID to fetch
 * @returns {Promise<Object|null>} The car object or null if not found
 */
async function fetchCarById(id) {
    const cars = await fetchCarListings();
    return cars.find(car => car.id === id) || null;
}

/**
 * Fetch featured cars
 * @param {number} limit Maximum number of featured cars to return
 * @returns {Promise<Array>} Array of featured car objects
 */
async function fetchFeaturedCars(limit = 3) {
    const cars = await fetchCarListings();
    return cars
        .filter(car => car.featured)
        .slice(0, limit);
}

/**
 * Filter cars based on criteria
 * @param {Object} filters Filter criteria
 * @returns {Promise<Array>} Filtered array of car objects
 */
async function filterCars(filters = {}) {
    const cars = await fetchCarListings();
    
    return cars.filter(car => {
        // Apply each filter if it exists
        if (filters.make && car.make.toLowerCase() !== filters.make.toLowerCase()) {
            return false;
        }
        
        if (filters.model && !car.model.toLowerCase().includes(filters.model.toLowerCase())) {
            return false;
        }
        
        if (filters.minYear && car.year < filters.minYear) {
            return false;
        }
        
        if (filters.maxYear && car.year > filters.maxYear) {
            return false;
        }
        
        if (filters.minPrice && car.price < filters.minPrice) {
            return false;
        }
        
        if (filters.maxPrice && car.price > filters.maxPrice) {
            return false;
        }
        
        if (filters.fuel && car.fuel.toLowerCase() !== filters.fuel.toLowerCase()) {
            return false;
        }
        
        if (filters.transmission && car.transmission.toLowerCase() !== filters.transmission.toLowerCase()) {
            return false;
        }
        
        return true;
    });
}

/**
 * Initialize the car listings on the page
 * This function should be called when the page loads
 */
async function initializeCarListings() {
    // Check if we're on the browse page
    const carGrid = document.getElementById('car-grid');
    if (!carGrid) return;
    
    try {
        // Show loading state
        carGrid.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        
        // Fetch car listings
        const cars = await fetchCarListings();
        
        if (cars.length === 0) {
            carGrid.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">No cars found. Please check back later.</p></div>';
            return;
        }
        
        // Clear the grid
        carGrid.innerHTML = '';
        
        // Add each car to the grid
        cars.forEach(car => {
            const carElement = createCarElement(car);
            carGrid.appendChild(carElement);
        });
        
        // Update the results count
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            resultsCount.textContent = `Showing ${cars.length} vehicles`;
        }
        
        // Initialize pagination
        if (typeof setupPagination === 'function') {
            setupPagination();
        }
        
    } catch (error) {
        console.error('Error initializing car listings:', error);
        carGrid.innerHTML = '<div class="col-12 text-center py-5"><p class="text-danger">Error loading cars. Please try again later.</p></div>';
    }
}

/**
 * Create a car element for the grid
 * @param {Object} car The car object
 * @returns {HTMLElement} The car element
 */
function createCarElement(car) {
    const carCol = document.createElement('div');
    carCol.className = 'col-md-6 col-lg-4 mb-4';
    carCol.setAttribute('data-aos', 'fade-up');
    carCol.setAttribute('data-price', car.price);
    carCol.setAttribute('data-year', car.year);
    carCol.setAttribute('data-fuel', car.fuel.toLowerCase());
    carCol.setAttribute('data-transmission', car.transmission.toLowerCase());
    
    carCol.innerHTML = `
        <div class="card car-card h-100 border-0 shadow-sm">
            <div class="position-relative">
                <img src="${car.mainImage}" class="card-img-top" alt="${car.make} ${car.model}">
                ${car.featured ? '<span class="badge bg-primary position-absolute top-0 end-0 mt-2 me-2">Featured</span>' : ''}
            </div>
            <div class="card-body">
                <h5 class="card-title fw-bold">${car.make} ${car.model}</h5>
                <div class="d-flex justify-content-between mb-2">
                    <span class="text-primary fw-bold">₹${car.price.toLocaleString()}</span>
                    <span class="text-muted"><i class="fas fa-calendar-alt me-1"></i> ${car.year}</span>
                </div>
                <div class="car-features mb-3">
                    <span class="badge bg-light text-dark me-2 mb-2"><i class="fas fa-tachometer-alt me-1"></i> ${car.mileage.toLocaleString()} km</span>
                    <span class="badge bg-light text-dark me-2 mb-2"><i class="fas fa-gas-pump me-1"></i> ${car.fuel}</span>
                    <span class="badge bg-light text-dark me-2 mb-2"><i class="fas fa-cog me-1"></i> ${car.transmission}</span>
                </div>
                <a href="car-details.html?id=${car.id}" class="btn btn-outline-primary w-100">View Details</a>
            </div>
        </div>
    `;
    
    return carCol;
}

/**
 * Initialize the car details page
 * This function should be called when the car details page loads
 */
async function initializeCarDetails() {
    // Check if we're on the car details page
    const carDetailsContainer = document.getElementById('car-details-container');
    if (!carDetailsContainer) return;
    
    try {
        // Show loading state
        carDetailsContainer.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        
        // Get the car ID from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const carId = urlParams.get('id');
        
        if (!carId) {
            carDetailsContainer.innerHTML = '<div class="alert alert-danger">No car ID specified</div>';
            return;
        }
        
        // Fetch the car details
        const car = await fetchCarById(carId);
        
        if (!car) {
            carDetailsContainer.innerHTML = '<div class="alert alert-danger">Car not found</div>';
            return;
        }
        
        // Update the page title
        document.title = `${car.make} ${car.model} - Car City`;
        
        // Populate the car details
        populateCarDetails(car);
        
    } catch (error) {
        console.error('Error initializing car details:', error);
        carDetailsContainer.innerHTML = '<div class="alert alert-danger">Error loading car details. Please try again later.</div>';
    }
}

/**
 * Populate the car details on the page
 * @param {Object} car The car object
 */
function populateCarDetails(car) {
    const carDetailsContainer = document.getElementById('car-details-container');
    if (!carDetailsContainer) return;
    
    // Create the gallery images HTML
    let galleryImagesHtml = '';
    if (car.galleryImages && car.galleryImages.length > 0) {
        car.galleryImages.forEach((image, index) => {
            if (image.trim()) {
                galleryImagesHtml += `
                    <div class="col-4 col-md-3 mb-3">
                        <img src="${image}" class="img-fluid car-thumbnail ${index === 0 ? 'active' : ''}" 
                            data-src="${image}" alt="${car.make} ${car.model} - Image ${index + 1}">
                    </div>
                `;
            }
        });
    }
    
    // Create the features HTML
    let featuresHtml = '';
    if (car.features && car.features.length > 0) {
        car.features.forEach(feature => {
            if (feature.trim()) {
                featuresHtml += `
                    <div class="col-md-6 mb-2">
                        <div class="d-flex align-items-center">
                            <i class="fas fa-check-circle text-primary me-2"></i>
                            <span>${feature}</span>
                        </div>
                    </div>
                `;
            }
        });
    }
    
    // Populate the container
    carDetailsContainer.innerHTML = `
        <div class="row">
            <div class="col-lg-8">
                <!-- Main Image -->
                <div class="main-image-container mb-3">
                    <img src="${car.mainImage}" id="main-car-image" class="img-fluid rounded" alt="${car.make} ${car.model}">
                </div>
                
                <!-- Image Gallery -->
                <div class="row g-2 mb-4">
                    ${galleryImagesHtml}
                </div>
                
                <!-- Car Description -->
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-body">
                        <h4 class="fw-bold mb-3">Description</h4>
                        <p>${car.description}</p>
                    </div>
                </div>
                
                <!-- Car Features -->
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-body">
                        <h4 class="fw-bold mb-3">Features & Specifications</h4>
                        <div class="row">
                            ${featuresHtml}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-4">
                <!-- Car Info Card -->
                <div class="card border-0 shadow-sm sticky-top" style="top: 100px; z-index: 1;">
                    <div class="card-body">
                        <h3 class="fw-bold mb-3">${car.make} ${car.model}</h3>
                        <h4 class="text-primary mb-4">₹${car.price.toLocaleString()}</h4>
                        
                        <div class="car-specs mb-4">
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted">Year</span>
                                <span class="fw-bold">${car.year}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted">Mileage</span>
                                <span class="fw-bold">${car.mileage.toLocaleString()} km</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted">Fuel Type</span>
                                <span class="fw-bold">${car.fuel}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted">Transmission</span>
                                <span class="fw-bold">${car.transmission}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted">Color</span>
                                <span class="fw-bold">${car.color}</span>
                            </div>
                        </div>
                        
                        <div class="d-grid gap-2">
                            <a href="tel:+919876543210" class="btn btn-primary">
                                <i class="fas fa-phone-alt me-2"></i> Call Now
                            </a>
                            <a href="https://wa.me/919876543210?text=I'm%20interested%20in%20the%20${car.make}%20${car.model}" 
                               class="btn btn-success" target="_blank">
                                <i class="fab fa-whatsapp me-2"></i> WhatsApp
                            </a>
                            <button type="button" class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#inquiryModal">
                                <i class="fas fa-envelope me-2"></i> Send Inquiry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize the image gallery functionality
    initializeGallery();
}

/**
 * Initialize the image gallery functionality
 */
function initializeGallery() {
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
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize car listings on browse page
    initializeCarListings();
    
    // Initialize car details on car details page
    initializeCarDetails();
}); 