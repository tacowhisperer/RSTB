/**
 * Instantiates a boolean tree handler to simplify toggle-able options. Allows for independent checks (such as
 * toggling the sidebar on and off), or co-dependent checks (such as disabling disappearing when the screen is
 * wide enough for the sidebar).
 *
 * Arguments:
 *     boolStructure - plain object with pre-written boolean names mapped to a plain object containing two member
 *                     variables "parents" and "children", each which are arrays of the strings of the parent
 *                     anc child booleans (adjacency list)
 */
function BoolTree (boolStructure) {
    var booleans = boolStructure || {
    /*  booleanName0: {
            parents: ['parentBoolean0', 'parentBoolean1', ...],
            children: ['child0', 'child1', ...],

            // ADDED IN DURING CONSTRUCTION AND FOR INTERNAL USE ONLY
            trued: false // differentiates between a boolean's value (increases children countdown tickers) vs being trueAble 
                            because of parent dependency (checks countdown ticker)
        }, ... */
    };

    // Add the internal representation variables to the booleans plain object
    for (var bl in booleans) {
        var bool = booleans[bl];

        bool.parents = toMapping (set (bool.parents));
        bool.children = set (bool.children);
        bool.trued = false;
    }

    // Adds a boolean to the booleans plain object, or overwrites them if they exist -> chainable
    this.addBoolean = function (name, parents, children) {
        // Adds an isolated boolean (not dependent on other booleans and no booleans depend on it)
        if (arguments.length == 1) booleans[name] = {parents: {}, children: [], trued: false};

        // Both parents and children must be Arrays to add to the booleans object
        else if (typeof name == 'string' || typeof name == 'number' && parents instanceof Array && children instanceof Array) {
            booleans[name] = {};

            var newBoolean = booleans[name];
            newBoolean.parents = toMapping (set (parents));
            newBoolean.children = set (children);
            newBoolean.trued = false;

            // recursively add non-existent parents, or add properties to existing parent booleans if properties don't exist
            for (var parent in newBoolean.parents) {
                var pBoolean = booleans[parent];

                if (!pBoolean) this.addBoolean (parent, [], [name]);
                else if (pBoolean.children.indexOf (name) === -1) pBoolean.children.push (name);
            }

            // recursively add non-existing children, or add properties to existing children booleans
            for (var i = 0; i < newBoolean.children.length; i++) {
                var cBoolean = booleans[newBoolean.children[i]];

                if (!cBoolean) this.addBoolean (newBoolean.children[i], [name], []);
                else if (!cBoolean.parents[name]) {
                    cBoolean.parents[name] = false;
                    cBoolean.trued = false;
                }
            }
        }

        return this;
    };

    // Removes a boolean from the booleans plain object if it exists, does nothing otherwise -> chainable
    this.removeBoolean = function () {
        for (var a = 0; a < arguments.length; a++) {
            var name = arguments[a];
            if (booleans[name]) {
                // Remove the element from the parents' children arrays
                var booleanParents = booleans[name].parents;
                for (var parent in booleanParents) {
                    var parentChildren = booleans[parent].children;
                    parentChildren.splice (parentChildren.indexOf (name), 1);
                }

                // Remove the boolean from its children's dependencies
                var booleanChildren = booleans[name].children;
                for (var i = 0; i < booleanChildren.length; i++) {
                    var childrenParents = booleans[booleanChildren[i]].parents;
                    delete childrenParents[name];
                }

                delete booleans[name];
            }
        }

        return this;
    };

    // Attempts to true the input booleans, but does nothing if not all parent booleans have been trued -> chainable
    this.trueify = function () {
        for (var a = 0; a < arguments.length; a++) {
            // Only true a boolean if all parents have been trued
            var name = arguments[a], bl = booleans[name];
            if (bl) {
                var allTrued = true;
                for (var parent in bl.parents) {
                    if (!booleans[parent].trued) {
                        allTrued = false;
                        break;
                    }
                }

                if (allTrued) {
                    bl.trued = true;
                    for (var i = 0; i < bl.children.length; i++) booleans[bl.children[i]].parents[name] = true;
                }
            }
        }

        return this;
    };

    // Falsifies a boolean; does nothing if the boolean does not exist -> chainable
    this.falsify = function () {
        for (var a = 0; a < arguments.length; a++) {
            // Falsifies the boolean and update all children mappings
            var name = arguments[a], bl = booleans[name];
            if (bl) {
                bl.trued = false;
                for (var i = 0; i < bl.children.length; i++) {
                    booleans[bl.children[i]].parents[name] = false;
                    booleans[bl.children[i]].trued = false;
                }
            }
        }

        return this;
    }

    // Checks the status of a boolean -> boolean
    this.isTrue = function (name) {return booleans[name]? booleans[name].trued : null;};

    // Adds a parent boolean to the specified boolean. Does nothing if the name/parent boolean does not exist. -> chainable
    this.addParentTo = function (name, parent) {
        if (booleans[name] && booleans[parent] && typeof booleans[name].parents[parent] != 'boolean') {
            booleans[name].parents[parent] = booleans[parent].trued;
            booleans[name].trued = false;
            booleans[parent].children.push (name);
        }

        return this;
    };

    // Removes a parent boolean to the specified boolean. Does nothing if the name/parent boolean does not exist. -> chainable
    this.removeParentFrom = function (name, parent) {
        if (booleans[name] && booleans[parent] && typeof booleans[name].parents[parent] == 'boolean') {
            delete booleans[name].parents[parent];
            booleans[name].trued = false;
            booleans[parent].children.splice (booleans[parent].children.indexOf (name), 1);
        }

        return this;
    };

    // Maps each element in the set array to false
    function toMapping (setArray) {
        var map = {};
        for (var i = 0; i < setArray.length; i++) map[setArray[i]] = false;
        return map;
    }

    // Returns the keys of the mapping as an array
    function toArray (mapping) {
        var arr = [];
        for (var prop in mapping) arr.push (prop);
        return arr;
    }

    // Reduces an array to a set like in Python. Code taken from https://gist.github.com/brettz9/6137753
    function set (array) {return array.reduce (function (a, v) {if (a.indexOf (v) === -1) {a.push (v);} return a;}, []);}

    // Returns a human-readable adjacency list of the booleans stored in the boolean handler
    this.toString = function () {
        var s = '', f = true;
        for (var bl in booleans) {
            var e = booleans[bl], ln = '"' + bl + '" -> f: ' + e.trued + '; p: ' + toArray (e.parents) + '; c: ' + e.children;
            s += !f? '\n    ' + ln : (function () {f = false; return '    ' + ln;})();
        }

        return '{\n' + s + '\n}';
    };
}