const fs = require("fs");
const path = require("path");

//checks that each markdown page starts with "---"
function checkTripleDash(path = ".") {
    files = fs.readdirSync(path, {"withFileTypes": true});
    files.forEach(function (file, index) {
        if(file.name.startsWith(".") || file.name == "node_modules")
            return;
        fullPath = path + "/" + file.name;
        if(file.isDirectory()) {
            checkTripleDash(fullPath);
        }
        else if(file.isFile()) {
            if(file.name.endsWith(".md") && !file.name.startsWith("README")) {
                data = fs.readFileSync(fullPath, 'utf-8');
                if(data.startsWith("---") && data[3] != '-') {
                    console.log(fullPath + " is ok!");
                }
                else {
                    console.error(fullPath + " does not have 3 dashes at the start!");
                }
            }
        }
    });
}

checkTripleDash();