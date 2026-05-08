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

<table width=400>
  <tr>
    <td style="width: 190px; text-align: center; vertical-align: top;"></td>
    <td>
      <button id="runButton" class="primary"
          title="${BlocklyGames.getMsg('Dance.runTooltip', true)}">
        <img src="common/1x1.gif" class="run icon21">
        ${BlocklyGames.getMsg('Games.runProgram', true)}
      </button>
      <button id="resetButton" class="primary" style="display: none"
          title="${BlocklyGames.getMsg('Dance.resetTooltip', true)}">
        <img src="common/1x1.gif" class="stop icon21">
        ${BlocklyGames.getMsg('Games.resetProgram', true)}
      </button>
    </td>
  </tr>
</table>

${Dance.html.toolbox_(ij.level)}
<div id="blockly"></div>

${BlocklyGames.html.dialog()}
${BlocklyGames.html.doneDialog()}
${BlocklyGames.html.abortDialog()}
${BlocklyGames.html.storageDialog()}
`;
};


Dance.html.toolbox_ = function(level) {
  let xml = '<block type="dance_adelante"></block>\n';
  if (level >= 4) {
    xml += '<block type="dance_gira_izquierda"></block>\n';
    xml += '<block type="dance_gira_derecha"></block>\n';
  }
  if (level >= 8) {
    xml += '<block type="dance_salta"></block>\n';
  }
  return `<xml id="toolbox" xmlns="https://developers.google.com/blockly/xml">${xml}</xml>`;
};
