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
        console.log('Fetching car listings from Google Sheet...');
        console.log(`Sheet ID: ${SHEET_ID}`);
        
        // Fetch the data from the 'Cars' sheet (updated to fetch A to N)
        const apiUrl = `${SHEETS_API_BASE}/${SHEET_ID}/values/Cars!A2:N?key=${API_KEY}`;
        console.log(`API URL: ${apiUrl}`);
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            mode: 'cors', // Enable CORS
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', errorText);
            throw new Error(`Failed to fetch car listings: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        // If no values are returned, return an empty array
        if (!data.values) {
            console.log('No values returned from API');
            return [];
        }
        
        console.log(`Found ${data.values.length} car listings`);
        
        // Debug: Log the first row to see the structure
        if (data.values.length > 0) {
            console.log('First row data:', data.values[0]);
            console.log('Column mapping check:');
            console.log('Column 10 (features):', data.values[0][10]);
            console.log('Column 11 (should be description):', data.values[0][11]);
            console.log('Column 12 (should be mainImage):', data.values[0][12]);
        }
        
        // Map the row data to car objects with FIXED column mapping
        const cars = data.values.map((row, index) => {
            // Fix the column mapping for this car
            return fixColumnMapping(row, index);
        });
        
        return cars;
    } catch (error) {
        console.error('Error fetching car listings:', error);
        return [];
    }
}

/**
 * Fix the column mapping for a car row from Google Sheets
 * @param {Array} row The row data from Google Sheets
 * @param {number} index The index of the row for logging
 * @returns {Object} The correctly mapped car object
 */
function fixColumnMapping(row, index) {
    console.log(`Fixing column mapping for car ${index + 1} (ID: ${row[0] || 'unknown'})`);
    
    // UPDATED COLUMN MAPPING:
    // A(0) = ID, B(1) = Make, C(2) = Model, D(3) = Year, E(4) = Price, F(5) = Mileage
    // G(6) = Fuel, H(7) = Transmission, I(8) = Color, J(9) = GalleryImages
    // K(10) = Features, L(11) = Description, M(12) = MainImage, N(13) = Featured
    
    console.log(`Car ${row[0]} (${index + 1}): Column mapping debug:`);
    console.log(`Column 9 (Gallery Images): ${row[9] ? row[9].substring(0, 30) + '...' : 'empty'}`);
    console.log(`Column 10 (Features): ${row[10] ? row[10].substring(0, 30) + '...' : 'empty'}`);
    console.log(`Column 11 (Description): ${row[11] ? row[11].substring(0, 30) + '...' : 'empty'}`);
    console.log(`Column 12 (Main Image): ${row[12] ? row[12].substring(0, 30) + '...' : 'empty'}`);
    console.log(`Column 13 (Featured): ${row[13] || 'false'}`);
    
    // Process gallery images from column J(9)
    let galleryImagesArray = [];
    if (row[9] && row[9].trim()) {
        galleryImagesArray = row[9].split(',')
            .map(item => item.trim())
            .filter(item => item !== '');
    }
    
    // Process features from column K(10)
    let features = [];
    if (row[10] && row[10].trim()) {
        features = row[10].split(',')
            .map(item => item.trim())
            .filter(item => item !== '');
    }
    
    // Get description from column L(11)
    let description = row[11] || '';
    
    // Get main image from column M(12)
    let mainImage = row[12] || '';
    
    // Get featured status from column N(13)
    let featured = row[13] === 'TRUE' || row[13] === 'true';
    
    // URL detection function
    const isUrl = (text) => {
        if (!text) return false;
        
        // Basic URL patterns
        if (text.startsWith('https://') || 
            text.startsWith('http://') || 
            text.startsWith('www.') ||
            text.startsWith('data:image/')) {
            return true;
        }
        
        // Common image hosting domains
        if (text.includes('unsplash.com') ||
            text.includes('imgur.com') ||
            text.includes('cloudinary.com') ||
            text.includes('googleusercontent.com') ||
            text.includes('drive.google.com') ||
            text.includes('dropbox.com') ||
            text.includes('flickr.com') ||
            text.includes('ibb.co') ||
            text.includes('postimg.cc')) {
            return true;
        }
        
        // Common image extensions (case insensitive)
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.tif', '.ico', '.heic', '.heif', '.avif'];
        for (const ext of imageExtensions) {
            if (text.toLowerCase().includes(ext)) {
                return true;
            }
        }
        
        // URL patterns with domains
        if (/\.(com|org|net|io|co|in|us|uk|eu|gov|edu|info)\//i.test(text)) {
            return true;
        }
        
        return false;
    };
    
    // If description is a URL, replace with placeholder
    if (isUrl(description)) {
        console.warn(`Car ${row[0]} (${index + 1}): Description appears to be a URL, using placeholder text instead`);
        console.warn(`Original description: ${description}`);
        description = 'Detailed information about this vehicle will be available soon.';
    }
    
    // Log the determined values
    console.log(`Car ${row[0]} (${index + 1}): CORRECTED VALUES:`);
    console.log(`Gallery Images: ${galleryImagesArray.length} images`);
    console.log(`Features: ${features.join(', ').substring(0, 50)}${features.join(', ').length > 50 ? '...' : ''}`);
    console.log(`Description: ${description.substring(0, 30)}${description.length > 30 ? '...' : ''}`);
    console.log(`Main Image: ${mainImage.substring(0, 30)}${mainImage.length > 30 ? '...' : ''}`);
    console.log(`Featured: ${featured}`);
    
    // Create the car object with CORRECT column mapping
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
        bodyType: '', // No longer in the data, but keeping for compatibility
        galleryImages: galleryImagesArray,
        features: features,
        description: description,
        mainImage: mainImage,
        featured: featured
    };
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
        
        // Populate filter options dynamically
        populateFilterOptions(cars);
        
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
        
        // Initialize image navigation
        if (typeof initCarImageNavigation === 'function') {
            initCarImageNavigation();
        }
        
    } catch (error) {
        console.error('Error initializing car listings:', error);
        carGrid.innerHTML = '<div class="col-12 text-center py-5"><p class="text-danger">Error loading cars. Please try again later.</p></div>';
    }
}

/**
 * Populate filter options based on available data
 * @param {Array} cars Array of car objects
 */
function populateFilterOptions(cars) {
    console.log('Populating filter options with available data');
    
    // Get unique makes
    const makes = [...new Set(cars.map(car => car.make))].sort();
    const makeSelect = document.getElementById('make');
    
    if (makeSelect) {
        console.log('Available makes:', makes);
        
        // Clear existing options except the first one
        while (makeSelect.options.length > 1) {
            makeSelect.remove(1);
        }
        
        // Add options for each make
        makes.forEach(make => {
            const option = document.createElement('option');
            option.value = make.toLowerCase();
            option.textContent = make;
            makeSelect.appendChild(option);
        });
    }
    
    // Get unique body types
    const bodyTypes = [...new Set(cars.map(car => car.bodyType).filter(type => type))].sort();
    const bodyTypeSelect = document.getElementById('body-type');
    
    if (bodyTypeSelect) {
        console.log('Available body types:', bodyTypes);
        
        // Clear existing options except the first one
        while (bodyTypeSelect.options.length > 1) {
            bodyTypeSelect.remove(1);
        }
        
        // Add options for each body type
        bodyTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.toLowerCase();
            option.textContent = type;
            bodyTypeSelect.appendChild(option);
        });
    }
    
    // Get unique fuel types
    const fuelTypes = [...new Set(cars.map(car => car.fuel).filter(fuel => fuel))].sort();
    const fuelTypeSelect = document.getElementById('fuel-type');
    
    if (fuelTypeSelect) {
        console.log('Available fuel types:', fuelTypes);
        
        // Clear existing options except the first one
        while (fuelTypeSelect.options.length > 1) {
            fuelTypeSelect.remove(1);
        }
        
        // Add options for each fuel type
        fuelTypes.forEach(fuel => {
            const option = document.createElement('option');
            option.value = fuel.toLowerCase();
            option.textContent = fuel;
            fuelTypeSelect.appendChild(option);
        });
    }
    
    // Get unique transmission types
    const transmissionTypes = [...new Set(cars.map(car => car.transmission).filter(trans => trans))].sort();
    const transmissionSelect = document.getElementById('transmission');
    
    if (transmissionSelect) {
        console.log('Available transmission types:', transmissionTypes);
        
        // Clear existing options except the first one
        while (transmissionSelect.options.length > 1) {
            transmissionSelect.remove(1);
        }
        
        // Add options for each transmission type
        transmissionTypes.forEach(trans => {
            const option = document.createElement('option');
            option.value = trans.toLowerCase();
            option.textContent = trans;
            transmissionSelect.appendChild(option);
        });
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
    carCol.setAttribute('data-fuel', car.fuel ? car.fuel.toLowerCase() : '');
    carCol.setAttribute('data-transmission', car.transmission ? car.transmission.toLowerCase() : '');
    carCol.setAttribute('data-make', car.make ? car.make.toLowerCase() : '');
    carCol.setAttribute('data-model', car.model ? car.model.toLowerCase() : '');
    carCol.setAttribute('data-body-type', car.bodyType ? car.bodyType.toLowerCase() : '');
    carCol.setAttribute('data-kilometers', car.mileage);
    
    // Log the data attributes for debugging
    console.log(`Creating car element for ${car.make} ${car.model} with attributes:`, {
        price: car.price,
        year: car.year,
        fuel: car.fuel ? car.fuel.toLowerCase() : '',
        transmission: car.transmission ? car.transmission.toLowerCase() : '',
        make: car.make ? car.make.toLowerCase() : '',
        model: car.model ? car.model.toLowerCase() : '',
        bodyType: car.bodyType ? car.bodyType.toLowerCase() : '',
        kilometers: car.mileage
    });
    
    // Prepare all images (main + gallery)
    const allImages = [];
    
    // Add main image first if it exists
    if (car.mainImage && car.mainImage.trim()) {
        allImages.push(car.mainImage);
    }
    
    // Add gallery images
    if (car.galleryImages && car.galleryImages.length > 0) {
        console.log('Processing gallery images for car element:', car.galleryImages);
        car.galleryImages.forEach((img, idx) => {
            if (img && img.trim()) {
                // Try to fix common URL issues
                let processedImg = img.trim();
                
                // If URL doesn't start with http/https but looks like a URL, add https://
                if (!processedImg.startsWith('http://') && 
                    !processedImg.startsWith('https://') && 
                    !processedImg.startsWith('data:') &&
                    (processedImg.includes('.com/') || 
                     processedImg.includes('.net/') || 
                     processedImg.includes('.org/') ||
                     processedImg.includes('.io/') ||
                     processedImg.includes('.co/'))) {
                    processedImg = 'https://' + processedImg;
                    console.log(`Fixed URL format for image ${idx}: ${processedImg}`);
                }
                
                allImages.push(processedImg);
                console.log(`Added gallery image ${idx} to car element:`, processedImg);
            }
        });
    }
    
    // Default image if no images are available
    if (allImages.length === 0) {
        allImages.push('images/car-placeholder.jpg');
    }
    
    carCol.innerHTML = `
        <div class="card car-card h-100 border-0 shadow-sm">
            <div class="position-relative car-image-container">
                <img src="${allImages[0]}" class="card-img-top car-main-image" alt="${car.make} ${car.model}">
                ${car.featured ? '<span class="badge bg-primary position-absolute top-0 end-0 mt-2 me-2">Featured</span>' : ''}
                
                ${allImages.length > 1 ? `
                <div class="image-navigation">
                    <button class="btn btn-sm btn-light rounded-circle image-nav prev-image" data-index="0" data-car-id="${car.id}">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="btn btn-sm btn-light rounded-circle image-nav next-image" data-index="0" data-car-id="${car.id}">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div class="image-indicator">
                    <span class="current-index">1</span>/<span class="total-images">${allImages.length}</span>
                </div>
                ` : ''}
                
                <div class="image-data" style="display:none;" 
                     data-images='${JSON.stringify(allImages)}' 
                     data-car-id="${car.id}"></div>
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
        
        console.log(`Fetching car details for ID: ${carId}`);
        
        // Fetch all car listings first
        const allCars = await fetchCarListings();
        console.log(`Fetched ${allCars.length} cars, looking for ID: ${carId}`);
        
        // Find the car with the matching ID
        const car = allCars.find(c => c.id === carId);
        
        if (!car) {
            console.error(`Car with ID ${carId} not found`);
            carDetailsContainer.innerHTML = '<div class="alert alert-danger">Car not found</div>';
            return;
        }
        
        console.log(`Found car: ${car.make} ${car.model}`);
        console.log(`Description: ${car.description}`);
        
        // Update the page title
        document.title = `${car.make} ${car.model} - Car City`;
        
        // Populate the car details
        populateCarDetails(car);
        
        // Fix the description if needed
        fixCarDescription(car);
        
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
    
    console.log('Populating car details for:', car);
    console.log('Description:', car.description);
    console.log('Main Image:', car.mainImage);
    console.log('Gallery Images:', car.galleryImages);
    console.log('Features:', car.features);
    
    // Create the gallery images HTML
    let galleryImagesHtml = '';
    let lightboxGalleryHtml = '';
    
    // Prepare all images (main + gallery)
    const allImages = [];
    
    // Add main image first if it exists
    if (car.mainImage && car.mainImage.trim()) {
        allImages.push(car.mainImage);
        console.log('Added main image to allImages:', car.mainImage);
    }
    
    // Add gallery images
    if (car.galleryImages && car.galleryImages.length > 0) {
        console.log('Processing gallery images:', car.galleryImages);
        car.galleryImages.forEach((img, idx) => {
            if (img && img.trim()) {
                // Try to fix common URL issues
                let processedImg = img.trim();
                
                // If URL doesn't start with http/https but looks like a URL, add https://
                if (!processedImg.startsWith('http://') && 
                    !processedImg.startsWith('https://') && 
                    !processedImg.startsWith('data:') &&
                    (processedImg.includes('.com/') || 
                     processedImg.includes('.net/') || 
                     processedImg.includes('.org/') ||
                     processedImg.includes('.io/') ||
                     processedImg.includes('.co/'))) {
                    processedImg = 'https://' + processedImg;
                    console.log(`Fixed URL format for image ${idx}: ${processedImg}`);
                }
                
                allImages.push(processedImg);
                console.log(`Added gallery image ${idx} to allImages:`, processedImg);
            }
        });
    }
    
    // Default image if no images are available
    if (allImages.length === 0) {
        allImages.push('images/car-placeholder.jpg');
        console.log('No images available, using placeholder');
    }
    
    console.log('Total images in allImages array:', allImages.length);
    
    if (allImages.length > 0) {
        allImages.forEach((image, index) => {
            if (image && image.trim()) {
                galleryImagesHtml += `
                    <div class="gallery-item">
                        <img src="${image}" class="img-fluid car-thumbnail ${index === 0 ? 'active' : ''}" 
                            data-src="${image}" alt="${car.make} ${car.model} - Image ${index + 1}">
                    </div>
                `;
                
                lightboxGalleryHtml += `
                    <a href="${image}" data-lightbox="car-gallery" data-title="${car.make} ${car.model} - Image ${index + 1}" 
                       ${index === 0 ? 'id="main-image-lightbox"' : ''} class="d-none">
                        <img src="${image}" alt="${car.make} ${car.model}">
                    </a>
                `;
            }
        });
    }
    
    // URL detection function
    const isUrl = (text) => {
        if (!text) return false;
        return text.startsWith('https://') || 
               text.startsWith('http://') || 
               text.includes('unsplash.com') ||
               text.includes('.jpg') ||
               text.includes('.png') ||
               text.includes('.jpeg') ||
               text.includes('.webp') ||
               /\.(com|org|net|io|co)\//.test(text);
    };
    
    // Create the features HTML - MAKE SURE WE'RE USING THE CORRECT FEATURES ARRAY
    let featuresHtml = '';
    if (car.features && car.features.length > 0) {
        // Double check that we're not displaying URLs as features
        const validFeatures = car.features.filter(feature => !isUrl(feature));
        
        if (validFeatures.length > 0) {
            validFeatures.forEach(feature => {
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
        } else {
            featuresHtml = '<div class="col-12"><p class="text-muted">No additional features listed for this vehicle.</p></div>';
        }
    } else {
        featuresHtml = '<div class="col-12"><p class="text-muted">No additional features listed for this vehicle.</p></div>';
    }
    
    // Format the description with paragraphs
    let formattedDescription = '<p>No description available for this vehicle.</p>';
    
    if (car.description && car.description.trim()) {
        // Check if the description is a URL (likely an error)
        if (isUrl(car.description)) {
            console.warn('Description appears to be a URL, using placeholder text instead');
            console.warn('Original description:', car.description);
            formattedDescription = '<p>Detailed information about this vehicle will be available soon.</p>';
        } else {
            // Split by newlines and create paragraphs
            formattedDescription = car.description
                .split('\n')
                .filter(para => para.trim())
                .map(para => `<p>${para}</p>`)
                .join('');
                
            // If there are no paragraphs, create a single paragraph
            if (!formattedDescription) {
                formattedDescription = `<p>${car.description}</p>`;
            }
        }
    }
    
    console.log('Formatted description:', formattedDescription);
    
    // Populate the container
    carDetailsContainer.innerHTML = `
        <div class="row">
            <div class="col-lg-8">
                <!-- Main Image -->
                <div class="main-image-container mb-3 position-relative">
                    <img src="${allImages[0]}" id="main-car-image" class="img-fluid rounded shadow-sm" alt="${car.make} ${car.model}">
                    <a href="#" class="position-absolute top-50 start-50 translate-middle btn btn-light rounded-circle" 
                       id="view-full-image" style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-search-plus"></i>
                    </a>
                    
                    ${allImages.length > 1 ? `
                    <div class="image-navigation details-page-nav">
                        <button class="btn btn-light rounded-circle image-nav prev-image" data-index="0" data-car-id="${car.id}">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button class="btn btn-light rounded-circle image-nav next-image" data-index="0" data-car-id="${car.id}">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                    <div class="image-indicator details-page-indicator">
                        <span class="current-index">1</span>/<span class="total-images">${allImages.length}</span>
                    </div>
                    <div class="image-data" style="display:none;" 
                         data-images='${JSON.stringify(allImages)}' 
                         data-car-id="${car.id}"></div>
                    ` : ''}
                </div>
                
                <!-- Image Gallery -->
                <div class="gallery-container mb-4">
                    ${galleryImagesHtml}
                </div>
                
                <!-- Lightbox Gallery (hidden) -->
                <div class="d-none">
                    ${lightboxGalleryHtml}
                </div>
                
                <!-- Car Description -->
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-body">
                        <h4 class="fw-bold mb-3">Description</h4>
                        <div class="car-description">
                            ${formattedDescription}
                        </div>
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
    
    // Load similar cars
    loadSimilarCars(car);
}

/**
 * Initialize the image gallery functionality
 */
function initializeGallery() {
    const mainImage = document.getElementById('main-car-image');
    const thumbnails = document.querySelectorAll('.car-thumbnail');
    const viewFullImageBtn = document.getElementById('view-full-image');
    const mainImageLightbox = document.getElementById('main-image-lightbox');
    
    console.log('Initializing gallery with', thumbnails.length, 'thumbnails');
    console.log('Main image element:', mainImage);
    console.log('View full image button:', viewFullImageBtn);
    console.log('Main image lightbox:', mainImageLightbox);
    
    // Add error handling for the main image
    if (mainImage) {
        mainImage.onerror = function() {
            console.error('Error loading main image:', this.src);
            // Replace with placeholder if image fails to load
            this.src = 'images/car-placeholder.jpg';
            this.onerror = null; // Prevent infinite loop if placeholder also fails
        };
    }
    
    if (mainImage && thumbnails.length > 0) {
        // Log all thumbnails for debugging
        thumbnails.forEach((thumbnail, index) => {
            console.log(`Thumbnail ${index}:`, thumbnail.getAttribute('data-src'));
            
            // Add error handling for thumbnails
            thumbnail.onerror = function() {
                console.error('Error loading thumbnail:', this.src);
                // Replace with placeholder if image fails to load
                this.src = 'images/car-placeholder.jpg';
                this.onerror = null; // Prevent infinite loop if placeholder also fails
            };
        });
        
        thumbnails.forEach((thumbnail, index) => {
            console.log(`Setting up click handler for thumbnail ${index}:`, thumbnail.getAttribute('data-src'));
            
            thumbnail.addEventListener('click', function() {
                console.log('Thumbnail clicked:', this.getAttribute('data-src'));
                
                // Remove active class from all thumbnails
                thumbnails.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked thumbnail
                this.classList.add('active');
                
                // Update main image
                const newSrc = this.getAttribute('data-src');
                mainImage.src = newSrc;
                console.log('Updated main image src to:', newSrc);
                
                // Update lightbox link
                if (mainImageLightbox) {
                    mainImageLightbox.href = newSrc;
                    console.log('Updated lightbox href to:', newSrc);
                }
                
                // Update image navigation buttons index
                const navButtons = document.querySelectorAll('.image-nav');
                navButtons.forEach(btn => {
                    btn.setAttribute('data-index', index);
                    console.log('Updated nav button data-index to:', index);
                });
                
                // Update the indicator
                const currentIndexEl = document.querySelector('.current-index');
                if (currentIndexEl) {
                    currentIndexEl.textContent = index + 1;
                    console.log('Updated current index to:', index + 1);
                }
                
                // Add fade effect
                mainImage.classList.add('fade');
                setTimeout(() => {
                    mainImage.classList.remove('fade');
                }, 300);
            });
        });
    }
    
    // Initialize lightbox for full-screen viewing
    if (viewFullImageBtn && mainImageLightbox) {
        viewFullImageBtn.addEventListener('click', function(e) {
            e.preventDefault();
            mainImageLightbox.click();
        });
    }
}

/**
 * Load similar cars based on the current car
 * @param {Object} currentCar The current car being viewed
 */
async function loadSimilarCars(currentCar) {
    const similarCarsContainer = document.getElementById('similar-cars-container');
    if (!similarCarsContainer) return;
    
    try {
        // Fetch all cars
        const allCars = await fetchCarListings();
        
        // Filter similar cars (same make or same body type, excluding current car)
        const similarCars = allCars
            .filter(car => 
                car.id !== currentCar.id && 
                (car.make === currentCar.make || car.bodyType === currentCar.bodyType)
            )
            .slice(0, 3); // Limit to 3 similar cars
        
        // Clear the container
        similarCarsContainer.innerHTML = '';
        
        if (similarCars.length === 0) {
            similarCarsContainer.innerHTML = '<div class="col-12 text-center"><p class="text-muted">No similar cars found.</p></div>';
            return;
        }
        
        // Add each similar car
        similarCars.forEach(car => {
            const carElement = createCarElement(car);
            similarCarsContainer.appendChild(carElement);
        });
        
    } catch (error) {
        console.error('Error loading similar cars:', error);
        similarCarsContainer.innerHTML = '<div class="col-12 text-center"><p class="text-danger">Error loading similar cars.</p></div>';
    }
}

/**
 * Fix the car description if it's showing the image URL instead of the actual description
 * @param {Object} car The car object
 */
function fixCarDescription(car) {
    setTimeout(() => {
        // Fix description section
        const descriptionElement = document.querySelector('.car-description');
        if (descriptionElement) {
            const currentText = descriptionElement.textContent.trim();
            console.log('Current description text:', currentText);
            
            // URL detection function
            const isUrl = (text) => {
                if (!text) return false;
                return text.startsWith('https://') || 
                       text.startsWith('http://') || 
                       text.includes('unsplash.com') ||
                       text.includes('.jpg') ||
                       text.includes('.png') ||
                       text.includes('.jpeg') ||
                       text.includes('.webp') ||
                       /\.(com|org|net|io|co)\//.test(text);
            };
            
            // Check if the description is showing a URL
            if (isUrl(currentText)) {
                console.log('Fixing description that appears to be a URL');
                
                // Format the description with paragraphs
                const formattedDescription = car.description && car.description.trim() && !isUrl(car.description)
                    ? car.description
                        .split('\n')
                        .filter(para => para.trim())
                        .map(para => `<p>${para}</p>`)
                        .join('')
                    : '<p>Detailed information about this vehicle will be available soon.</p>';
                
                // Update the description
                descriptionElement.innerHTML = formattedDescription;
                console.log('Description updated to:', formattedDescription);
            }
        }
        
        // Fix features section
        const featuresContainer = document.querySelector('.card-body .row');
        if (featuresContainer && car.features && car.features.length > 0) {
            // Check if features section appears to contain a description instead of features
            const featureItems = featuresContainer.querySelectorAll('.col-md-6');
            
            if (featureItems.length === 0 || (featureItems.length === 1 && featureItems[0].textContent.length > 100)) {
                console.log('Features section appears to contain a description, fixing...');
                
                // Clear the container
                featuresContainer.innerHTML = '';
                
                // URL detection function
                const isUrl = (text) => {
                    if (!text) return false;
                    return text.startsWith('https://') || 
                           text.startsWith('http://') || 
                           text.includes('unsplash.com') ||
                           text.includes('.jpg') ||
                           text.includes('.png') ||
                           text.includes('.jpeg') ||
                           text.includes('.webp') ||
                           /\.(com|org|net|io|co)\//.test(text);
                };
                
                // Filter out any URLs from features
                const validFeatures = car.features.filter(feature => !isUrl(feature));
                
                if (validFeatures.length > 0) {
                    // Add each feature
                    validFeatures.forEach(feature => {
                        if (feature.trim()) {
                            const featureDiv = document.createElement('div');
                            featureDiv.className = 'col-md-6 mb-2';
                            featureDiv.innerHTML = `
                                <div class="d-flex align-items-center">
                                    <i class="fas fa-check-circle text-primary me-2"></i>
                                    <span>${feature}</span>
                                </div>
                            `;
                            featuresContainer.appendChild(featureDiv);
                        }
                    });
                } else {
                    featuresContainer.innerHTML = '<div class="col-12"><p class="text-muted">No additional features listed for this vehicle.</p></div>';
                }
                
                console.log('Features section updated with', validFeatures.length, 'features');
            }
        }
    }, 500); // Wait for the DOM to be updated
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize car listings on browse page
    initializeCarListings();
    
    // Initialize car details on car details page
    initializeCarDetails();
}); 