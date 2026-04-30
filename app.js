const canvas = document.getElementById("system-map");
const context = canvas.getContext("2d");

const state = {
  width: 0,
  height: 0,
  nodes: [],
  pointer: { x: 0, y: 0, active: false },
};

const families = [
  { label: "eval", color: "#2458d3" },
  { label: "rag", color: "#087f5b" },
  { label: "voice", color: "#7c3aed" },
  { label: "report", color: "#b45309" },
];

function resize() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  state.width = canvas.clientWidth;
  state.height = canvas.clientHeight;
  canvas.width = Math.floor(state.width * ratio);
  canvas.height = Math.floor(state.height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  buildNodes();
}

function buildNodes() {
  const count = Math.max(34, Math.min(82, Math.floor(state.width / 18)));
  state.nodes = Array.from({ length: count }, (_, index) => {
    const family = families[index % families.length];
    const lane = index % 4;
    return {
      x: 40 + Math.random() * Math.max(80, state.width - 80),
      y: 54 + lane * (state.height / 4.6) + Math.random() * 86,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.18,
      radius: 2.2 + Math.random() * 2.8,
      color: family.color,
      label: family.label,
    };
  });
}

function draw() {
  context.clearRect(0, 0, state.width, state.height);
  drawGrid();
  moveNodes();
  drawConnections();
  drawNodes();
  requestAnimationFrame(draw);
}

function drawGrid() {
  context.save();
  context.globalAlpha = 0.22;
  context.strokeStyle = "#9aa9a0";
  context.lineWidth = 1;
  const gap = Math.max(72, Math.floor(state.width / 12));
  for (let x = 0; x <= state.width; x += gap) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, state.height);
    context.stroke();
  }
  for (let y = 0; y <= state.height; y += gap) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(state.width, y);
    context.stroke();
  }
  context.restore();
}

function moveNodes() {
  state.nodes.forEach((node) => {
    node.x += node.vx;
    node.y += node.vy;

    if (state.pointer.active) {
      const dx = node.x - state.pointer.x;
      const dy = node.y - state.pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 140 && distance > 1) {
        node.x += (dx / distance) * 0.24;
        node.y += (dy / distance) * 0.24;
      }
    }

    if (node.x < 18 || node.x > state.width - 18) node.vx *= -1;
    if (node.y < 18 || node.y > state.height - 18) node.vy *= -1;
  });
}

function drawConnections() {
  context.save();
  for (let i = 0; i < state.nodes.length; i += 1) {
    for (let j = i + 1; j < state.nodes.length; j += 1) {
      const first = state.nodes[i];
      const second = state.nodes[j];
      const distance = Math.hypot(first.x - second.x, first.y - second.y);
      if (distance > 132) continue;
      const alpha = 1 - distance / 132;
      context.globalAlpha = alpha * 0.36;
      context.strokeStyle = first.label === second.label ? first.color : "#738178";
      context.lineWidth = first.label === second.label ? 1.4 : 0.8;
      context.beginPath();
      context.moveTo(first.x, first.y);
      context.lineTo(second.x, second.y);
      context.stroke();
    }
  }
  context.restore();
}

function drawNodes() {
  context.save();
  state.nodes.forEach((node) => {
    context.globalAlpha = 0.88;
    context.fillStyle = node.color;
    const size = node.radius * 2.8;
    context.fillRect(node.x - size / 2, node.y - size / 2, size, size);

    context.globalAlpha = 0.34;
    context.strokeStyle = node.color;
    context.strokeRect(node.x - size, node.y - size, size * 2, size * 2);
  });
  context.restore();
}

window.addEventListener("resize", resize);
window.addEventListener("pointermove", (event) => {
  const rect = canvas.getBoundingClientRect();
  state.pointer.x = event.clientX - rect.left;
  state.pointer.y = event.clientY - rect.top;
  state.pointer.active = true;
});
window.addEventListener("pointerleave", () => {
  state.pointer.active = false;
});

resize();
draw();
