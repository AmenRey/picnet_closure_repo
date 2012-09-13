﻿;
goog.provide('pn.ui.grid.pipe.TotalsHandler');

goog.require('goog.events.EventHandler');
goog.require('pn.ui.grid.pipe.GridHandler');



/**
 * @constructor
 * @extends {pn.ui.grid.pipe.GridHandler}
 * @param {Element} parent The parent Grid element container.
 */
pn.ui.grid.pipe.TotalsHandler = function(parent) {
  goog.asserts.assert(parent);

  pn.ui.grid.pipe.GridHandler.call(this);

  /**
   * @private
   * @type {goog.debug.Logger}
   */
  this.log_ = pn.log.getLogger('pn.ui.grid.pipe.TotalsHandler');

  /**
   * @private
   * @type {Element}
   */
  this.parent_ = parent;

  /**
   * @private
   * @type {Array.<!pn.ui.grid.ColumnCtx>}
   */
  this.totalColumns_ = null;
  /**
   * @private
   * @type {Element}
   */
  this.totalsLegend_ = null;
};
goog.inherits(pn.ui.grid.pipe.TotalsHandler, pn.ui.grid.pipe.GridHandler);


/** @override */
pn.ui.grid.pipe.TotalsHandler.prototype.preRender = function() {
  this.totalColumns_ = goog.array.filter(this.cctxs,
      function(cctx) { return !!cctx.spec.total; });
  if (!this.totalColumns_.length) { return; }

  this.totalsLegend_ = goog.dom.createDom('div', 'totals-legend');
  goog.dom.appendChild(this.parent_, this.totalsLegend_);
};


/** @override */
pn.ui.grid.pipe.TotalsHandler.prototype.postRender = function() {
  this.updateTotals_();
};


/** @override */
pn.ui.grid.pipe.TotalsHandler.prototype.onCustomEvent = function(eventType) {
  if (eventType === 'row-count-changed') { this.updateTotals_(); }
};


/** @private */
pn.ui.grid.pipe.TotalsHandler.prototype.updateTotals_ = function() {
  if (!this.totalColumns_ || !this.totalColumns_.length) return;

  var items = this.view.getItems();
  var total = goog.array.reduce(items, function(acc, item) {
    goog.array.forEach(this.totalColumns_, function(cctx1) {
      if (acc[cctx1.id] === undefined) acc[cctx1.id] = 0;
      var itemVal = item[cctx1.id];
      if (itemVal) acc[cctx1.id] += itemVal;
    }, this);
    return acc;
  }, {}, this);
  var html = [];
  for (var field in total) {
    var cctx = goog.array.find(this.totalColumns_,
        function(cctx1) { return cctx1.id === field; });
    var val;
    var entity = new cctx.entitySpec.type(total);
    var renderer = cctx.getColumnRenderer();
    if (renderer) { val = renderer(cctx, entity); }
    else { val = parseInt(total[field], 10); }
    html.push('Total ' + cctx.spec.name + ': ' + val || '0');
  }
  this.totalsLegend_.innerHTML = '<ul><li>' +
      html.join('</li><li>') + '</li>';
};

