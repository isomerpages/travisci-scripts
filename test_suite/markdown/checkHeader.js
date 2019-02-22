module.exports = {
    //the home page (index.md) is a type 1 page
    //type 2 pages are those under a left_nav
    //type 3 pages are resource room pages
    //type 4 pages are those by themselves (e.g. privacy.md and includes misc/search.md)
    runTest: function(data, type, filePath, permalinks) {
        var errorMessageHold = "";
        
        var returnObj = {
            permalinks: [],
            hasError: false,
            errorMessage: ""
        }
        
        const errorHeader = "\n`" + filePath.substring(1) + "` ";

        //first we run this regex to split data line by line
        lines = data.split(/(?:\r\n|\r|\n)/g);

        //then we make sure that there are 3 dashes at the start
        if(!lines[0].startsWith("---") || lines[0].length != 3) {
            returnObj.errorMessage += errorHeader + "needs to have exactly 3 dashes (`---`) at the start. Make sure this is there, and that the headers like layout and title are on a new line.";
            returnObj.hasError = true;
        }
        // Numbering:     0         1          2            3          4             5            6           7              8           9               10                11             12          13
        var headers = ["layout", "title", "permalink", "breadcrumb", "date", "collection_name", "tag", "thumbnail_image", "image", "description", "second_nav_title", "last_updated", "category", "file_url"];
        
        //this flag which headers are present and which aren't
        var headerPresent = [];
        for(i=0;i<headers.length;i++)
            headerPresent.push(false);

        //we declare lineNumber outside the loop because we will be using its
        //value after the loop: at that point i will be at the line with
        //the second set of triple dashes
        var lineNumber;
        
        //now for each line we make sure the header is valid
        for(lineNumber = 1;lineNumber < lines.length && !lines[lineNumber].startsWith("---");lineNumber++) {
            var lineMatchesHeader = false;
            for(i=0;i<headers.length;i++) {
                if(lines[lineNumber].startsWith(headers[i] + ": ")) {
                    lineMatchesHeader = true;
                    if(headerPresent[i]) {
                        //if the header was duplicated:
                        returnObj.errorMessage += errorHeader + "has another `" + headers[i] + ": ` field at *Line " + (lineNumber+1) + "*.";
                        returnObj.hasError = true;

                        //from here on we give specific additional info here when possible for the users' benefit
                        if(i == 0 || i == 1 || i == 2)
                            returnObj.errorMessage += " Only 1 " + headers[i] + " field is needed for each page. You should remove all the excess " + headers[i] + " field(s) from this file.";

                        if(i == 3) {
                            if(type == 3 || type == 1) {
                                returnObj.errorMessage += " This page does not need a breadcrumb field at all. You should remove this line from this file.";
                            }
                            else {
                                returnObj.errorMessage += " Only 1 breadcrumb field is needed for this page. You should remove all the excess breadcrumb field(s) from this file";
                            }
                        }

                        if(i == 4) {
                            if(type == 3) {
                                returnObj.errorMessage += " Only 1 date field is needed for this page. You should remove all the excess date field(s) from this file."
                            }
                            else {
                                returnObj.errorMessage += " This page does not need a date field at all. You should remove this line from this file.";
                            }
                        }

                        if(i == 5) {
                            if(type == 2) {
                                returnObj.errorMessage += " Only 1 collection_name field is needed for this page. You should remove all the excess collection_name field(s) from this file.";
                            }
                            else {
                                returnObj.errorMessage += " This page does not need a collection_name field at all. You should remove this line from this file.";
                            }
                        }
                    }
                    else {
                        //it is not a duplicated header
                        headerPresent[i] = true;

                        //from here on we check if there are any issues with the header specifically: e.g. bad value/header that shouldn't be there is there etc
                        
                        //permalink check: is it empty? is it duplicated? character URL safe?
                        if(i == 2) {
                            //check if the permalink characters are URL safe and check for duplicated permalinks
                            permalink = lines[lineNumber].substring(11); //11 is the string length of "permalink: "
                    
                            if(permalink.length == 0) {
                                //uh oh no permalink
                                returnObj.errorMessage += errorHeader + "has a `permalink: ` field at *Line " + (lineNumber+1) + "* but has no permalink. Please enter one as a permalink is needed for the page to be properly accessed. An example is `/news/press-releases/test/`";
                                returnObj.hasError = true;
                            }
                            else {
                                //check if the permalink is duplicated
                                //permalink = permalink.replace(/"/g, "");
                                for(j=0;j<permalinks.length;j++) {
                                    if(permalink == permalinks[j].link) {
                                        returnObj.errorMessage += errorHeader + "has the same permalink as `" + permalinks[j].filePath + "`. Please change the permalink in either one of the files so that both pages can be properly accessed";
                                        returnObj.hasError = true;
                                    }
                                }

                                //check for non-URL safe characters in the permalink
                                //list take from https://stackoverflow.com/a/695467
                                //the slash character (/) is excluded since it is used properly to specify the directory in the URL
                                var unsafeChars = ["&", "$", "+", ",", ":", ";", "=", "?", "@", "#", "<", ">", "[", "]", "{", "}", "|", "\\", "^", "%"];
                                for(j=0;j<unsafeChars.length;j++) {
                                    if(permalink.includes(unsafeChars[j])) {
                                        returnObj.errorMessage += errorHeader + "has the `" + unsafeChars[j] + "` character in its permalink field at *Line " + (lineNumber+1) + "*. This character is unsafe for use in URLs. Please remove this character, replace it with a dash (`-`), or replace it with english text (e.g. `-and-` instead of `&`)";
                                        returnObj.hasError = true;
                                    }
                                }
                                
                                returnObj.permalinks.push({
                                    link: permalink,
                                    filePath: filePath.substring(1)
                                });
                            }
                        }

                        if(i == 3 && (type == 1 || type == 3)) {
                            returnObj.errorMessage += errorHeader + "has a `breadcrumb :` field at *Line " + (lineNumber+1) + "*. This page does not need a breadcrumb field at all. You should remove this line from this file.";
                            returnObj.hasError = true;
                        }

                        if(i == 4 && type != 3) {
                            returnObj.errorMessage += errorHeader + "has a `date: ` field at *Line " + (lineNumber+1) + "*. This page does not need a date field at all. You should remove this line from this file.";
                            returnObj.hasError = true;
                        }

                        if(i == 5 && type != 2) {
                            returnObj.errorMessage += errorHeader + "has a `collection_name: ` field at *Line " + (lineNumber+1) + "*. This page does not need a collection_name field at all. You should remove this line from this file.";
                            returnObj.hasError = true;
                        }
                    }
                    break;
                }
            }
            //finally if this line in the header didn't match any of the above
            //empty lines are ok, we are only worried about unrecognised non-empty ones
            //the regex removes all spaces (as spaces are okay)
            if(!lineMatchesHeader && lines[lineNumber].replace(/\s/g, '').length > 0) {
                //we hold this message (i.e. unconfirmed) because it could be because the user
                //failed to put the triple dashes at the end of the header
                errorMessageHold += errorHeader + "has an unrecognised header at *Line " + (lineNumber+1) + "* (`" + lines[lineNumber] + "`). Check if it is a typo and whether you have left out other required headers. Remember that the text on your page can only start from the line after the second set of 3 dashes (`---`).";
            }
        }

        //now that we have reached the end we make sure it has 3 dashes
        //and we make sure the headers we need are here
        if(lineNumber < lines.length && lines[lineNumber].startsWith("---") && lines[lineNumber].length == 3) {
            //good end headers
            //meaning we can put in the unrecognised header error message(s) held back (if any)
            if(errorMessageHold.length > 0) {
                returnObj.errorMessage += errorMessageHold;
                returnObj.hasError = true;
            }
            //make sure all the headers are here
            //type 1, home page: needs layout, title, & permalink
            //type 2, left-nav page: needs layout, title, permalink, breadcrumb, and collection_name
            //type 3, resource room page: needs layout, title, date, and permalink
            //type 4, solo page: needs layout, title, permalink, and breadcrumb
            
            //everything needed goes into this string to hint to the user
            var headerHint = "";
            if(type == 1)
                headerHint = " This is a home page, which needs the layout, title, and permalink fields in the header to work properly.";
            if(type == 2)
                headerHint = " This page needs the layout, title, permalink, breadcrumb, and collection_name fields in the header to work properly.";
            if(type == 3)
                headerHint = " This page needs the layout, title, date, and permalink fields in the header to work properly."
            if(type == 4)
                headerHint = " This page needs the layout, title, permalink, and breadcrumb fields in the header to work properly."

            if(!headerPresent[0]) {
                returnObj.errorMessage += errorHeader + "is missing the `layout: ` field in the header." + headerHint;
                returnObj.hasError = true;
            }
            if(!headerPresent[1]) {
                returnObj.errorMessage += errorHeader + "is missing the `title: ` field in the header." + headerHint;
                returnObj.hasError = true;
            }
            if(!headerPresent[2]) {
                returnObj.errorMessage += errorHeader + "is missing the `permalink: ` field in the header." + headerHint;
                returnObj.hasError = true;
            }
            if(!headerPresent[3] && (type == 2 || type == 4)) {
                returnObj.errorMessage += errorHeader + "is missing the `breadcrumb: ` field in the header." + headerHint;
                returnObj.hasError = true;
            }
            if(!headerPresent[5] && type == 2) {
                returnObj.errorMessage += errorHeader + "is missing the `collection_name: ` field in the header." + headerHint;
                returnObj.hasError = true;
            }
            if(!headerPresent[4] && type == 3) {
                //check whether the date is in the file name
                //if it isn't, then we spit the date not found error
                if(!/\/\d\d\d\d-\d\d-\d\d-.*\.md/.test(filePath)) {
                    returnObj.errorMessage += errorHeader + "is missing the `date: ` field in the header." + headerHint;
                    returnObj.hasError = true;
                }
            }
        }
        else {
            //bad or non-existent end headers
            returnObj.errorMessage += errorHeader + "needs to have exactly 3 dashes (`---`) after all the headers (e.g. layout and title), on a new line.";
            returnObj.hasError = true;
        }

        //whew finally we are done checking headers
        //now we'll return the values for markdownHandler to handle
        return returnObj;
    }
}