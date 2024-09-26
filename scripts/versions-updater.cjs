const fs = require("fs");
const stringifyPackage = require("stringify-package");
const detectIndent = require("detect-indent");
const detectNewline = require("detect-newline");

module.exports.readVersion = function (contents) {
    return Object.keys(JSON.parse(contents))[0];
};

module.exports.writeVersion = function (contents, version) {
    let json = JSON.parse(contents);
    let indent = detectIndent(contents).indent;
    let newline = detectNewline(contents);

    const manifest = JSON.parse(fs.readFileSync("./manifest.json"));
    const { minAppVersion } = manifest;

    // Trick to make it appear on top of JSON object
    let tmp = {};
    tmp[version] = minAppVersion;
    json = Object.assign(tmp, json);

    return stringifyPackage(json, indent, newline);
};
