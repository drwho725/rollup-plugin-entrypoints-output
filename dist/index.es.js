/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var jsonfile = require('jsonfile');
var path = require('path');
var defaultOptions = {
    outFile: ''
};
var FileType;
(function (FileType) {
    FileType["css"] = "css";
    FileType["js"] = "js";
    FileType["map"] = "map";
    FileType["other"] = "other";
})(FileType || (FileType = {}));
var entrypoints = new Map;
var outFile = '';
var json;
var createBuildStart = function (moduleOptions) { return function (options) {
    if (!outFile.length) {
        outFile = path.resolve(process.cwd(), moduleOptions.outFile);
    }
    entrypoints.set(options.input, {
        name: getEntrypointName(options.input),
        files: {
            js: {},
            css: []
        }
    });
}; };
var getEntrypointName = function (filepath) {
    var matches = filepath.match(/([a-z0-9-]+)\.ts/i);
    return matches[1].length ? matches[1] : filepath;
};
var createWriteBundle = function (moduleOptions) { return function (options, bundle) {
    var bundleName = '';
    if (typeof json === 'undefined') {
        json = {};
    }
    for (var filepath in bundle) {
        var type = getFileType(filepath);
        if (bundle[filepath].isEntry) {
            bundleName = bundle[filepath].name;
        }
        if (type !== FileType.map) {
            if (typeof json[bundleName] === 'undefined') {
                json[bundleName] = {};
            }
            if (type === FileType.js) {
                if (typeof json[bundleName][type] === 'undefined') {
                    json[bundleName][type] = {};
                }
                if (typeof json[bundleName][type][options.format] === 'undefined') {
                    json[bundleName][type][options.format] = new Set;
                }
                json[bundleName][type][options.format].add(options.dir + "/" + filepath);
            }
            else {
                if (typeof json[bundleName][type] === 'undefined') {
                    json[bundleName][type] = new Set;
                }
                json[bundleName][type].add(options.dir + "/" + filepath);
            }
        }
    }
    jsonfile.writeFileSync(moduleOptions.outFile, json, {
        spaces: 2,
        replacer: jsonReplacer
    });
}; };
var jsonReplacer = function (key, value) {
    if (typeof value === 'object' && value instanceof Set) {
        return Array.from(value);
    }
    return value;
};
var isFileType = function (type) {
    return type in FileType;
};
var getFileType = function (filepath) {
    var ext = path.parse(filepath)['ext'].slice(1);
    if (isFileType(ext)) {
        return FileType[ext];
    }
    else {
        return FileType.other;
    }
};
var index = (function (options) {
    if (options === void 0) { options = {}; }
    var moduleOptions = __assign(__assign({}, defaultOptions), options);
    return {
        name: 'entrypoints-output',
        buildStart: createBuildStart(moduleOptions),
        writeBundle: createWriteBundle(moduleOptions)
    };
});

export default index;
