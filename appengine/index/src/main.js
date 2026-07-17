/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for index page.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Index');

goog.require('BlocklyGames');
goog.require('Index.html');

/**
 * Array of application names.
 */
const APPS = ['dance', 'puzzle', 'maze', 'bird', 'turtle', 'movie', 'music',
              'pond-tutor', 'pond-duck'];

/**
 * Message names for app labels, indexed as per APPS.
 */
const APP_MSGS = ['Games.dance', 'Games.puzzle', 'Games.maze', 'Games.bird',
                  'Games.turtle', 'Games.movie', 'Games.music',
                  'Games.pondTutor', 'Games.pond'];

/**
 * Number of levels completed per app, indexed as per APPS.
 * Populated by init() and read by showDiploma().
 */
let levelsDone_ = [];

/**
 * Add a gold badge to a completed game icon.
 * @param {string} app Name of application.
 */
function addBadge(app) {
  const icon = BlocklyGames.getElementById('icon-' + app);
  if (!icon) return;
  const ns = 'http://www.w3.org/2000/svg';
  const g = document.createElementNS(ns, 'g');
  g.setAttribute('class', 'badge');
  const circle = document.createElementNS(ns, 'circle');
  circle.setAttribute('cx', '192');
  circle.setAttribute('cy', '16');
  circle.setAttribute('r', '16');
  circle.setAttribute('fill', '#FFD700');
  circle.setAttribute('stroke', '#F9A825');
  circle.setAttribute('stroke-width', '2');
  const star = document.createElementNS(ns, 'polygon');
  star.setAttribute('points',
      '192,5 195,13 204,13 197,19 200,28 192,22 184,28 187,19 180,13 189,13');
  star.setAttribute('fill', '#FFF8E1');
  star.setAttribute('stroke', '#F57F17');
  star.setAttribute('stroke-width', '1');
  g.appendChild(circle);
  g.appendChild(star);
  icon.appendChild(g);
}


/**
 * Render the page and load any progress data.  Called on page load.
 */
function init() {
  // Render the HTML.
  document.body.innerHTML = Index.html.start(
    {lang: BlocklyGames.LANG,
     html: BlocklyGames.IS_HTML,
     rtl: BlocklyGames.IS_RTL});

  BlocklyGames.init('');

  const languageMenu = BlocklyGames.getElementById('languageMenu');
  languageMenu.addEventListener('change', BlocklyGames.changeLanguage, true);

  BlocklyGames.bindClick('showDiploma', showDiploma);
  BlocklyGames.getElementById('diploma').addEventListener('click', function(e) {
    if (e.target.id === 'diploma') {
      hideDiploma_();
    }
  });

  let storedData = false;
  const levelsDone = levelsDone_;
  for (let i = 0; i < APPS.length; i++) {
    levelsDone[i] = 0;
    for (let j = 1; j <= BlocklyGames.MAX_LEVEL; j++) {
      if (BlocklyGames.loadFromLocalStorage(APPS[i], j)) {
        storedData = true;
        levelsDone[i]++;
      }
    }
  }
  if (storedData) {
    const clearButtonPara = BlocklyGames.getElementById('clearDataPara');
    clearButtonPara.style.visibility = 'visible';
    BlocklyGames.bindClick('clearData', clearData);
  }

  for (let i = 0; i < levelsDone.length; i++) {
    const app = APPS[i];
    const denominator = (app === 'puzzle') ? 1 : BlocklyGames.MAX_LEVEL;
    const angle = levelsDone[i] / denominator * 270;
    if (angle) {
      setTimeout(animateGauge, 1500, app, 0, angle);
    } else {
      // Remove gauge if zero, since IE renders a stub.
      const path = BlocklyGames.getElementById('gauge-' + app);
      path.parentNode.removeChild(path);
    }
    if (levelsDone[i] >= denominator) {
      setTimeout(addBadge, 2000, app);
    }
  }
}

/**
 * Animate a gauge from zero to a target value.
 * @param {string} app Name of application.
 * @param {number} cur Current angle of gauge in degrees.
 * @param {number} max Final angle of gauge in degrees.
 */
function animateGauge(app, cur, max) {
  const step = 4;
  cur += step;
  drawGauge(app, Math.min(cur, max));
  if (cur < max) {
    setTimeout(animateGauge, 10, app, cur, max);
  }
}

/**
 * Draw the gauge for an app.
 * @param {string} app Name of application.
 * @param {number} angle Angle of gauge in degrees.
 */
function drawGauge(app, angle) {
  const xOffset = 150;
  const yOffset = 60;
  const radius = 52.75;
  const theta0 = toRadians(angle - 45);
  const x = xOffset - Math.cos(theta0) * radius;
  const y = yOffset - Math.sin(theta0) * radius;
  const flag = angle > 180 ? 1 : 0;
  // The starting point is at angle zero.
  const theta1 = toRadians(0 - 45);
  const mx = xOffset - Math.cos(theta1) * radius;
  const my = yOffset - Math.sin(theta1) * radius;
  const path = BlocklyGames.getElementById('gauge-' + app);
  path.setAttribute('d',
      ['M', mx, my, 'A', radius, radius, 0, flag, 1, x, y].join(' '));
}

/**
 * Converts degrees to radians.
 * Copied from Closure's goog.math.toRadians.
 * @param {number} angleDegrees Angle in degrees.
 * @return {number} Angle in radians.
 */
function toRadians(angleDegrees) {
  return angleDegrees * Math.PI / 180;
}

/**
 * Clear all stored data.
 */
function clearData() {
  if (!confirm(BlocklyGames.getMsg('Index.clear', false))) {
    return;
  }
  for (let i = 0; i < APPS.length; i++) {
    for (let j = 1; j <= BlocklyGames.MAX_LEVEL; j++) {
      delete window.localStorage[APPS[i] + j];
    }
  }
  location.reload();
}

/**
 * Count how many apps have been fully completed.
 * @returns {number} Count of completed apps.
 */
function countCompletedApps_() {
  let count = 0;
  for (let i = 0; i < APPS.length; i++) {
    const denominator = (APPS[i] === 'puzzle') ? 1 : BlocklyGames.MAX_LEVEL;
    if (levelsDone_[i] >= denominator) {
      count++;
    }
  }
  return count;
}

/**
 * Render the game badge strip on the diploma.
 */
function renderDiplomaBadges_() {
  const badgeBox = BlocklyGames.getElementById('diplomaBadges');
  badgeBox.textContent = '';
  for (let i = 0; i < APPS.length; i++) {
    const app = APPS[i];
    const denominator = (app === 'puzzle') ? 1 : BlocklyGames.MAX_LEVEL;
    const complete = levelsDone_[i] >= denominator;
    const badge = document.createElement('div');
    badge.className = complete ? 'diplomaBadge complete' : 'diplomaBadge';
    const img = document.createElement('img');
    img.src = 'index/' + app + '.png';
    img.alt = '';
    const label = document.createElement('span');
    label.textContent = BlocklyGames.getMsg(APP_MSGS[i], false);
    badge.appendChild(img);
    badge.appendChild(label);
    badgeBox.appendChild(badge);
  }
}

/**
 * Fill in and display the diploma overlay, then open the print dialog.
 */
function showDiploma() {
  let name = window.localStorage['diplomaName'];
  if (!name) {
    name = prompt(BlocklyGames.getMsg('Index.diplomaPromptName', false)) || '';
    if (name) {
      window.localStorage['diplomaName'] = name;
    }
  }
  BlocklyGames.getElementById('diplomaName').textContent = name;
  BlocklyGames.getElementById('diplomaCompleted').textContent =
      BlocklyGames.getMsg('Index.diplomaCompleted', false)
          .replace('%1', countCompletedApps_())
          .replace('%2', APPS.length);
  BlocklyGames.getElementById('diplomaDate').textContent =
      BlocklyGames.getMsg('Index.diplomaDate', false) + ': ' +
      new Date().toLocaleDateString(BlocklyGames.LANG);
  renderDiplomaBadges_();

  const diploma = BlocklyGames.getElementById('diploma');
  diploma.classList.add('shown');
  window.print();
}

/**
 * Hide the diploma overlay.
 */
function hideDiploma_() {
  BlocklyGames.getElementById('diploma').classList.remove('shown');
}

window.addEventListener('afterprint', hideDiploma_);

BlocklyGames.callWhenLoaded(init);
