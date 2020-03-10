/*
 * This file is part of K8MVC (https://github.com/digi3colin/k8).
 * Copyright (c) 2019-2020 Colin Leung.
 *
 *  K8MVC is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  K8MVC is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with K8MVC.  If not, see <https://www.gnu.org/licenses/>.
 */

class Controller{
  /**
   *
   * @param {Request} request
   * @param {Reply} response
   */
  constructor(request){
    this.headerSent = false;
    this.mixins = [];

    this.request = request;

    this.body = '';
    this.headers = {};
    this.cookies = [];// []{name, value, options}
    this.status = 200;
  }

  /**
   *
   * @param {ControllerMixin} mixin
   * @returns {ControllerMixin}
   */
  addMixin(mixin){
    this.mixins.push(mixin);
    return mixin;
  }

  getAction() {
    if(!this.request.params)return 'index';
    return `action_${this.request.params.action || 'index'}`
  }

  async before(){
    for(let i = 0; i < this.mixins.length; i++){
      await this.mixins[i].before();
    }
  }

  async after(){
    for(let i = 0; i < this.mixins.length; i++){
      await this.mixins[i].after();
    }
  }

  async execute(actionName = null){
    try{
      //guard check function action_* exist
      const action = actionName || this.getAction();

      if(this[action] === undefined){
        this.notFound(`${ this.constructor.name }::${action} not found`);
        return;
      }

      if(!this.headerSent){
        await this.before();
      }

      if(!this.headerSent){
        for(let i = 0; i < this.mixins.length; i++){
          await this.mixins[i].execute(action);
        }
      }
      if(!this.headerSent)await this[action]();
      if(!this.headerSent)await this.after();

    }catch(err){
      this.serverError(err);
    }

    return {
      status: this.status,
      body: this.body,
      headers : this.headers,
      cookies : this.cookies,
    }
  }

  /**
   *
   * @param {Error} err
   */
  serverError(err){
    this.body = `<pre>500 / ${ err.message }\n\n ${ err.stack }</pre>`;
    this.exit(500);
  }

  /**
   *
   * @param {string} msg
   */
  notFound(msg){
    this.body = `404 / ${ msg }`;
    this.exit(404);
  }

  /**
   *
   * @param {string} location
   */
  redirect(location){
    this.headers.location = location;
    this.exit(302);
  }

  /**
   *
   * @param {Number} code
   */
  exit(code){
    this.headerSent = true;
    this.status = code;
  }

  async action_index(){
  }
}

module.exports = Controller;