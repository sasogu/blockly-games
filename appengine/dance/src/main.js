/**
 * @license
 * Copyright 2024 Samuel Soriano
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

goog.provide('Dance');

goog.require('Blockly');
goog.require('Blockly.JavaScript');
goog.require('Blockly.Trashcan');
goog.require('Blockly.VerticalFlyout');
goog.require('Blockly.Xml');
goog.require('BlocklyCode');
goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('Dance.Blocks');
goog.require('Dance.html');


BlocklyGames.storageName = 'dance';

// Grid constants
const COLS = 5;
const ROWS = 5;
const SQ = 70;   // square size in pixels
const OX = 15;   // SVG x offset
const OY = 15;   // SVG y offset

const MAX_BLOCKS =
    [2, 3, 4, 4, 4, 6, 6, 2, 6, 6][BlocklyGames.LEVEL - 1];

const ResultType = {
  UNSET: 0,
  SUCCESS: 1,
  FAILURE: 2,
  TIMEOUT: 3,
  ERROR: 4,
};

// Direction deltas: N=0, E=1, S=2, W=3
const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

// Level definitions: start {x, y, dir} and goal {x, y}
// dir: 0=North, 1=East, 2=South, 3=West
// Solutions:
// L1: forward
// L2: forward x2
// L3: forward x3
// L4: turnRight, forward x2
// L5: forward, turnRight, forward
// L6: forward x2, turnRight, forward x2
// L7: forward x2, turnLeft, forward x2
// L8: jump (moves 2 squares)
// L9: turnRight, jump x2, turnLeft, jump x2
// L10: forward x2, turnRight, jump x2
const LEVELS = [
  {start: {x: 2, y: 4, dir: 0}, goal: {x: 2, y: 3}},
  {start: {x: 2, y: 4, dir: 0}, goal: {x: 2, y: 2}},
  {start: {x: 2, y: 4, dir: 0}, goal: {x: 2, y: 1}},
  {start: {x: 0, y: 4, dir: 0}, goal: {x: 2, y: 4}},
  {start: {x: 2, y: 4, dir: 0}, goal: {x: 3, y: 3}},
  {start: {x: 0, y: 4, dir: 0}, goal: {x: 2, y: 2}},
  {start: {x: 2, y: 4, dir: 0}, goal: {x: 0, y: 2}},
  {start: {x: 2, y: 4, dir: 0}, goal: {x: 2, y: 2}},
  {start: {x: 0, y: 4, dir: 0}, goal: {x: 4, y: 0}},
  {start: {x: 0, y: 4, dir: 0}, goal: {x: 4, y: 2}},
];

const levelData = LEVELS[BlocklyGames.LEVEL - 1];

// SVG elements
let robotEl;
let goalEl;

// Animation state
let pidList = [];
let log = [];
let result = ResultType.UNSET;

// Runtime state (during code execution)
let robotX, robotY, robotDir;
const goalX = levelData.goal.x;
const goalY = levelData.goal.y;

let stepSpeed = 450;


/**
 * Convert grid column/row to SVG pixel centre.
 */
function gridToSvg(col, row) {
  return {
    px: OX + col * SQ + SQ / 2,
    py: OY + row * SQ + SQ / 2,
  };
}


/**
 * Draw the 5×5 dance floor as coloured tiles.
 */
function drawFloor() {
  const svg = BlocklyGames.getElementById('svgDance');
  const colors = ['#FFCDD2', '#CE93D8'];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const rect =
          document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', OX + c * SQ);
      rect.setAttribute('y', OY + r * SQ);
      rect.setAttribute('width', SQ);
      rect.setAttribute('height', SQ);
      rect.setAttribute('fill', colors[(c + r) % 2]);
      rect.setAttribute('stroke', '#fff');
      rect.setAttribute('stroke-width', '2');
      svg.appendChild(rect);
    }
  }
}


/**
 * Draw the goal star.
 */
function drawGoal() {
  const svg = BlocklyGames.getElementById('svgDance');
  const pos = gridToSvg(goalX, goalY);
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const angle = (i * 36 - 90) * Math.PI / 180;
    const r = (i % 2 === 0) ? 24 : 10;
    pts.push(
        (pos.px + r * Math.cos(angle)).toFixed(1) + ',' +
        (pos.py + r * Math.sin(angle)).toFixed(1));
  }
  const star =
      document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  star.setAttribute('points', pts.join(' '));
  star.setAttribute('fill', '#FFD700');
  star.setAttribute('stroke', '#F9A825');
  star.setAttribute('stroke-width', '2');
  star.id = 'goal';
  svg.appendChild(star);
  goalEl = star;
}


/**
 * Build and append the robot SVG group.
 */
function drawRobot() {
  const svg = BlocklyGames.getElementById('svgDance');
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.id = 'robot';

  function add(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const key of Object.keys(attrs)) {
      el.setAttribute(key, String(attrs[key]));
    }
    g.appendChild(el);
  }

  // Body
  add('rect', {x: -18, y: -5, width: 36, height: 30, rx: 6, fill: '#FF5252'});
  // Head
  add('rect', {x: -14, y: -30, width: 28, height: 26, rx: 6, fill: '#FF8A80'});
  // Eye whites
  add('circle', {cx: -6, cy: -19, r: 6, fill: '#fff'});
  add('circle', {cx: 6, cy: -19, r: 6, fill: '#fff'});
  // Eye pupils
  add('circle', {cx: -6, cy: -19, r: 3, fill: '#1A237E'});
  add('circle', {cx: 6, cy: -19, r: 3, fill: '#1A237E'});
  // Antenna
  add('line', {x1: 0, y1: -30, x2: 0, y2: -44,
      stroke: '#555', 'stroke-width': 3});
  add('circle', {cx: 0, cy: -47, r: 5, fill: '#4CAF50'});
  // Arms
  add('rect', {x: -30, y: 2, width: 13, height: 8, rx: 4, fill: '#E53935'});
  add('rect', {x: 17, y: 2, width: 13, height: 8, rx: 4, fill: '#E53935'});
  // Legs
  add('rect', {x: -13, y: 25, width: 11, height: 13, rx: 3, fill: '#D32F2F'});
  add('rect', {x: 2, y: 25, width: 11, height: 13, rx: 3, fill: '#D32F2F'});

  svg.appendChild(g);
  robotEl = g;
}


/**
 * Move the robot SVG element to (col, row) facing dir.
 * @param {number} col
 * @param {number} row
 * @param {number} dir 0=N,1=E,2=S,3=W
 */
function placeRobot(col, row, dir) {
  const pos = gridToSvg(col, row);
  robotEl.setAttribute('transform',
      `translate(${pos.px},${pos.py}) rotate(${dir * 90})`);
}


/**
 * Reset only the SVG visuals to the start position (does not touch the log).
 */
function resetVisual() {
  placeRobot(levelData.start.x, levelData.start.y, levelData.start.dir);
  goalEl.removeAttribute('display');
  BlocklyInterface.workspace.highlightBlock(null);
}

/**
 * Full reset: cancel animations, clear log, reset state and visuals.
 */
function resetGame() {
  pidList.forEach(clearTimeout);
  pidList.length = 0;
  const confetti = document.querySelectorAll('.danceConfetti');
  for (let i = 0; i < confetti.length; i++) {
    confetti[i].parentNode.removeChild(confetti[i]);
  }
  log.length = 0;
  result = ResultType.UNSET;

  robotX = levelData.start.x;
  robotY = levelData.start.y;
  robotDir = levelData.start.dir;
  resetVisual();
}


function runButtonClick(e) {
  if (BlocklyInterface.eventSpam(e)) return;
  BlocklyDialogs.hideDialog(false);
  BlocklyGames.getElementById('runButton').style.display = 'none';
  BlocklyGames.getElementById('resetButton').style.display = 'inline';
  resetGame();
  execute();
}


function resetButtonClick(e) {
  if (BlocklyInterface.eventSpam(e)) return;
  BlocklyGames.getElementById('runButton').style.display = 'inline';
  BlocklyGames.getElementById('resetButton').style.display = 'none';
  resetGame();
}


/**
 * Record one robot action during interpretation.
 * @param {string} action
 * @param {string} id Block ID.
 */
function doStep(action, id) {
  if (result !== ResultType.UNSET) return;

  if (action === 'forward' || action === 'jump') {
    const dist = (action === 'jump') ? 2 : 1;
    const nx = robotX + DX[robotDir] * dist;
    const ny = robotY + DY[robotDir] * dist;
    if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) {
      result = ResultType.FAILURE;
      log.push({action: 'fail', x: robotX, y: robotY, dir: robotDir, id: id});
      return;
    }
    robotX = nx;
    robotY = ny;
  } else if (action === 'turnLeft') {
    robotDir = (robotDir + 3) % 4;
  } else if (action === 'turnRight') {
    robotDir = (robotDir + 1) % 4;
  }

  log.push({action: action, x: robotX, y: robotY, dir: robotDir, id: id});

  if (robotX === goalX && robotY === goalY) {
    result = ResultType.SUCCESS;
    log.push({action: 'finish', x: robotX, y: robotY, dir: robotDir,
        id: null});
  }
}


/**
 * Inject Dance API into the JS interpreter.
 * @param {!Interpreter} interp
 * @param {!Interpreter.Object} globalObject
 */
function initInterpreter(interp, globalObject) {
  function wrap(name, fn) {
    interp.setProperty(globalObject, name,
        interp.createNativeFunction(fn, false));
  }
  wrap('dance_forward', function(id) {
    doStep('forward', id ? String(id) : '');
  });
  wrap('dance_turnLeft', function(id) {
    doStep('turnLeft', id ? String(id) : '');
  });
  wrap('dance_turnRight', function(id) {
    doStep('turnRight', id ? String(id) : '');
  });
  wrap('dance_jump', function(id) {
    doStep('jump', id ? String(id) : '');
  });
}


/**
 * Execute the user's code.
 */
function execute() {
  if (!('Interpreter' in window)) {
    setTimeout(execute, 99);
    return;
  }

  Blockly.selected && Blockly.selected.unselect();
  const code = BlocklyCode.getJsCode();
  BlocklyCode.executedJsCode = code;
  BlocklyInterface.executedCode = BlocklyInterface.getCode();
  result = ResultType.UNSET;

  const interp = new Interpreter(code, initInterpreter);
  try {
    let ticks = 10000;
    while (interp.step()) {
      if (--ticks === 0) throw Infinity;
    }
    if (result === ResultType.UNSET) {
      result = ResultType.FAILURE;
    }
  } catch (e) {
    if (e === Infinity) {
      result = ResultType.TIMEOUT;
    } else {
      result = ResultType.ERROR;
      alert(e);
    }
  }

  if (result === ResultType.FAILURE || result === ResultType.TIMEOUT) {
    log.push({action: 'fail', x: robotX, y: robotY, dir: robotDir, id: null});
  }

  stepSpeed = (result === ResultType.SUCCESS) ? 380 : 480;
  resetVisual();
  pidList.push(setTimeout(animate, 100));
}


/**
 * Replay the execution log one step at a time.
 */
function animate() {
  const entry = log.shift();
  if (!entry) return;

  BlocklyCode.highlight(entry.id);

  if (entry.action === 'finish') {
    placeRobot(entry.x, entry.y, entry.dir);
    goalEl.setAttribute('display', 'none');
    showConfetti();
    pidList.push(setTimeout(function() {
      BlocklyCode.highlight(null);
      BlocklyInterface.saveToLocalStorage();
      BlocklyCode.congratulations();
    }, stepSpeed));

  } else if (entry.action === 'fail') {
    placeRobot(entry.x, entry.y, entry.dir);
    pidList.push(setTimeout(function() {
      BlocklyCode.highlight(null);
      placeRobot(levelData.start.x, levelData.start.y, levelData.start.dir);
      goalEl.removeAttribute('display');
      BlocklyGames.getElementById('runButton').style.display = 'inline';
      BlocklyGames.getElementById('resetButton').style.display = 'none';
    }, stepSpeed * 2));

  } else {
    placeRobot(entry.x, entry.y, entry.dir);
    pidList.push(setTimeout(animate, stepSpeed));
  }
}


/**
 * Launch confetti across the page after a level is completed.
 */
function showConfetti() {
  const colors =
      ['#FF5252', '#FFD700', '#4CAF50', '#2196F3', '#FF9800', '#E91E63'];
  const container = document.createElement('div');
  container.className = 'danceConfetti';
  document.body.appendChild(container);
  for (let i = 0; i < 90; i++) {
    const piece = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 9 + 6;
    const left = Math.random() * 100;
    const delay = Math.random() * 0.6;
    const duration = Math.random() * 1.5 + 1.8;
    const angle = Math.random() * 360;
    const spin = angle + 540 + Math.random() * 360;
    piece.style.cssText =
        `left:${left}%;width:${size}px;height:${size}px;` +
        `background:${color};` +
        `border-radius:${Math.random() > 0.5 ? '50%' : '2px'};` +
        `--angle:${angle}deg;--spin:${spin}deg;` +
        `animation:confettiFall ${duration}s ${delay}s ease-in forwards;` +
        `transform:translateY(-20px) rotate(${angle}deg);`;
    container.appendChild(piece);
  }
  setTimeout(function() {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }, 3500);
}


function init() {
  Dance.Blocks.init();

  const ij = {
    lang: BlocklyGames.LANG,
    level: BlocklyGames.LEVEL,
    maxLevel: BlocklyGames.MAX_LEVEL,
    html: BlocklyGames.IS_HTML,
    rtl: BlocklyGames.IS_RTL,
  };
  document.body.innerHTML = Dance.html.start(ij);

  BlocklyInterface.init(BlocklyGames.getMsg('Games.dance', false));

  const rtl = BlocklyGames.IS_RTL;
  const blocklyDiv = BlocklyGames.getElementById('blockly');
  const visualization = BlocklyGames.getElementById('visualization');
  const onresize = function(_e) {
    const top = visualization.offsetTop;
    const vizRight = visualization.offsetLeft + visualization.offsetWidth;
    blocklyDiv.style.top = Math.max(10, top - window.pageYOffset) + 'px';
    blocklyDiv.style.left = rtl ? '10px' : (vizRight + 10) + 'px';
    blocklyDiv.style.width = (window.innerWidth - vizRight - 20) + 'px';
  };
  window.addEventListener('scroll', function() {
    onresize(null);
    Blockly.svgResize(BlocklyInterface.workspace);
  });
  window.addEventListener('resize', onresize);
  onresize(null);

  const scale = 1 + (1 - (BlocklyGames.LEVEL / BlocklyGames.MAX_LEVEL)) / 3;
  BlocklyInterface.injectBlockly({
    'maxBlocks': MAX_BLOCKS,
    'rtl': rtl,
    'trashcan': true,
    'zoom': {'startScale': scale},
  });

  BlocklyGames.bindClick('runButton', runButtonClick);
  BlocklyGames.bindClick('resetButton', resetButtonClick);

  drawFloor();
  drawGoal();
  drawRobot();
  resetGame();

  const defaultXml =
      '<xml>' +
        '<block movable="' + (BlocklyGames.LEVEL !== 1) + '" ' +
        'type="dance_adelante" x="70" y="70"></block>' +
      '</xml>';
  BlocklyInterface.loadBlocks(defaultXml, false);

  BlocklyCode.importInterpreter();
  BlocklyCode.importPrettify();
}

BlocklyGames.callWhenLoaded(init);
