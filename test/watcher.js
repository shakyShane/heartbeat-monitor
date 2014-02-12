"use strict";

var clients = require("../lib/index");
var assert = require("chai").assert;
var sinon = require("sinon");
var _ = require("lodash");

var mockClients = [
    {
        id: "123"
    },
    {
        id: "321"
    },
    {
        id: "888"
    }
];

describe("Tracking a registry:", function () {

    describe("adding clients", function () {

        var registry;
        var localClients;

        beforeEach(function () {
            localClients = _.cloneDeep(mockClients);
            registry = [];
        });

        it("should add a client to an empty registry", function () {
            clients.addItem(registry, localClients[0]);
            assert.deepEqual(registry.length, 1);
        });
        it("should add a second client to a registry", function () {
            clients.addItem(registry, localClients[0]);
            clients.addItem(registry, localClients[1]);
            assert.deepEqual(registry.length, 2);
        });
        it("should not add duplicates", function () {
            clients.addItem(registry, localClients[0]);
            clients.addItem(registry, localClients[0]);
            clients.addItem(registry, localClients[0]);
            clients.addItem(registry, localClients[1]);
            assert.deepEqual(registry.length, 2);
        });
    });


    describe("removing clients", function () {
        var localClients, registry;
        beforeEach(function () {
            registry = [];
            localClients = _.cloneDeep(mockClients);
            clients.addItem(registry, localClients[0]);
            clients.addItem(registry, localClients[1]);
            clients.addItem(registry, localClients[2]);
        });
        it("should have the items", function () {
            clients.removeItem(registry, "123");
            assert.equal(registry.length, 2);
            assert.equal(registry[0].id, "321");
            assert.equal(registry[1].id, "888");
        });
    });



    describe("watching a registry", function () {
        var localClient1, registry, localClient2, clock;
        beforeEach(function () {
            clock = sinon.useFakeTimers();
            localClient1 = _.cloneDeep(mockClients[0]);
            localClient2 = _.cloneDeep(mockClients[1]);
            registry = [localClient1, localClient2];
        });
        after(function () {
            clock.restore();
        });
        it("should accept a registry that contains items that have no timestamp", function () {
            clock.tick(100);
            clients.watchRegistry(registry, 1000);
            var actual = registry[0].timestamp;
            var expected = 100;
            assert.equal(actual, expected);
            var actual = registry[1].timestamp;
            var expected = 100;
            assert.equal(actual, expected);
        });
    });



    describe("Adding a timestamp to connected clients", function () {
        var registry, clock;
        beforeEach(function () {
            registry = [];
        });
        before(function () {
            clock = sinon.useFakeTimers();
        });
        after(function () {
            clock.restore();
        });
        it("should add a timestamp when the client is added to the registry", function () {
            clock.tick(20);
            clients.addItem(registry, mockClients[0]);
            var actual   = registry[0].timestamp;
            var expected = 20;
            assert.equal(actual, expected);
        });
        it("should update the timestamp if the same client ID added", function () {
            clock.tick(20); //depends on previous test
            clients.addItem(registry, mockClients[0]);
            clock.tick(20); //depends on previous test
            clients.addItem(registry, mockClients[0]);
            var actual   = registry[0].timestamp;
            var expected = 60;
            assert.equal(actual, expected);
        });
    });





    describe("checking timestamps against the min timeout", function () {
        var registry, clock;
        beforeEach(function () {
            registry = [];
        });
        before(function () {
            clock = sinon.useFakeTimers();
        });
        after(function () {
            clock.restore();
        });
        it("Should remove the client if no heart beat sent within the timeout", function () {
            clock.tick(200);
            clients.addItem(registry, mockClients[0]);
            clients.watchRegistry(registry, 2000);
            clock.tick(2000);
            assert.equal(registry.length, 1); // still exists
            clock.tick(4000);
            assert.equal(registry.length, 0); // deleted
            clock.tick(6000);
        });
        it("Should maintain the client if the timestamp is updated", function () {
            clock.tick(200);
            clients.addItem(registry, mockClients[0]);
            clients.watchRegistry(registry, 2000);
            clock.tick(2000);
            assert.equal(registry.length, 1); // still exists
            clients.addItem(registry, mockClients[0]);
            clock.tick(2000);
            assert.equal(registry.length, 1); // still exists
            clock.tick(6000);
        });
    });
});
