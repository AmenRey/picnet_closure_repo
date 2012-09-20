
goog.provide('pn.app.AppConfig');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('pn.data.BaseDalCache');



/**
 * Note: The defaultFieldRenderers and the defaultColumnRenderers map a field
 *    schema type property to a renderer.  Since the schema type comes from the
 *    server we need to specify them using strings.
 *
 * @constructor
 * @extends {goog.Disposable}
 * @param {Object=} opt_opts The configuration options for the
 *    application. These options will be extended on top of the default
 *    pn.app.AppConfig options.
 */
pn.app.AppConfig = function(opt_opts) {
  goog.Disposable.call(this);

  var fr = pn.ui.edit.FieldRenderers,
      rr = pn.ui.edit.ReadOnlyFields,
      cr = pn.ui.grid.ColumnRenderers;

  /**
   * This application root path.  All requests should be relative to this.
   * @type {string}
   */
  this.appPath = '/';

  /**
   * This application default facade controller path.  All Facade requests will
   *    go this this controller.
   * @type {string}
   */
  this.facadeControllerPath = '';

  /**
   * If true all client data is kept upto date live with the server. That is,
   *    when any data change is done on the server that change is reflected
   *    live on the client.
   * @type {boolean}
   */
  this.serverSync = true;

  /**
   * This is the type of the DAL type system away DalCache and is just a ctor
   *    that returns a subclass of BaseDalCache which is generated from the
   *    PicNet2.Data generators.
   * @type {null|function(new:pn.data.BaseDalCache,
   *    !Object.<Array.<pn.data.Entity>>)}
   */
  this.dalCacheType = null;

  /** @type {boolean} */
  this.useAsyncEventBus = false;

  /** @type {number} */
  this.memCacheExpireMins = 15;

  /** @type {string} */
  this.viewContainerId = 'view-container';

  /** @type {string} */
  this.messagePanelId = 'message';

  /** @type {string} */
  this.loadPnlId = 'loading-panel';

  /** @type {!Object} */
  this.defaultFieldRenderers = {

    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    'boolean': fr.boolRenderer,

    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    'goog.date.DateTime': fr.dateRenderer,

    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    'string': fr.textFieldRenderer,

    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    'number': fr.intRenderer,

    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    'parent': fr.entityParentListField,

    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    'LongString': fr.textAreaRenderer,

    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    'Enumeration': fr.enumRenderer,

    /** @type {number} */
    textAreaLengthThreshold: 500
  };

  /** @type {!Object} */
  this.defaultReadOnlyFieldRenderers = {
    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    'boolean': rr.boolField,

    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    'goog.date.DateTime': rr.dateField,

    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    'number': rr.intField,

    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    'parent': rr.entityParentListField,

    /** @type {pn.ui.edit.FieldSpec.Renderer} */
    'Enumeration': rr.enumField
  };

  /** @type {!Object} */
  this.defaultColumnRenderers = {

    /** @type {pn.ui.grid.ColumnSpec.Renderer} */
    'boolean': cr.yesNoBoolRenderer,

    /** @type {pn.ui.grid.ColumnSpec.Renderer} */
    'goog.date.DateTime': cr.dateRenderer,

    /** @type {pn.ui.grid.ColumnSpec.Renderer} */
    'parent': cr.parentColumnRenderer,

    /** @type {pn.ui.grid.ColumnSpec.Renderer} */
    'Enumeration': cr.enumRenderer
  };

  if (opt_opts) goog.object.extend(this, opt_opts);
};
goog.inherits(pn.app.AppConfig, goog.Disposable);
