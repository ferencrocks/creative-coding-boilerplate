import { getViewportSize } from './helpers.js';
import gsap from 'gsap';

const CONTROL_POINT_DEFAULT_FLUCTUATION = 0.1;

function initSvg(svgElement) {
  const { width: vw, height: vh } = getViewportSize();
  svgElement.setAttribute('width', vw);
  svgElement.setAttribute('height', vh);

  // Create a path element for the bezier curve
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute('fill', '#3ea4f0');
  path.setAttribute('stroke', '#416bdf');
  path.setAttribute('stroke-width', '2');
  svgElement.appendChild(path);

  return path;
}

function getBezierPoints(percent, fluctuation = CONTROL_POINT_DEFAULT_FLUCTUATION) {
  const { width: vw, height: vh } = getViewportSize();
  const cpDX = vw * fluctuation;
  const cpDY = vh * fluctuation;

  const spY = vh - vh * percent;
  const sp = { x: 0, y: spY };
  const cp1 = { x: cpDX, y: spY - cpDY };
  const cp2 = { x: vw - cpDX, y: spY + cpDY };
  const ep = { x: vw, y: spY };

  return { sp, cp1, cp2, ep };
}

function updateSvgPath(path, percent, fluctuation = CONTROL_POINT_DEFAULT_FLUCTUATION) {
  const { width: vw, height: vh } = getViewportSize();
  const { sp, cp1, cp2, ep } = getBezierPoints(percent, fluctuation);

  path.setAttribute('d', `M ${sp.x} ${sp.y} C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${ep.x} ${ep.y} L ${vw} ${vh} L 0 ${vh} Z`);
}

// Main
document.addEventListener('DOMContentLoaded', () => {
  const svgElement = document.getElementById('fluid');
  const path = initSvg(svgElement);

  const percent = 0.77;
  const duration = 3;
  const fluctuationDurationUnit = duration / 3;

  // Create GSAP timeline for chained animations
  const tweenObj = { percent: 0, fluctuation: -CONTROL_POINT_DEFAULT_FLUCTUATION };
  const tl = gsap.timeline({ repeat: 0 });

  // Single continuous pouring animation with slowing-down easing
  tl.to(tweenObj, {
    duration,
    ease: "power1.out", // slowing-down easing
    percent: percent,
    onUpdate: function() {
      updateSvgPath(path, tweenObj.percent, tweenObj.fluctuation);
    }
  })
  // Fluctuation tweens in parallel
  .to(tweenObj, {
    duration: fluctuationDurationUnit,
    ease: "power2.inOut",
    fluctuation: CONTROL_POINT_DEFAULT_FLUCTUATION / 2,
  }, "<") // start in parallel with the pouring (previous) tween
  .to(tweenObj, {
    duration: fluctuationDurationUnit,
    ease: "power2.inOut",
    fluctuation: -(CONTROL_POINT_DEFAULT_FLUCTUATION / 5),
  }, ">") // start after the first fluctuation (previous) tween
  .to(tweenObj, {
    duration: fluctuationDurationUnit,
    ease: "power2.inOut",
    fluctuation: 0,
  }, ">"); // start after the second fluctuation (previous) tween

});