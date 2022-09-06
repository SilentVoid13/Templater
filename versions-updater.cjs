const stringifyPackage = require("stringify-package");
const detectIndent = require("detect-indent");
const detectNewline = require("detect-newline");
//import * as stringifyPackage from "stringify-package"
//import * as detectIndent from "detect-indent"
//import * as detectNewline from "detect-newline"

module.exports.readVersion = function (contents) {
    return Object.keys(JSON.parse(contents))[0];
};

module.exports.writeVersion = function (contents, version) {
    let json = JSON.parse(contents);
    let indent = detectIndent(contents).indent;
    let newline = detectNewline(contents);

    let obs_version = json[Object.keys(json)[0]];

    // Trick to make it appear on top of JSON object
    let tmp = {};
    tmp[version] = obs_version;
    json = Object.assign(tmp, json);

    return stringifyPackage(json, indent, newline);
};
