/**
 * Copyright (c) 2020 Colin Leung (Komino)
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */


class ControllerMixin {
  /**
   *
   * @param {Controller} client
   */
  constructor(client){
    this.client = client;
  }
  async before(){}
  async after(){}

  /**
   *
   * @param {String} action
   * @returns {Promise<void>}
   */
  async execute(action){
    if(this[action] !== undefined)await this[action]();
  }
}
module.exports = ControllerMixin;