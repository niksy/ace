define(function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var Mirror = require("../worker/mirror").Mirror;
var jsyaml = require("./yaml/js-yaml");

var YamlWorker = exports.YamlWorker = function(sender) {
    Mirror.call(this, sender);
    this.setTimeout(500);
    this.setOptions();
};

// Mirror is a simple class which keeps main and webWorker versions of the document in sync
oop.inherits(YamlWorker, Mirror);

(function() {
    this.onUpdate = function() {
        var value = this.doc.getValue();
        var errors = [];

        try {
            jsyaml.load(value);
        } catch ( err ) {
            if ( err.message ) {
                var parsedErr = /(.+) at line (\d+), column (\d+)\:/.exec(err.message);
                if ( parsedErr && parsedErr.length === 4 ) {
                    // convert to ace gutter annotation
                    errors.push({
                        row: Number(parsedErr[2])-1, // must be 0 based
                        column: Number(parsedErr[3]),  // must be 0 based
                        text: parsedErr[1],  // text to show in tooltip
                        type: "error"
                    });
                }
            }
        }

        this.sender.emit("lint", errors);
    };
}).call(YamlWorker.prototype);

});
