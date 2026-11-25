type Point = { x: number; y: number };

type Bean = {
  target: Point;
  offset: Point;
  angle: number;
  turn: number;
  size: number;
  delay: number;
  openingSize?: number;
  sprite: HTMLCanvasElement;
};

const MASK_WIDTH = 850;

function seed(index: number, salt: number) {
  const value = Math.sin(index * 9283.31 + salt * 77.17) * 43758.5453;
  return value - Math.floor(value);
}

function makeSprite(index: number) {
  const sprite = document.createElement("canvas");
  sprite.width = 72;
  sprite.height = 54;
  const ctx = sprite.getContext("2d");
  if (!ctx) return null;

  const roasts = [
    ["#9e6947", "#62341f", "#28150e"],
    ["#875239", "#512c1c", "#24130d"],
    ["#ab7751", "#6e3d24", "#321910"],
    ["#946045", "#5a3223", "#2b180f"],
  ];
  const [highlight, middle, edge] = roasts[index];
  const shoulder = index % 2 ? 4 : 0;
  const outline = new Path2D(
    `M 9 30 C 6 19 15 ${9 + shoulder} 30 8 C 44 5 60 14 63 24 C 67 35 53 45 38 45 C 23 47 12 40 9 30 Z`,
  );

  ctx.save();
  ctx.shadowColor = "#321b1060";
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY = 3;
  const roast = ctx.createRadialGradient(25, 17, 1, 33, 26, 34);
  roast.addColorStop(0, highlight);
  roast.addColorStop(0.45, middle);
  roast.addColorStop(1, edge);
  ctx.fillStyle = roast;
  ctx.fill(outline);
  ctx.restore();
  ctx.save();
  ctx.clip(outline);

  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = i % 2 ? "#f1bd8726" : "#190d1133";
    ctx.fillRect(6 + seed(i, index + 20) * 59, 6 + seed(i, index + 30) * 40, 0.8, 0.8);
  }

  const bend = 20 + index * 2;
  const crease = new Path2D(`M 13 32 C 23 33 27 ${bend} 37 25 S 52 27 60 21`);
  ctx.lineCap = "round";
  ctx.save();
  ctx.translate(0, 1.5);
  ctx.strokeStyle = "#ce946269";
  ctx.lineWidth = 2.8;
  ctx.stroke(crease);
  ctx.restore();
  ctx.strokeStyle = "#26130d";
  ctx.lineWidth = 2.1;
  ctx.stroke(crease);
  ctx.restore();
  return sprite;
}

function sampleLetters(compact: boolean, height: number) {
  const mask = document.createElement("canvas");
  mask.width = MASK_WIDTH;
  mask.height = height;
  const ctx = mask.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const lines = compact ? ["TWENTY", "SECOND"] : ["TWENTY SECOND"];
  const fontSize = compact ? 163 : 98;
  ctx.font = `900 ${fontSize}px Arial, sans-serif`;
  lines.forEach((line, index) => {
    const metrics = ctx.measureText(line);
    const centre = compact ? (index === 0 ? 148 : 296) : height / 2;
    const baseline = centre + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
    ctx.fillText(line, MASK_WIDTH / 2, baseline, MASK_WIDTH - 100);
  });

  const data = ctx.getImageData(0, 0, MASK_WIDTH, height).data;
  const step = compact ? 13 : 7.5;
  const points: Point[] = [];
  for (let y = step, row = 0; y < height; y += step * 0.87, row++) {
    for (let x = step + (row % 2) * step / 2; x < MASK_WIDTH; x += step) {
      if (data[(Math.floor(y) * MASK_WIDTH + Math.floor(x)) * 4 + 3] > 210) {
        points.push({ x, y });
      }
    }
  }
  return points;
}

export function createBeanScene(canvas: HTMLCanvasElement, compact: boolean) {
  const height = compact ? 445 : 242;
  const points = sampleLetters(compact, height);
  const sprites = Array.from({ length: 4 }, (_, index) => makeSprite(index))
    .filter((sprite) => sprite !== null);
  canvas.width = MASK_WIDTH * 1.5;
  canvas.height = Math.round(height * 1.5);
  const context = canvas.getContext("2d");
  if (!context || !points.length || !sprites.length) return null;

  // Start with a small, composed group. Assign each bean a nearby letter
  // position so it can join the lettering without crossing the others.
  const centre = { x: MASK_WIDTH / 2, y: height / 2 };
  const spacing = compact ? 65 : 42;
  const openingBeans = new Map<number, { point: Point; angle: number; size: number }>();
  for (const [index, offset] of [-1, 0, 1].entries()) {
    const point = { x: centre.x + offset * spacing, y: centre.y + (index === 1 ? -5 : 3) };
    let nearest = -1;
    let distance = Infinity;
    points.forEach((target, targetIndex) => {
      const candidate = Math.hypot(target.x - point.x, target.y - point.y);
      if (candidate >= distance || openingBeans.has(targetIndex)) return;
      distance = candidate;
      nearest = targetIndex;
    });
    if (nearest !== -1) {
      openingBeans.set(nearest, {
        point,
        angle: [-0.36, 0.48, -0.18][index],
        size: (compact ? 43 : 30) * [0.91, 1, 0.86][index],
      });
    }
  }

  const beans: Bean[] = points.map((target, index) => {
    const opening = openingBeans.get(index);
    const side = seed(index, 1) > 0.5 ? 1 : -1;
    const position = {
      x: target.x + (seed(index, 8) - 0.5) * 1.2,
      y: target.y + (seed(index, 9) - 0.5) * 1.2,
    };
    const angle = (seed(index, 4) - 0.5) * Math.PI;
    return {
      target: position,
      openingSize: opening?.size,
      offset: opening ? {
        x: opening.point.x - position.x,
        y: opening.point.y - position.y,
      } : {
        x: (seed(index, 2) - 0.5) * 42,
        y: side * ((compact ? 32 : 24) + seed(index, 3) * (compact ? 49 : 36)),
      },
      angle,
      turn: opening ? opening.angle - angle : (seed(index, 5) - 0.5) * 0.95,
      size: (compact ? 16.5 : 9.6) * (0.9 + seed(index, 6) * 0.22),
      delay: opening ? 0 : 0.05 + (target.x / MASK_WIDTH) * 0.27 + seed(index, 7) * 0.08,
      sprite: sprites[index % sprites.length],
    };
  });

  return {
    draw(progress: number) {
      context.setTransform(1.5, 0, 0, 1.5, 0, 0);
      context.clearRect(0, 0, MASK_WIDTH, height);
      for (const bean of beans) {
        const time = Math.max(0, Math.min(1, (progress - bean.delay) / (1 - bean.delay)));
        if (time === 0 && bean.openingSize === undefined) continue;
        const eased = time * time * (3 - 2 * time);
        const remaining = 1 - eased;
        const x = bean.target.x + bean.offset.x * remaining + Math.sin(eased * Math.PI) * bean.offset.y * 0.14;
        const y = bean.target.y + bean.offset.y * remaining;
        const angle = bean.angle + bean.turn * remaining;
        const size = bean.size * eased + (bean.openingSize ?? bean.size * 0.83) * remaining;
        const cos = Math.cos(angle) * 1.5;
        const sin = Math.sin(angle) * 1.5;

        context.setTransform(cos, sin, -sin, cos, x * 1.5, y * 1.5);
        context.globalAlpha = bean.openingSize === undefined ? Math.min(1, time * 3.1) : 1;
        context.drawImage(bean.sprite, -size / 2, -size * 0.375, size, size * 0.75);
      }
      context.globalAlpha = 1;
    },
  };
}
