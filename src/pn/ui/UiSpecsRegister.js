﻿;
goog.provide('pn.ui.UiSpecsRegister');

goog.require('goog.asserts');
goog.require('goog.object');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {!Object.<!function(new:pn.ui.UiSpec)>} specs The UiSpecs object map
 *    containing all the IDs and UI specifications that will be used in this
 *    application.
 */
pn.ui.UiSpecsRegister = function(specs) {
  goog.asserts.assert(specs);

  goog.Disposable.call(this);

  /**
   * @private
   * @type {!Object.<!function(new:pn.ui.UiSpec)>}
   */
  this.map_ = specs;
  goog.object.forEach(this.map_, this.registerDisposable, this);
};
goog.inherits(pn.ui.UiSpecsRegister, goog.Disposable);


/**
 * @param {string} id The id of 'UiSpec' required.
 * @return {!pn.ui.UiSpec} The SpecBase specified by the 'id' arg.
 */
pn.ui.UiSpecsRegister.prototype.get = function(id) {
  goog.asserts.assert(this.map_[id],
      'ID "' + id + ' was not found in the UiSpec register.');

  var instance = new this.map_[id]();

  goog.asserts.assert(instance.id === id, 'Spec ID: ' + instance.id +
      ' was registered with a different ID ' + id + ' this is not allowed.');
  return instance;
};


/**
 * @return {!Object.<!function(new:pn.ui.UiSpec)>} All the registered specs.
 */
pn.ui.UiSpecsRegister.prototype.all = function() {
  return this.map_;
};
