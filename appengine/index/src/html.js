/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview HTML for index page.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Index.html');

goog.require('BlocklyGames');


/**
 * Web page structure.
 * @param {!Object} ij Injected options.
 * @returns {string} HTML.
 */
Index.html.start = function(ij) {
  return `
<div id="header">
  <img id="banner" src="index/title.svg" height=40 width=244 alt="Blockly Games">
  <div id="subtitle">${BlocklyGames.getMsg('Index.subTitle', true)}&nbsp;
    <a href="about${ij.html ? '.html' : ''}?lang=${ij.lang}">${BlocklyGames.getMsg('Index.moreInfo', true)}</a>
  </div>
</div>
<div id="games">
  <div class="levelRow lvl1">
    ${Index.html.appLink_(ij, 'dance', 'Games.dance')}
    ${Index.html.appLink_(ij, 'puzzle', 'Games.puzzle')}
    ${Index.html.appLink_(ij, 'maze', 'Games.maze')}
  </div>
  <div class="levelRow lvl2">
    ${Index.html.appLink_(ij, 'bird', 'Games.bird')}
    ${Index.html.appLink_(ij, 'turtle', 'Games.turtle')}
    ${Index.html.appLink_(ij, 'movie', 'Games.movie')}
  </div>
  <div class="levelRow lvl3">
    ${Index.html.appLink_(ij, 'music', 'Games.music')}
    ${Index.html.appLink_(ij, 'pond-tutor', 'Games.pondTutor')}
    ${Index.html.appLink_(ij, 'pond-duck', 'Games.pond')}
  </div>
</div>
<select id="languageMenu"></select>
<p id="clearDataPara" style="visibility: hidden">
  ${BlocklyGames.getMsg('Index.startOver', true)}
  <button class="secondary" id="clearData">${BlocklyGames.getMsg('Index.clearData', true)}</button>
</p>
<p id="diplomaPara">
  <button class="secondary" id="showDiploma">${BlocklyGames.getMsg('Index.diploma', true)}</button>
</p>
<div id="diploma">
  <div id="diplomaCard">
    <svg id="diplomaSeal" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="#FFD700" stroke="#F9A825" stroke-width="3"/>
      <circle cx="50" cy="50" r="36" fill="none" stroke="#FFF8E1" stroke-width="2"/>
      <polygon points="50,18 59,41 84,41 63,56 71,81 50,66 29,81 37,56 16,41 41,41"
          fill="#FFF8E1" stroke="#F57F17" stroke-width="1.5"/>
    </svg>
    <div id="diplomaTitle">${BlocklyGames.getMsg('Index.diplomaTitle', true)}</div>
    <div id="diplomaRule"></div>
    <div id="diplomaName"></div>
    <div id="diplomaCompleted"></div>
    <div id="diplomaDate"></div>
  </div>
</div>
`;
};

/**
 * Create a link to an app.
 * @param {!Object} ij Injected options.
 * @param {string} app Name of application.
 * @param {string} msgName Name of text content to place in link.
 * @returns {string} HTML.
 * @private
 */
Index.html.appLink_ = function(ij, app, msgName) {
  return `
<svg viewBox="0 0 300 150" version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink">
  <path d="M 111.11,98.89 A 55 55 0 1 1 188.89,98.89" class="gaugeBack" id="back-${app}" />
  <g class="icon" id="icon-${app}">
    <circle cx=150 cy=60 r=50 class="iconBack" />
    <image xlink:href="index/${app}.png" height=100 width=100 x=100 y=10 />
    <a xlink:href="${app}${ij.html ? '.html' : ''}?lang=${ij.lang}">
      <circle cx=150 cy=60 r=50 class="iconBorder" />
      <path class="gaugeFront" id="gauge-${app}" />
      <text x=150 y=135>${BlocklyGames.getMsg(msgName, true)}</text>
    </a>
  </g>
</svg>
`;
};
