"use strict";

var _ = require("lodash");
var events = require("events");
var emitter = new events.EventEmitter();

var timer;

/**
 * Add an item to the registry
 * @param {Array} registry
 * @param {Object} item
 * @private
 */
var _addItem = function (registry, item) {

    var matchIndex;

    _.each(registry, function (currentItem, i) {
        if (item.id === currentItem.id) {
            matchIndex = i;
        }
    });

    if (typeof matchIndex === "undefined") {
        _addItemToRegistry(registry, item);
    } else {
        _updateItem(registry[matchIndex]);
    }
};

/**
 * @param {Object} item
 * @private
 */
var _updateItem = function (item) {
    emitter.emit("item:updated", item);
    item.timestamp = new Date().getTime();
};

/**
 * @param {Array} registry
 * @param {Object} item
 * @private
 */
var _addItemToRegistry = function (registry, item) {
    item.timestamp = new Date().getTime();
    registry.push(item);
    emitter.emit("item:add", item);
};

/**
 * @param {Array} registry
 * @param {String|Number} id
 * @private
 */
var _removeItem = function (registry, id) {
    var index;
    _.find(registry, function (item, i) {
        if (item.id === id) {
            index = i;
            return true;
        }
    });
    if (typeof index !== "undefined") {
        emitter.emit("item:removed", id);
        registry.splice(index, 1);
    }
};

/**
 * @param {Array} registry
 * @param {Number} timeout
 * @returns {Function}
 * @private
 */
var _getTimeoutChecker = function (registry, timeout) {

    return function () {

        var outdated = [];
        var current = new Date().getTime();

        emitter.emit("item:check:start", registry.length);

        _.each(registry, function (item) {
            if (current - item.timestamp > timeout) {
                outdated.push(item.id);
            }
        });

        if (outdated.length) {
            _.each(outdated, function (id) {
                _removeItem(registry, id);
            });
        }

        emitter.emit("item:check:end", registry.length);
    }
};

/**
 * @param {Array} registry
 * @param {Number} timeout
 * @private
 */
var _watchRegistry = function (registry, timeout) {

    // Add timestamps to any items that don't have 1
    _.each(registry, function(item) {
        if (typeof item.timestamp === "undefined") {
            _addItem(registry, item);
        }
    });

    timer = setInterval(_getTimeoutChecker(registry, timeout), timeout);
};

/**
 * @param {Array} registry
 * @param {Number} timeout
 * @private
 */
var _stopWatchingRegistry = function () {
    clearInterval(timer);
};

/**
 * @param {Array} registry
 * @param {Object} item
 */
module.exports.addItem = function (registry, item) {
    _addItem(registry, item);
};

/**
 * @param {Array} registry
 * @param {String|Number} id
 */
module.exports.removeItem = function (registry, id) {
    _removeItem(registry, id);
};

/**
 * @param {Array} registry
 * @param {Number} timeout
 */
module.exports.watchRegistry = function (registry, timeout) {
    _watchRegistry(registry, timeout);
    return emitter;
};

/**
 *
 */
module.exports.stopWatchingRegistry = function () {
    _stopWatchingRegistry();
};