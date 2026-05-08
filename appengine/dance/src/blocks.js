/**
 * @license
 * Copyright 2024 Samuel Soriano
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

goog.provide('Dance.Blocks');

goog.require('Blockly');
goog.require('Blockly.JavaScript');
goog.require('BlocklyGames');


Dance.Blocks.init = function() {
  const MOVE_HUE = 160;
  const TURN_HUE = 200;
  const JUMP_HUE = 40;

  Blockly.defineBlocksWithJsonArray([
    {
      'type': 'dance_adelante',
      'message0': BlocklyGames.getMsg('Dance.adelante', false),
      'previousStatement': null,
      'nextStatement': null,
      'colour': MOVE_HUE,
      'tooltip': BlocklyGames.getMsg('Dance.adelanteTooltip', false),
    },
    {
      'type': 'dance_gira_izquierda',
      'message0': BlocklyGames.getMsg('Dance.giraIzquierda', false),
      'previousStatement': null,
      'nextStatement': null,
      'colour': TURN_HUE,
      'tooltip': BlocklyGames.getMsg('Dance.giraIzquierdaTooltip', false),
    },
    {
      'type': 'dance_gira_derecha',
      'message0': BlocklyGames.getMsg('Dance.giraDerecha', false),
      'previousStatement': null,
      'nextStatement': null,
      'colour': TURN_HUE,
      'tooltip': BlocklyGames.getMsg('Dance.giraDerechaTooltip', false),
    },
    {
      'type': 'dance_salta',
      'message0': BlocklyGames.getMsg('Dance.salta', false),
      'previousStatement': null,
      'nextStatement': null,
      'colour': JUMP_HUE,
      'tooltip': BlocklyGames.getMsg('Dance.saltaTooltip', false),
    },
  ]);
};

Blockly.JavaScript['dance_adelante'] = function(block) {
  return `dance_forward('block_id_${block.id}');\n`;
};

Blockly.JavaScript['dance_gira_izquierda'] = function(block) {
  return `dance_turnLeft('block_id_${block.id}');\n`;
};

Blockly.JavaScript['dance_gira_derecha'] = function(block) {
  return `dance_turnRight('block_id_${block.id}');\n`;
};

Blockly.JavaScript['dance_salta'] = function(block) {
  return `dance_jump('block_id_${block.id}');\n`;
};
