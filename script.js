// Execute after page loading is complete
document.addEventListener('DOMContentLoaded', function() {
    // Navigation bar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });

    // Smooth scroll to anchor points
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Video thumbnail generation functionality
    const video = document.getElementById('mainVideo');
    const canvas = document.getElementById('videoCanvas');
    const generateBtn = document.getElementById('generateThumbnail');
    const downloadBtn = document.getElementById('downloadThumbnail');
    let thumbnailDataUrl = null;

    // Generate thumbnail from video middle frame
    function generateThumbnail() {
        if (!video || !canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Seek to middle of video for better frame selection
        const middleTime = video.duration / 2;
        video.currentTime = middleTime;

        // Wait for seek to complete
        video.addEventListener('seeked', function captureFrame() {
            // Ensure we have a good frame by waiting a bit more
            setTimeout(() => {
                // Draw current frame to canvas with better quality
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                // Convert to data URL with higher quality
                thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.95);
                
                // Set as video poster
                video.poster = thumbnailDataUrl;
                
                // Show download button
                downloadBtn.style.display = 'inline-block';
                
                // Update button text
                generateBtn.textContent = 'Regenerate Thumbnail';
                
                console.log('Thumbnail generated from middle frame at', middleTime.toFixed(2), 'seconds');
            }, 100); // Small delay to ensure frame is fully loaded
            
            // Remove event listener to avoid multiple calls
            video.removeEventListener('seeked', captureFrame);
        }, { once: true });
    }

    // Download thumbnail
    function downloadThumbnail() {
        if (!thumbnailDataUrl) return;

        const link = document.createElement('a');
        link.download = 'video-thumbnail.jpg';
        link.href = thumbnailDataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Event listeners
    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            if (video.readyState >= 2) { // Video metadata loaded
                generateThumbnail();
            } else {
                // Wait for metadata to load
                video.addEventListener('loadedmetadata', generateThumbnail, { once: true });
            }
        });
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadThumbnail);
    }

    // Auto-generate thumbnail when video metadata loads
    if (video) {
        video.addEventListener('loadedmetadata', function() {
            // Auto-generate thumbnail after a short delay
            setTimeout(() => {
                if (video.duration > 0) {
                    generateThumbnail();
                }
            }, 500);
        });
    }

    // Contact form submission
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const message = this.querySelector('textarea').value;

            if (name && email && message) {
                alert('Thank you for your message! I will reply to you as soon as possible.');
                this.reset();
            } else {
                alert('Please fill in complete contact information.');
            }
        });
    }

    // 调试：检查portfolio图片状态
    const portfolioImages = document.querySelectorAll('.portfolio-item img');
    console.log('Portfolio images found:', portfolioImages.length);
    portfolioImages.forEach((img, index) => {
        console.log(`Portfolio image ${index}:`, {
            src: img.src,
            opacity: getComputedStyle(img).opacity,
            visibility: getComputedStyle(img).visibility,
            display: getComputedStyle(img).display
        });
    });

    // 图片懒加载效果 - 排除portfolio图片和主要展示图片
    const images = document.querySelectorAll('img:not(.portfolio-item img):not(.main-portrait):not(.hero-image):not(.about-image img)');
    console.log('Non-portfolio images for lazy loading:', images.length);
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                console.log('Lazy loading image:', img.src);
                
                // 检查图片是否已经加载完成
                if (img.complete && img.naturalHeight !== 0) {
                    console.log('Image already loaded:', img.src);
                    // 图片已经加载，直接显示
                    img.style.opacity = '1';
                } else {
                    // 图片未加载，应用懒加载效果
                    img.style.opacity = '0';
                    img.style.transition = 'opacity 0.5s ease';
                    
                    img.onload = function() {
                        console.log('Image loaded:', this.src);
                        this.style.opacity = '1';
                    };
                }
                
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => {
        imageObserver.observe(img);
    });

    // 滚动动画效果 - 只应用于书籍和研究论文
    const nonPortfolioElements = document.querySelectorAll('.book-item, .research-paper');
    
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    // 只对书籍和研究论文应用滚动动画
    nonPortfolioElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        scrollObserver.observe(el);
    });

    // Mobile navigation menu
    const navToggle = document.createElement('button');
    navToggle.innerHTML = '☰';
    navToggle.style.cssText = `
        display: none;
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #8B4513;
        cursor: pointer;
    `;

    const navContainer = document.querySelector('.nav-container');
    navContainer.appendChild(navToggle);

    // Responsive navigation
    function checkScreenSize() {
        const navMenu = document.querySelector('.nav-menu');
        if (window.innerWidth <= 768) {
            navToggle.style.display = 'block';
            navMenu.style.display = 'none';
        } else {
            navToggle.style.display = 'none';
            navMenu.style.display = 'flex';
        }
    }

    navToggle.addEventListener('click', function() {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu.style.display === 'none' || navMenu.style.display === '') {
            navMenu.style.display = 'flex';
            navMenu.style.flexDirection = 'column';
            navMenu.style.position = 'absolute';
            navMenu.style.top = '100%';
            navMenu.style.left = '0';
            navMenu.style.right = '0';
            navMenu.style.background = 'white';
            navMenu.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
            navMenu.style.padding = '1rem';
        } else {
            navMenu.style.display = 'none';
        }
    });

    window.addEventListener('resize', checkScreenSize);
    checkScreenSize();
});