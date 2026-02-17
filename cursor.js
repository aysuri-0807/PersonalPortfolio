const cursor = document.querySelector('.cursor');
let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;

// Adjust speed: smaller = slower
const speed = 0.1; 

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animate() {
  cursorX += -0.5 + (mouseX - cursorX) * speed;
  cursorY += -0.75+ (mouseY - cursorY) * speed;
  cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
  requestAnimationFrame(animate);
}
animate();

// Cursor hover effects on links and buttons
const hoverTargets = document.querySelectorAll('a, button');

hoverTargets.forEach(target => {
  target.addEventListener('mouseenter', () => cursor.classList.add('active'));
  target.addEventListener('mouseleave', () => cursor.classList.remove('active'));
});
