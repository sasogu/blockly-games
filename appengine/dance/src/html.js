/**
 * @license
 * Copyright 2024 Samuel Soriano
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

goog.provide('Dance.html');

goog.require('BlocklyGames');
goog.require('BlocklyGames.html');
goog.require('BlocklyInterface');


Dance.html.start = function(ij) {
  return `
${BlocklyGames.html.headerBar(ij, BlocklyGames.getMsg('Games.dance', true),
    BlocklyInterface.nextLevelParam, true, false, '')}

<div id="visualization">
  <svg xmlns="http://www.w3.org/2000/svg" version="1.1"
      id="svgDance" viewBox="0 0 400 400" width="400px" height="400px">
  </svg>
</div>

<div id="danceHint"${ij.hint ? '' : ' style="display: none"'}>${BlocklyGames.esc(ij.hint)}</div>

<div id="buttonRow">
  <button id="runButton" class="primary"
      title="${BlocklyGames.getMsg('Dance.runTooltip', true)}">
    <img src="common/1x1.gif" class="run icon21" alt="">
    ${BlocklyGames.getMsg('Games.runProgram', true)}
  </button>
  <button id="resetButton" class="primary" style="display: none"
      title="${BlocklyGames.getMsg('Dance.resetTooltip', true)}">
    <img src="common/1x1.gif" class="stop icon21" alt="">
    ${BlocklyGames.getMsg('Games.resetProgram', true)}
  </button>
</div>

${(ij.level === ij.maxLevel && !ij.bonus) ? `
<div id="danceBonusRow">
  <a id="danceBonusLink" href="?lang=${ij.lang}&level=${ij.maxLevel}&bonus=1">
    ${BlocklyGames.getMsg('Dance.bonusLink', true)}
  </a>
</div>` : ''}

${Dance.html.toolbox_(ij.level, ij.bonus)}
<div id="blockly"></div>

${BlocklyGames.html.dialog()}
${BlocklyGames.html.doneDialog()}
${BlocklyGames.html.abortDialog()}
${BlocklyGames.html.storageDialog()}
`;
};


Dance.html.toolbox_ = function(level, bonus) {
  let xml = '<block type="dance_adelante"></block>\n';
  if (level >= 4) {
    xml += '<block type="dance_gira_izquierda"></block>\n';
    xml += '<block type="dance_gira_derecha"></block>\n';
  }
  if (level >= 8) {
    xml += `<block type="controls_repeat_ext">
      <value name="TIMES">
        <shadow type="math_number">
          <field name="NUM">4</field>
        </shadow>
      </value>
    </block>\n`;
  }
  if (bonus) {
    xml += '<block type="dance_salta"></block>\n';
  }
  return `<xml id="toolbox" xmlns="https://developers.google.com/blockly/xml">${xml}</xml>`;
};
