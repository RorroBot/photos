/*
  PHOTO DATA
  - Replace entries in the `photos` array with your own thumbnails and full
    image URLs and captions.
  - Each photo object should have: { id, thumbnail, full, caption }
  - If you provide local images (relative paths), consider precompressing
    them and using responsive srcsets to reduce bandwidth on mobile.
  - CHANGE/ADJUST: If you expect many images, consider fetching this list
    from an API and pagination or lazy-loading additional rows on scroll.
*/
const photos = [
    { 
        id: 1, 
        thumbnail: 'https://picsum.photos/id/10/300/300', 
        full: 'https://picsum.photos/id/10/1200/800',
        caption: 'Forest Path, Oregon'
    },
    { 
        id: 2, 
        thumbnail: 'https://picsum.photos/id/11/300/300', 
        full: 'https://picsum.photos/id/11/1200/800',
        caption: 'Mountain Lake, Switzerland'
    },
    { 
        id: 3, 
        thumbnail: 'https://picsum.photos/id/12/300/300', 
        full: 'https://picsum.photos/id/12/1200/800',
        caption: 'Coastal Cliffs, Ireland'
    },
    { 
        id: 4, 
        thumbnail: 'https://picsum.photos/id/13/300/300', 
        full: 'https://picsum.photos/id/13/1200/800',
        caption: 'Desert Dunes, Sahara'
    },
    { 
        id: 5, 
        thumbnail: 'https://picsum.photos/id/14/300/300', 
        full: 'https://picsum.photos/id/14/1200/800',
        caption: 'Northern Lights, Norway'
    },
    { 
        id: 6, 
        thumbnail: 'https://picsum.photos/id/15/300/300', 
        full: 'https://picsum.photos/id/15/1200/800',
        caption: 'Waterfall, Iceland'
    },
    { 
        id: 7, 
        thumbnail: 'https://picsum.photos/id/16/300/300', 
        full: 'https://picsum.photos/id/16/1200/800',
        caption: 'Mountain Peak, Nepal'
    },
    { 
        id: 8, 
        thumbnail: 'https://picsum.photos/id/17/300/300', 
        full: 'https://picsum.photos/id/17/1200/800',
        caption: 'Tropical Beach, Thailand'
    },
    { 
        id: 9, 
        thumbnail: 'https://picsum.photos/id/18/300/300', 
        full: 'https://picsum.photos/id/18/1200/800',
        caption: 'City Skyline, New York'
    },
    { 
        id: 10, 
        thumbnail: 'https://picsum.photos/id/19/300/300', 
        full: 'https://picsum.photos/id/19/1200/800',
        caption: 'Countryside, Tuscany'
    },
    { 
        id: 11, 
        thumbnail: 'https://picsum.photos/id/20/300/300', 
        full: 'https://picsum.photos/id/20/1200/800',
        caption: 'Canyon, Arizona'
    },
    { 
        id: 12, 
        thumbnail: 'https://picsum.photos/id/21/300/300', 
        full: 'https://picsum.photos/id/21/1200/800',
        caption: 'Lavender Fields, France'
    },
    { 
        id: 13, 
        thumbnail: 'https://picsum.photos/id/22/300/300', 
        full: 'https://picsum.photos/id/22/1200/800',
        caption: 'Sunset, California'
    },
    { 
        id: 14, 
        thumbnail: 'https://picsum.photos/id/23/300/300', 
        full: 'https://picsum.photos/id/23/1200/800',
        caption: 'Alpine Meadow, Austria'
    },
    { 
        id: 15, 
        thumbnail: 'https://picsum.photos/id/24/300/300', 
        full: 'https://picsum.photos/id/24/1200/800',
        caption: 'Volcano, Hawaii'
    }
];

// ---------------------- DOM elements ----------------------
const photoGrid = document.getElementById('photoGrid');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCaption = document.getElementById('lightboxCaption');
const closeBtn = document.getElementById('closeBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Current photo index in lightbox
let currentPhotoIndex = 0;

/*
  Track lightbox state:
  - false = state 1 (light background, caption dark)
  - true  = state 2 (dark background, caption light)
  Toggled by clicking the large image or pressing space when the lightbox
  is open. Use this to provide two different presentation modes.
*/
let lightboxState = false;

// ---------------------- Initialization ----------------------
function initPhotoGrid() {
    // Calculate number of columns based on screen width. This mirrors the
    // CSS breakpoints — keep both in sync when changing breakpoints.
    const screenWidth = window.innerWidth;
    let columns = 5; // Default to 5 columns
    if (screenWidth <= 1024) {
        columns = 3; // Tablet and smaller
    }

    // Create grid items dynamically. If your images are known server-side
    // you can render these statically and skip this step.
    photos.forEach((photo, index) => {
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';
        gridItem.dataset.id = photo.id; // Useful hook for future features (analytics, deep links)

        const img = document.createElement('img');
        img.src = photo.thumbnail; // Thumbnail for the grid
        img.alt = photo.caption; // IMPORTANT: alt text for accessibility
        img.loading = 'lazy'; // Lazy loading helps performance

        gridItem.appendChild(img);
        photoGrid.appendChild(gridItem);

        // Add click event to open lightbox. We capture the index so the
        // lightbox shows the correct image.
        gridItem.addEventListener('click', () => openLightbox(index));
    });

    // Load images row by row with a small fade-in animation to create a
    // staggered loading effect. This improves perceived performance.
    loadImagesByRow(columns);
}

/*
  loadImagesByRow(columns)
  - columns: expected number of columns for the current viewport width.
  - This function groups the grid items into rows and fades them in after
    their thumbnail images are loaded. Adjust timings to taste.

  Change guidance:
  - For large galleries, consider replacing this with IntersectionObserver
    to load rows only when they enter the viewport (true lazy loading).
  - If thumbnails are heavy, reduce image sizes or use `srcset` with
    responsive thumbnails.
*/
function loadImagesByRow(columns) {
    const gridItems = document.querySelectorAll('.grid-item');
    const totalItems = gridItems.length;
    const rows = Math.ceil(totalItems / columns);

    function loadRow(rowIndex) {
        const startIndex = rowIndex * columns;
        const endIndex = Math.min(startIndex + columns, totalItems);

        // Preload images in this row and wait for them to either load or error.
        const promises = [];
        for (let i = startIndex; i < endIndex; i++) {
            const img = gridItems[i].querySelector('img');
            if (!img) continue;

            // 🔥 Handle cached images immediately
            if (img.complete) continue;

            // Otherwise wait for load/error events
            promises.push(new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
            }));
}

        // After all promises resolve, fade in these items and queue next row.
        Promise.all(promises).then(() => {
            for (let i = startIndex; i < endIndex; i++) {
                setTimeout(() => {
                    gridItems[i].style.opacity = '1';
                }, 100); // CHANGE/ADJUST: Delay between items in a row
            }

            // Load next row after a small delay
            if (rowIndex < rows - 1) {
                setTimeout(() => loadRow(rowIndex + 1), 300); // CHANGE/ADJUST: Row delay
            }
        });
    }

    // Kick off the row loading
    loadRow(0);
}

// ---------------------- Lightbox behavior ----------------------
// Open the lightbox at a specific image index
function openLightbox(index) {
    currentPhotoIndex = index;
    updateLightbox(); // Set image and caption
    lightbox.classList.add('active');
    lightboxState = false; // Reset to state 1 when opened
    lightbox.classList.remove('dark');

    // Prevent background scrolling while modal is open. If you need to
    // support multiple modals or nested overlays, use a stack-based
    // approach for body overflow management.
    document.body.style.overflow = 'hidden';
}

// Close the lightbox and restore scrolling
function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

/*
  updateLightbox()
  - Loads the full-size image into the lightbox. We use an off-screen
    Image() object to detect when the image is loaded so we can fade it in
    with the caption. This avoids showing a broken or partially loaded image.

  Change guidance:
  - To show loading spinners, add a class while loading and reveal spinner
    until img.onload triggers.
  - If you need progressive JPEGs or LQIP, swap `img.src` updates accordingly.
*/
function updateLightbox() {
    const photo = photos[currentPhotoIndex];

    // Hide image and caption while the new full-size image loads
    lightboxImage.style.opacity = '0';
    lightboxCaption.style.opacity = '0';

    // Preload full-size image
    const img = new Image();
    img.onload = () => {
        // When loaded, set src and alt then fade in
        lightboxImage.src = photo.full;
        lightboxImage.alt = photo.caption; // Keep alt in sync for accessibility

        setTimeout(() => {
            lightboxImage.style.opacity = '1';

            // Fade in caption shortly after the image
            setTimeout(() => {
                lightboxCaption.textContent = photo.caption;
                lightboxCaption.style.opacity = '1';
            }, 250);
        }, 100);
    };
    img.onerror = () => {
        // Basic error handling: show a fallback message. Improve UX by
        // providing a visible placeholder image for offline cases.
        lightboxCaption.textContent = 'Image failed to load.';
        lightboxCaption.style.opacity = '1';
    };
    img.src = photo.full; // Start loading
}

// Move to the previous photo (wrap-around)
function prevPhoto() {
    currentPhotoIndex = (currentPhotoIndex - 1 + photos.length) % photos.length;
    updateLightbox();
}

// Move to the next photo (wrap-around)
function nextPhoto() {
    currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
    updateLightbox();
}

// Toggle lightbox visual state (light/dark). Bound to clicking the image
// and to pressing spacebar when lightbox is open.
function toggleLightboxState() {
    lightboxState = !lightboxState;
    if (lightboxState) {
        lightbox.classList.add('dark');
    } else {
        lightbox.classList.remove('dark');
    }
}

// ---------------------- Touch / swipe support ----------------------
// Basic swipe detection: detects horizontal swipes for image navigation
// and vertical swipe down to close. Works well for short galleries.
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}

function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
}

function handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    const minSwipeDistance = 50; // CHANGE/ADJUST: Tweaks sensitivity

    // Horizontal swipe -> change image
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
            prevPhoto(); // Swipe right = previous
        } else {
            nextPhoto(); // Swipe left = next
        }
    }

    // Vertical swipe down -> close
    if (deltaY > minSwipeDistance && Math.abs(deltaY) > Math.abs(deltaX)) {
        closeLightbox();
    }
}

// ---------------------- Keyboard navigation / accessibility ----------------------
// Escape closes, left/right arrows navigate, space toggles light/dark state.
function handleKeyDown(e) {
    if (!lightbox.classList.contains('active')) return; // Only when modal is open

    switch(e.key) {
        case 'Escape':
            closeLightbox();
            break;
        case 'ArrowLeft':
            prevPhoto();
            break;
        case 'ArrowRight':
            nextPhoto();
            break;
        case ' ': // Spacebar toggles the lightbox appearance
            e.preventDefault();
            toggleLightboxState();
            break;
    }
}

// ---------------------- Event listeners ----------------------
// DOMContentLoaded: initialize the grid once the document structure is ready.
document.addEventListener('DOMContentLoaded', initPhotoGrid);

// Wire up basic UI controls. If you plan to dynamically remove elements,
// consider using event delegation rather than binding to elements directly.
closeBtn.addEventListener('click', closeLightbox);
prevBtn.addEventListener('click', prevPhoto);
nextBtn.addEventListener('click', nextPhoto);
lightboxImage.addEventListener('click', toggleLightboxState);
document.addEventListener('keydown', handleKeyDown);

// Touch events for mobile
lightbox.addEventListener('touchstart', handleTouchStart, false);
lightbox.addEventListener('touchend', handleTouchEnd, false);

/*
  Resize handling:
  - Recalculates column counts and reloads images with the new grouping.
  - The current implementation sets opacity=0 on all items and calls
    loadImagesByRow(columns) again; this is simple but causes a visual
    reflow. For smoother UX, consider only applying changes when the
    breakpoint boundary is crossed (e.g., from 5->3 columns).
*/
window.addEventListener('resize', () => {
    const gridItems = document.querySelectorAll('.grid-item');
    const screenWidth = window.innerWidth;
    let columns = 5;

    if (screenWidth <= 1024) {
        columns = 3;
    }

    // Reset opacity for reloading animation
    gridItems.forEach(item => {
        item.style.opacity = '0';
    });

    // Reload images with new column count
    loadImagesByRow(columns);
});

/*
  Accessibility notes and improvements to consider:
  - Add focus trapping to the lightbox so keyboard users cannot tab out
    of the modal while it's open.
  - Provide clear visible focus styles for interactive elements (buttons/links).
  - Announce changes via ARIA (e.g., aria-live region) when the lightbox
    changes image for screen reader users.
  - Ensure contrast ratios for the dark/light states meet WCAG guidelines.
*/

/*
  Performance & production tips:
  - Replace picsum.photos with your CDN or optimized assets.
  - Add `srcset` and `sizes` to thumbnails/full images for responsive
    image delivery.
  - Use caching headers and consider service worker for offline/fast loads.
  - For very large galleries, implement pagination or infinite scroll
    with lazy-loading rows using IntersectionObserver.
*/
