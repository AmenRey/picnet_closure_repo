﻿;
goog.require('pn.ui.BaseFieldSpec');
goog.require('pn.ui.edit.ComplexRenderer');
goog.require('pn.ui.edit.ReadOnlyFields');
goog.require('pn.ui.edit.ValidateInfo');
goog.provide('pn.ui.edit.FieldSpec');
goog.provide('pn.ui.edit.FieldSpec.Renderer');



/**
 * The Field specification defines how a field should be captioned and how
 *    the input element (if any) should be rendered and handled.
 *
 * BaseField types (Field / Column) should be constructed using the
 *    convenience methods in UiSpec (UiSpec.prototype.createField).
 *
 * @constructor
 * @extends {pn.ui.BaseFieldSpec}
 * @param {string} id The id of this column.
 * @param {!Object} props The properties to add this field.  After adding
 *    we will also apply default values to any attribute that was not
 *    explicitally set.
 * @param {!pn.ui.UiSpec} entitySpec The specifications (pn.ui.UiSpec) of
 *    the entity being displayed.
 */
pn.ui.edit.FieldSpec = function(id, props, entitySpec) {
  pn.ass(id);
  pn.ass(props);
  pn.ass(entitySpec);

  pn.ui.BaseFieldSpec.call(this, id, entitySpec);

  /**
   * The renderer to use to render this field value.  This can either be of
   *    type pn.ui.edit.ComplexRenderer or simply a function that takes 3
   *    parameters and returns either a dom Element/Text a goog.ui.Component.
   *    The 3 parameters are the the value to display, the entity being
   *    displayed and the parent Dom Element.
   *
   * @type {undefined|pn.ui.edit.FieldSpec.Renderer}
   */
  this.renderer = undefined;

  /**
   * The custom validator for this field.  The validator can either be an
   *    instance of pn.ui.edit.ValidateInfo or a function that takes 2
   *    parameters, the Field specs (this class) and the current value and
   *    returns a string which represents the validation error (falsy
   *    represents no error).
   *
   * @type {pn.ui.edit.FieldSpec.Validator}
   */
  this.validator = null;

  /**
   * If the pn.data.EntityUtils.isNew(entity) then any showOnAdd=false
   *    fields will not be shown.
   *
   * @type {boolean}
   */
  this.showOnAdd = true;

  /**
   * Wether this field is readonly.  If specifying a renderer this value is
   *    ignored.
   *
   * @type {boolean}
   */
  this.readonly = false;

  /**
   * Wether this field is displayed when readonly. This fieldSpec is readonly.
   *
   * @type {boolean}
   */
  this.showOnReadOnly = true;

  /**
   * The default value to apply to the specified field.  This is only used
   *    when creating a new entity.
   *
   * @type {*}
   */
  this.defaultValue = undefined;

  /**
   * When displaying a table in this Field this field denotes the type of
   *    entity being displayed in the table.  If this is not specified we try
   *    to intelligently guess this by using the id of thie field.  If the
   *    ID ends with 'Entities' then we use the prefix of this id.  For example:
   *    if the id is: ChildrenEntities then the tableType will become
   *    'Children'.
   *
   * @type {string|undefined}
   */
  this.tableType = undefined;

  /**
   * When displaying a table in this field this points to the UiSpec id that
   *    will be used when rendering this table. If this is not specified then
   *    it will be the same as the tableType.
   *
   * @type {string|undefined}
   */
  this.tableSpec = undefined;

  /**
   * When displaying a table we only display the children entities that are
   *    related to the current entity being displayed in the parent page.  This
   *    field is the field that marks this relationship.  For instance:
   *
   * tabeType: 'Children',
   * tableParentField: 'ParentID'
   *
   * This setup will display a table of Children entities where their 'ParentID'
   *    property is equal to the 'ID' property of the current page entity. Note:
   *    this property is intelligently inferred if not specified from the type
   *    name of the entity being displayed (parent to this field).
   *
   * @type {string}
   */
  this.tableParentField = '';

  /**
   * Any additional properties required by the validator or renderer.  This
   *    can be an object with any property values and is intended to be used
   *    with custom renderers/validators to enhance existing funcitonality.
   *    NOTE: It is better to set and access these properties using
   *    doctionary['access'] so this can work with server generated properties.
   *
   * @type {!Object}
   */
  this.additionalProperties = {};

  this.extend(props);
};
goog.inherits(pn.ui.edit.FieldSpec, pn.ui.BaseFieldSpec);


/** @override */
pn.ui.edit.FieldSpec.prototype.extend = function(props) {
  pn.ui.edit.FieldSpec.superClass_.extend.call(this, props);
  if (this.renderer instanceof pn.ui.edit.ComplexRenderer) {
    this.registerDisposable(
        /** @type {pn.ui.edit.ComplexRenderer} */ (this.renderer));
  }

  var firstStep = this.id.split('.')[0];
  if (goog.string.endsWith(firstStep, 'Entities')) {
    if (!goog.isDef(this.tableType) && !this.renderer) {
      this.tableType = pn.data.EntityUtils.getTypeProperty(
          this.entitySpec.type, firstStep);
    }
    if (!goog.isDef(this.tableSpec) && !this.renderer) {
      this.tableSpec = this.tableType;
    }
  }

  if (this.tableType && !this.tableParentField) {
    this.tableParentField = this.entitySpec + 'ID';
  }
  if (this.renderer instanceof pn.ui.edit.ComplexRenderer && this.validator) {
    throw new Error('Complex renderers cannot have validators, ' +
        'please review field definition "' + this.id + '"');
  }

  if (!this.renderer) {
    this.renderer = this.getDefaultRenderer();
    pn.ass(this.renderer);
  }
};


/**
 * @param {boolean=} opt_readonly Wether to force the genration of a readonly
 *    renderer.
 * @return {pn.ui.edit.FieldSpec.Renderer} The inferred renderer for this field.
 */
pn.ui.edit.FieldSpec.prototype.getDefaultRenderer = function(opt_readonly) {
  var schema = this.id.indexOf('.') >= 0 ? null :
      pn.data.TypeRegister.getFieldSchema(this.entitySpec.type, this.id);
  var schemaType = schema ? schema.type : '';
  if (schemaType === 'string' && schema.length >
      pn.web.ctx.cfg.defaultFieldRenderers.textAreaLengthThreshold) {
    schemaType = 'LongString';
  }
  var readonly = opt_readonly || this.readonly;
  if (pn.data.EntityUtils.isParentProperty(this.dataProperty) &&
      !this.tableType) {
    return readonly ?
        pn.ui.edit.ReadOnlyFields.entityParentListField :
        pn.ui.edit.FieldRenderers.entityParentListField;
  } else if (this.tableType) {
    return readonly ?
        pn.ui.edit.ReadOnlyFields.itemList :
        pn.ui.edit.FieldRenderers.childEntitiesTableRenderer;
  } else if (readonly) {
    if (!schema) throw Error('could not find schema for field: ' + this.id);
    return pn.web.ctx.cfg.defaultReadOnlyFieldRenderers[schemaType] ||
        pn.ui.edit.ReadOnlyFields.textField;
  } else {
    if (!schema) throw Error('could not find schema for field: ' + this.id);
    return pn.web.ctx.cfg.defaultFieldRenderers[schemaType] ||
        pn.ui.edit.FieldRenderers.textFieldRenderer;
  }
};


/**
 * @typedef {!pn.ui.edit.ComplexRenderer|
 *     function(!pn.ui.edit.FieldCtx,!Element,!pn.data.Entity):
 *       !(Element|Text|goog.ui.Component)}
 */
pn.ui.edit.FieldSpec.Renderer;


/**
 * @typedef
 *    {null|pn.ui.edit.ValidateInfo|function(pn.ui.edit.FieldCtx,
 *        !(Element|Text|goog.ui.Component)):string}
 */
pn.ui.edit.FieldSpec.Validator;
