const html = document.documentElement;
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const frameCount = 240;
const currentFrame = index => (
  `frames/frame_${index.toString().padStart(5, '0')}.jpg`
);

const images = [];
let loadedImages = 0;

// Prevent scrolling while loading
document.body.style.overflow = 'hidden';

const loader = document.getElementById('loader');
const loaderPercentage = document.getElementById('loader-percentage');
const loaderBar = document.getElementById('loader-bar');

const preloadImages = () => {
  for (let i = 1; i <= frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    const handleLoad = () => {
        loadedImages++;
        
        // Update Loader UI
        const percentage = Math.floor((loadedImages / frameCount) * 100);
        if (loaderPercentage && loaderBar) {
            loaderPercentage.innerText = `${percentage}%`;
            loaderBar.style.width = `${percentage}%`;
        }

        // Hide loader when finished
        if (loadedImages === frameCount) {
            if (loader) {
                loader.classList.add('fade-out');
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 500);
            }
            // Restore scrolling
            document.body.style.overflow = 'auto';
        }
    };

    img.onload = () => {
        handleLoad();
        if(i === 1) {
            drawImageCover(context, img, canvas.width, canvas.height);
        }
    };

    img.onerror = () => {
        console.error(`Failed to load frame ${i}`);
        handleLoad();
    };
    images[i] = img;
  }
};

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function drawImageCover(ctx, img, canvasWidth, canvasHeight) {
    if (!img || !img.complete || img.naturalWidth === 0) return;
    
    const imgRatio = img.width / img.height;
    const canvasRatio = canvasWidth / canvasHeight;
    let renderWidth, renderHeight, x, y;

    if (canvasRatio > imgRatio) {
        renderWidth = canvasWidth;
        renderHeight = canvasWidth / imgRatio;
        x = 0;
        y = (canvasHeight - renderHeight) / 2;
    } else {
        renderWidth = canvasHeight * imgRatio;
        renderHeight = canvasHeight;
        x = (canvasWidth - renderWidth) / 2;
        y = 0;
    }

    ctx.drawImage(img, x, y, renderWidth, renderHeight);
}

let currentFrameIndex = 1;
let targetFrameIndex = 1;

window.addEventListener('scroll', () => {
  const scrollTop = html.scrollTop;
  const maxScrollTop = html.scrollHeight - window.innerHeight;
  const scrollFraction = scrollTop / maxScrollTop;
  targetFrameIndex = Math.min(
    frameCount,
    Math.max(1, Math.ceil(scrollFraction * frameCount))
  );
});

function update() {
    currentFrameIndex = targetFrameIndex;
    const frameToDraw = Math.round(currentFrameIndex);
    
    if (images[frameToDraw]) {
        drawImageCover(context, images[frameToDraw], canvas.width, canvas.height);
    }
    
    // Update nav active states
    const scrollPos = window.scrollY;
    let currentSection = "";
    document.querySelectorAll("section, header, footer").forEach((s) => {
        if (s.id && scrollPos >= s.offsetTop - 220) {
            currentSection = s.id;
        }
    });
    document.querySelectorAll(".nav-links a").forEach((a) => {
        a.classList.toggle("active", a.getAttribute("href") === "#" + currentSection);
    });

    requestAnimationFrame(update);
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const frameToDraw = Math.round(currentFrameIndex);
    if (images[frameToDraw]) {
        drawImageCover(context, images[frameToDraw], canvas.width, canvas.height);
    }
});

preloadImages();
update();
