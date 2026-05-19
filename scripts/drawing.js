const PAINTINGS_URLS = [
  { Url: 'paintings/A-german-flare-goes-up.png', Title: 'A german flare goes up', Painter: 'Alex'},
  { Url: 'paintings/Anti-airgun-near-nijmegen-bridge.png', Title: 'Anti airgun near nijmegen bridge', Painter: 'Alex'},
  { Url: 'paintings/Landing-craft-assault.png', Title: 'Landing craft assault off Southern France', Painter: 'Alex'},
  { Url: 'paintings/The-nijmegen-bridge.png', Title: 'The Nijmegen bridge, Holland', Painter: 'Alex'},
  { Url: 'paintings/Armoured-cars-in-Nijmegen.png', Title: 'Armoured cars in Nijmegen', Painter: 'Alex'},
  { Url: 'paintings/Infantry-near-nijmegen-holland.png', Title: 'Infantry, near Nijmegen, Holland', Painter: 'Alex'},
  { Url: 'paintings/Canteen.png', Title: 'Canteen, Nijmegen, Hollland', Painter: 'Molly'},
];

const BRUSH_SIZES = [
  { label: 'XS', value: 2 },
  { label: 'S', value: 5 },
  { label: 'M', value: 10 },
  { label: 'L', value: 20 },
  { label: 'XL', value: 40 },
];

const BRUSH_COLORS = [
  { label: 'Black', value: '#000000' },
  { label: 'White', value: '#ffffff' },
  { label: 'Red', value: '#e74c3c' },
  { label: 'Orange', value: '#e67e22' },
  { label: 'Yellow', value: '#f1c40f' },
  { label: 'Green', value: '#2ecc71' },
  { label: 'Blue', value: '#3498db' },
  { label: 'Purple', value: '#9b59b6' },
];

const BRUSH_PROPERTIES = [
  {
    id: 'line-cap',
    label: 'Cursor style',
    type: 'select',
    applyTo: 'lineCap',
    options: [
      { label: 'Round', value: 'round' },
      { label: 'Square', value: 'square' },
    ],
  },
];

const SVG_CODE = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 512 511"><path fill="#6997b2" d="m340.536 13.875 157.207 157.897-228.389 227.39-157.206-157.898z"/><path fill="#fff" d="m94.706 257.615 157.672 158.364-82.166 81.807L12.54 339.421z"/><path fill="#000" fill-rule="evenodd" d="M305.256 14.567c19.569-19.483 51.227-19.414 70.711.155L497.053 136.34l.452.461c19.028 19.602 18.809 50.918-.608 70.25L206.364 496.314l-.462.452c-19.447 18.879-50.426 18.811-69.791-.152l-.458-.455L14.567 374.541c-19.483-19.569-19.414-51.227.155-70.71zM32.361 321.547c-9.784 9.741-9.82 25.571-.078 35.355L153.37 478.52c9.742 9.784 25.57 9.819 35.355.077l62.804-62.531L94.822 259.358zM358.25 32.361c-9.742-9.784-25.571-9.82-35.355-.078L112.538 241.719l156.708 156.708 210.013-209.093c9.784-9.742 9.818-25.57.077-35.355z" clip-rule="evenodd"/></svg>';

/**** CANVAS SETUP ****/
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  ctx.putImageData(data, 0, 0);
  applyBrushState();
}

window.addEventListener('resize', resizeCanvas);

const brush = {
  color: BRUSH_COLORS[0].value,
  size: BRUSH_SIZES[2].value,
  properties: {},
};

BRUSH_PROPERTIES.forEach(prop => {
  if (prop.type === 'select') brush.properties[prop.id] = prop.options[0].value;
  if (prop.type === 'range') brush.properties[prop.id] = prop.default;
  if (prop.type === 'checkbox') brush.properties[prop.id] = prop.default ?? false;
});

function applyBrushState() {
  ctx.strokeStyle = brush.color;
  ctx.lineWidth = brush.size;
  ctx.lineJoin = 'round';
  BRUSH_PROPERTIES.forEach(prop => {
    const value = brush.properties[prop.id];
    if (typeof prop.applyTo === 'function') {
      prop.applyTo(ctx, value);
    } else {
      ctx[prop.applyTo] = value;
    }
  });
}

/**** TOOLBAR RENDERING ****/
function renderSizeControls() {
  const container = document.getElementById('size-controls');
  BRUSH_SIZES.forEach(s => {
    const btn = document.createElement('button');
    const span = document.createElement('span');
    span.classList.add("size-dot");
    btn.appendChild(span);
    btn.dataset.size = s.value;
    btn.classList.add("btn", "brush-btn", "size-" + s.label);
    btn.addEventListener('click', () => {
      brush.size = s.value;
      brush.properties['eraser-mode'] = false;
      ctx.globalCompositeOperation = 'source-over';
      applyBrushState();
      highlightActive(container, btn);
    });
    container.appendChild(btn);
  });

  const eraserBtn = document.createElement('button');
  eraserBtn.classList.add("btn", "brush-btn", "eraser-btn");
  eraserBtn.innerHTML = SVG_CODE;
  eraserBtn.addEventListener('click', () => {
    brush.properties['eraser-mode'] = true;
    ctx.globalCompositeOperation = 'destination-out';
    highlightActive(container, eraserBtn);
  });
  container.appendChild(eraserBtn);

  highlightActive(container, container.children[2]);
}

function renderColorControls() {
  const container = document.getElementById('color-controls');
  BRUSH_COLORS.forEach(c => {
    const btn = document.createElement('button');
    btn.style.backgroundColor = c.value;
    btn.classList.add("btn", "brush-color-btn");
    btn.addEventListener('click', () => {
      brush.color = c.value;
      document.querySelector("#active-color").style.backgroundColor = c.value;
      applyBrushState();
      highlightActive(container, btn);
    });
    container.appendChild(btn);
  });
  highlightActive(container, container.children[0]);
}

function renderExtraControls() {
  const container = document.getElementById('extra-controls');
  BRUSH_PROPERTIES.forEach(prop => {
    const wrapper = document.createElement('div');
    wrapper.id = `wrapper-${prop.id}`;
    wrapper.classList.add("extra-property")
    const lbl = document.createElement('label');
    lbl.htmlFor = prop.id;
    lbl.textContent = prop.label + ': ';
    let input;
    if (prop.type === 'select') {
      input = document.createElement('select');
      input.classList.add("form-select");
      input.id = prop.id;
      prop.options.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o.value;
        opt.textContent = o.label;
        input.appendChild(opt);
      });
      input.addEventListener('change', () => {
        brush.properties[prop.id] = input.value;
        applyBrushState();
      });
    }
    if (prop.type === 'range') {
      input = document.createElement('input');
      input.type = 'range';
      input.id = prop.id;
      input.min = prop.min;
      input.max = prop.max;
      input.step = prop.step;
      input.value = prop.default;
      input.addEventListener('input', () => {
        brush.properties[prop.id] = parseFloat(input.value);
        applyBrushState();
      });
    }
    if (prop.type === 'checkbox') {
      input = document.createElement('input');
      input.type = 'checkbox';
      input.id = prop.id;
      input.checked = prop.default ?? false;
      input.addEventListener('change', () => {
        brush.properties[prop.id] = input.checked;
        applyBrushState();
      });
    }
    wrapper.appendChild(lbl);
    if (input) wrapper.appendChild(input);
    container.appendChild(wrapper);
  });
}

function highlightActive(container, activeBtn) {
  Array.from(container.children).forEach(el => el.classList.remove("active"));
  if (activeBtn) activeBtn.classList.add("active");
}

/**** DRAWING LOGIC ****/
let isDrawing = false;

canvas.addEventListener('mousedown', e => {
  isDrawing = true;
  const { x, y } = getPos(e);
  ctx.beginPath();
  ctx.moveTo(x, y);
});

canvas.addEventListener('mousemove', e => {
  if (!isDrawing) return;
  const { x, y } = getPos(e);
  ctx.lineTo(x, y);
  ctx.stroke();
});

canvas.addEventListener('mouseup', () => { isDrawing = false; ctx.beginPath(); });
canvas.addEventListener('mouseleave', () => { isDrawing = false; ctx.beginPath(); });

canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  isDrawing = true;
  const { x, y } = getPos(e.touches[0]);
  ctx.beginPath();
  ctx.moveTo(x, y);
}, { passive: false });

canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  if (!isDrawing) return;
  const { x, y } = getPos(e.touches[0]);
  ctx.lineTo(x, y);
  ctx.stroke();
}, { passive: false });

canvas.addEventListener('touchend', () => { isDrawing = false; ctx.beginPath(); });

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

/**** ACTION BUTTONS ****/
document.getElementById('btn-clear').addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

document.getElementById('btn-print').addEventListener('click', () => {
  printDrawing();
});

function printDrawing() {
  const dataUrl = canvas.toDataURL('image/png');
  const frame = document.getElementById('print-frame');
  const html = `<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { margin: 0; }
  body { width: 100vw; height: 100vh; }
  img  { width: 100%; height: 100%; object-fit: contain; }
</style>
</head>
<body>
  <img src="${dataUrl}" />
  <script>
    document.querySelector('img').onload = function () {
      window.focus();
      window.print();
    };
  <\/script>
</body>
</html>`;
  frame.srcdoc = html;
}


document.querySelector("#btn-painting").addEventListener('click', () => {
  let rn = Math.floor(Math.random() * PAINTINGS_URLS.length);
  let selectedPainting = PAINTINGS_URLS[rn];

  document.querySelector("#painting").src = `images/${selectedPainting.Url}`;
  document.querySelector("#painting").classList.add("painting");
});

/**** INIT ****/
renderSizeControls();
renderColorControls();
renderExtraControls();
resizeCanvas();