const fs = require("fs");
//const path = require("path");
//const assert = require("assert").strict;

module.exports = {
    hasError: function(filePath) {
        data = fs.readFileSync(filePath, 'utf8');
        if(!data.startsWith("---") || data[3] == '-') {
            return "\n" + filePath.substring(1) + " needs to have exactly 3 dashes at the start";
        }
        else {
            return false;
        }
    }
}