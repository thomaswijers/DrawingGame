const BRUSH_SIZES = [
  { label: 'XS', value: 2 },
  { label: 'S', value: 5 },
  { label: 'M', value: 10 },
  { label: 'L', value: 20 },
  { label: 'XL', value: 40 },
];

let brushColors = [
  '#000000',
  '#ffffff',
  '#e74c3c',
  '#e67e22',
  '#f1c40f',
  '#2ecc71',
  '#3498db',
  '#9b59b6',
];

const ERASER_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 512 511">
  <path fill="#6997b2" d="m340.536 13.875 157.207 157.897-228.389 227.39-157.206-157.898z"/>
  <path fill="#fff" d="m94.706 257.615 157.672 158.364-82.166 81.807L12.54 339.421z"/>
  <path
    fill="#000"
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M305.256 14.567c19.569-19.483 51.227-19.414 70.711.155L497.053 136.34l.452.461c19.028 19.602 18.809 50.918-.608 70.25L206.364 496.314l-.462.452c-19.447 18.879-50.426 18.811-69.791-.152l-.458-.455L14.567 374.541c-19.483-19.569-19.414-51.227.155-70.71zM32.361 321.547c-9.784 9.741-9.82 25.571-.078 35.355L153.37 478.52c9.742 9.784 25.57 9.819 35.355.077l62.804-62.531L94.822 259.358zM358.25 32.361c-9.742-9.784-25.571-9.82-35.355-.078L112.538 241.719l156.708 156.708 210.013-209.093c9.784-9.742 9.818-25.57.077-35.355z"
  />
</svg>
`;

const CLEAR_ICON = `<i class="fa-solid fa-trash"></i>`;

const elements = {
  canvas: document.getElementById('canvas'),
  sizeControls: document.getElementById('size-controls'),
  colorControls: document.getElementById('color-controls'),
  finishButton: document.getElementById('btn-finish'),
  printButton: document.getElementById('btn-print'),
  paintingImage: document.getElementById('painting'),
  printFrame: document.getElementById('print-frame'),
  postGameActions: document.getElementById('post-game-actions'),
  toolbarBox: document.querySelector('.toolbar-box'),
  selectedPainting: $("#selected-painting"),
};

const ctx = elements.canvas.getContext('2d');

let brush = {
  color: brushColors[0],
  size: BRUSH_SIZES[2].value,
  isEraser: false,
};

const drawingState = {
  isDrawing: false,
  lastX: 0,
  lastY: 0,
};

const paintingState = {
  orientation: 'landscape',
};

const brushColorCache = new Map();

let timerInterval = null;

function initialize() {
  renderSizeControls();
  renderColorControls();
  bindEvents();
  setChosenPainting();
  setColorPallete();
  startTimer(120);
}

function bindEvents() {
  window.addEventListener('resize', resizeCanvas);

  bindPointerEvents();

  elements.finishButton.addEventListener('click', endDrawingGame);
  elements.printButton.addEventListener('click', () => printDrawing(paintingState.orientation));
}

function bindPointerEvents() {
  const startDrawing = event => {
    drawingState.isDrawing = true;

    const { x, y } = getPointerPosition(event);

    drawingState.lastX = x;
    drawingState.lastY = y;
  };

  const draw = event => {
    if (!drawingState.isDrawing) {
      return;
    }

    event.preventDefault();

    const { x, y } = getPointerPosition(event);

    paintStroke(x, y);
  };

  const stopDrawing = () => {
    drawingState.isDrawing = false;
  };

  elements.canvas.addEventListener('pointerdown', startDrawing);
  elements.canvas.addEventListener('pointermove', draw);
  elements.canvas.addEventListener('pointerup', stopDrawing);
  elements.canvas.addEventListener('pointerleave', stopDrawing);

  elements.canvas.style.touchAction = 'none';
}

function resizeCanvas() {
  const { canvas } = elements;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  if (paintingState.orientation === 'portrait') {
    canvas.width = canvas.offsetHeight;
    canvas.height = canvas.offsetWidth;
  } else {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  ctx.putImageData(imageData, 0, 0);
  applyBrushSettings();
}

function applyBrushSettings() {
  ctx.globalCompositeOperation = brush.isEraser
    ? 'destination-out'
    : 'source-over';
}

function renderSizeControls() {
  BRUSH_SIZES.forEach((size, index) => {
    const button = document.createElement('button');
    const dot = document.createElement('span');

    dot.className = 'size-dot';

    button.append(dot);
    button.className = `btn brush-btn size-${size.label}`;
    button.dataset.size = size.value;

    button.addEventListener('click', () => {
      brush.size = size.value;
      brush.isEraser = false;

      applyBrushSettings();
      setActiveButton(elements.sizeControls, button);
    });

    elements.sizeControls.append(button);

    if (index === 2) {
      setActiveButton(elements.sizeControls, button);
    }
  });

  const eraserButton = document.createElement('button');

  eraserButton.className = 'btn brush-btn eraser-btn';
  eraserButton.innerHTML = ERASER_ICON;

  eraserButton.addEventListener('click', () => {
    brush.isEraser = true;

    applyBrushSettings();
    setActiveButton(elements.sizeControls, eraserButton);
  });

  elements.sizeControls.append(eraserButton);

  const clearButton = document.createElement('button');

  clearButton.className = 'btn brush-btn btn-clear';
  clearButton.innerHTML = CLEAR_ICON;
  clearButton.addEventListener('click', () => {
    clearCanvas();
  });

  elements.sizeControls.append(clearButton);
}

function renderColorControls() {
  elements.colorControls.innerHTML = "";

  brushColors.forEach((color, index) => {
    const button = document.createElement('button');

    button.className = 'btn brush-color-btn';
    button.style.backgroundColor = color;

    button.addEventListener('click', () => {
      brush.color = color;

      setActiveButton(elements.colorControls, button);
    });

    elements.colorControls.append(button);

    if (index === 0) {
      setActiveButton(elements.colorControls, button);
    }
  });
}

function setActiveButton(container, activeButton) {
  [...container.children].forEach(button => {
    button.classList.toggle('active', button === activeButton);
  });
}

function getPointerPosition(event) {
  const pointer = event.touches?.[0] || event;
  const rect = elements.canvas.getBoundingClientRect();

  const scaleX = elements.canvas.width / rect.width;
  const scaleY = elements.canvas.height / rect.height;

  return {
    x: (pointer.clientX - rect.left) * scaleX,
    y: (pointer.clientY - rect.top) * scaleY,
  };
}

function hexToRgb(hex) {
  if (brushColorCache.has(hex)) {
    return brushColorCache.get(hex);
  }

  const sanitizedHex = hex.replace('#', '');

  const rgb = {
    r: Number.parseInt(sanitizedHex.slice(0, 2), 16),
    g: Number.parseInt(sanitizedHex.slice(2, 4), 16),
    b: Number.parseInt(sanitizedHex.slice(4, 6), 16),
  };

  brushColorCache.set(hex, rgb);

  return rgb;
}

function paintStroke(currentX, currentY) {
  const { lastX, lastY } = drawingState;

  if (brush.isEraser) {
    drawEraserStroke(currentX, currentY);
    return;
  }

  const deltaX = currentX - lastX;
  const deltaY = currentY - lastY;
  const distance = Math.hypot(deltaX, deltaY);

  if (distance === 0) return;

  const { r, g, b } = hexToRgb(brush.color);

  const perpendicularX = -deltaY / distance;
  const perpendicularY = deltaX / distance;

  const bristleCount = Math.max(8, Math.floor(brush.size * 1.2));
  const spread = brush.size * 0.8;

  // Number of interpolation steps along the stroke for smoothness
  const steps = Math.max(1, Math.floor(distance / 2));

  for (let step = 0; step <= steps; step++) {
    const t = step / steps;
    const x = lastX + deltaX * t;
    const y = lastY + deltaY * t;

    for (let i = 0; i < bristleCount; i++) {
      const position = i / (bristleCount - 1) - 0.5;

      // Edge fade — bristles at the edge are more transparent
      const edgeFade = 1 - Math.pow(Math.abs(position) * 2, 1.5) * 0.5;

      // Taper at start and end of stroke
      const taper = Math.sin(t * Math.PI) * 0.4 + 0.6;

      const opacity = (0.15 + Math.random() * 0.1) * edgeFade * taper;

      // Bristle offset with natural wobble
      const wobble = (Math.random() - 0.5) * brush.size * 0.15;
      const offsetDistance = position * spread + wobble;

      const bx = x + perpendicularX * offsetDistance;
      const by = y + perpendicularY * offsetDistance;

      const radius = Math.max(0.4, (0.6 + Math.random() * 0.8) * edgeFade);

      ctx.beginPath();
      ctx.arc(bx, by, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      ctx.fill();
    }
  }

  // Subtle central body of the stroke for cohesion
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(currentX, currentY);
  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.08)`;
  ctx.lineWidth = brush.size * 0.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  drawingState.lastX = currentX;
  drawingState.lastY = currentY;
}

function drawEraserStroke(currentX, currentY) {
  ctx.beginPath();
  ctx.moveTo(drawingState.lastX, drawingState.lastY);
  ctx.lineTo(currentX, currentY);

  ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
  ctx.lineWidth = brush.size * 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.stroke();

  drawingState.lastX = currentX;
  drawingState.lastY = currentY;
}

function clearCanvas() {
  ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
}

function printDrawing(orientation = 'landscape') {
  const dataUrl = elements.canvas.toDataURL('image/png');

  elements.printFrame.srcdoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          @page {
            margin: 0;
            size: A4 ${orientation};
          }

          html, body {
            width: 100%;
            height: 100%;
            overflow: hidden;
          }

          img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" alt="Canvas drawing" />

        <script>
          document.querySelector('img').onload = () => {
            window.focus();
            window.print();
          };
        <\/script>
      </body>
    </html>
  `;
}

function setChosenPainting() {
  $.getJSON("data/Paintings.json", function (data) {
    let paintingID = Number(localStorage.getItem("selectedPainting"));
    const idToFind = paintingID == 0 || paintingID == undefined ? Math.floor(Math.random() * data.length) : paintingID;
    const painting = data.find(p => p.id === idToFind);

    paintingState.orientation = painting.orientation || 'landscape';

    elements.canvas.classList.remove('portrait', 'landscape');
    elements.canvas.classList.add(paintingState.orientation);

    elements.paintingImage.src = painting.url;
    elements.paintingImage.classList.add("painting");
    elements.selectedPainting.append(`<img src="${painting.url}" alt="${painting.title}" />`);

    // Wait for CSS to apply before reading offsetWidth/offsetHeight
    setTimeout(() => resizeCanvas(), 0);
  });
}

function setColorPallete() {
  $.getJSON("data/ColorPalettes.json", function (data) {
    let paintingID = Number(localStorage.getItem("selectedPainting"));
    const idToFind = paintingID == 0 || paintingID == undefined ? Math.floor(Math.random() * data.length) : paintingID;
    const painting = data.find(p => p.paintingID === idToFind);

    brushColors = painting.colors.length > 0 ? painting.colors : brushColors;
    brush.color = painting.colors[0];
    renderColorControls();
    console.log(painting);
    console.log(brushColors);
  });
}

function startTimer(durationInSeconds) {
  let timeLeft = durationInSeconds;

  const timerEl = document.getElementById("timer");

  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timerEl.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      endDrawingGame();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function endDrawingGame() {
  elements.toolbarBox.classList.add("d-none");

  drawingState.isDrawing = false;
  elements.canvas.style.pointerEvents = 'none';

  if (timerInterval == null) {
    const toastEl = document.getElementById("timesUp");
    new bootstrap.Toast(toastEl, {
      autohide: true,
      delay: 3000
    }).show();
  }

  stopTimer();
  elements.postGameActions.classList.remove("d-none");
}

initialize();