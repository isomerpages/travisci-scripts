module.exports = {
    //the home page (index.md) is a type 1 page
    //type 2 pages are those under a left_nav
    //type 3 pages are resource room pages
    //type 4 pages are those by themselves (e.g. privacy.md and includes misc/search.md)
    hasError: function(data, type, filePath) {
        var errorMessage = "";
        var errorMessageHold = "";
        var hasErrors = false;
        
        const errorHeader = "\n" + filePath.substring(1) + " ";

        //first we run this regex to split data line by line
        lines = data.split(/(?:\r\n|\r|\n)/g);

        //then we make sure that there are 3 dashes at the start
        if(!lines[0].startsWith("---") || lines[0].length != 3) {
            errorMessage += errorHeader + "needs to have exactly 3 dashes (---) at the start. Make sure this is there, and that the headers like layout and title are on a new line.";
            hasErrors = true;
        }

        //now we check for the fields required in the header
        var layoutPresent = false;
        var titlePresent = false;
        var permalinkPresent = false;
        var breadcrumbPresent = false;
        var datePresent = false;
        var collectionNamePresent = false;

        //now for each line we make sure the header is valid
        var i;
        for(i = 1;i < lines.length && !lines[i].startsWith("---");i++) {
            //i know this is the same code duplicated lots of times
            //but i wrote it this way for future flexibility
            if(lines[i].startsWith("layout: ")) {
                if(layoutPresent) {
                    errorMessage += errorHeader + "has another \"layout: \" field at line " + (i+1) + ". Only 1 layout field is needed for each page. You should remove all the excess layout field(s) from this file.";
                    hasErrors = true;
                    continue;
                }
                else {
                    layoutPresent = true;
                    continue;
                }
            }
            else if(lines[i].startsWith("title: ")) {
                if(titlePresent) {
                    errorMessage += errorHeader + "has another \"title: \" field at line " + (i+1) + ". Only 1 title field is needed for each page. You should remove all the excess title field(s) from this file.";
                    hasErrors = true;
                    continue;
                }
                else {
                    titlePresent = true;
                    continue;
                }
            }
            else if(lines[i].startsWith("permalink: ")) {
                if(permalinkPresent) {
                    errorMessage += errorHeader + "has another \"permalink: \" field at line " + (i+1) + ". Only 1 permalink field is needed for each page. You should remove all the excess permalink field(s) from this file.";
                    hasErrors = true;
                    continue;
                }
                else {
                    //TODO: check for duplicated permalinks with other pages as well
                    permalinkPresent = true;
                    continue;
                }
            }
            else if(lines[i].startsWith("breadcrumb: ")) {
                if(breadcrumbPresent) {
                    errorMessage += errorHeader + "has another \"breadcrumb :\" field at line " + (i+1);

                    if(type == 3 || type == 1) {
                        errorMessage += ". This page does not need a breadcrumb field at all. You should remove this line from this file.";
                    }
                    else {
                        errorMessage += ". Only 1 breadcrumb field is needed for this page. You should remove all the excess breadcrumb field(s) from this file";
                    }

                    hasErrors = true;
                    continue;
                }
                else {
                    breadcrumbPresent = true;
                    if(type == 1 || type == 3) {
                        errorMessage += errorHeader + "has a \"breadcrumb :\" field at line " + (i+1) + ". This page does not need a breadcrumb field at all. You should remove this line from this file.";
                        hasErrors = true;
                    }
                    continue;
                }
            }
            else if(lines[i].startsWith("date: ")) {
                if(datePresent) {
                    errorMessage += errorHeader + "has another \"date: \" field at line " + (i+1);

                    if(type == 3) {
                        errorMessage += ". Only 1 date field is needed for this page. You should remove all the excess date field(s) from this file."
                    }
                    else {
                        errorMessage += ". This page does not need a date field at all. You should remove this line from this file.";
                    }

                    hasErrors = true;
                    continue;
                }
                else {
                    datePresent = true;
                    if(type != 3) {
                        errorMessage += errorHeader + "has a \"date :\" field at line " + (i+1) + ". This page does not need a date field at all. You should remove this line from this file.";
                        hasErrors = true;
                    }
                    continue;
                }
            }
            else if(lines[i].startsWith("collection_name: ")) {
                if(collectionNamePresent) {
                    errorMessage += errorHeader + "has another \"collection_name: \" field at line " + (i+1);

                    if(type == 2) {
                        errorMessage += ". Only 1 collection_name field is needed for this page. You should remove all the excess collection_name field(s) from this file.";
                    }

                    hasErrors = true;
                    continue;
                }
                else {
                    collectionNamePresent = true;
                    if(type != 2) {
                        errorMessage += errorHeader + "has a \"collection_name: \" field at line " + (i+1) + ". This page does not need a collection_name field at all. You should remove this line from this file.";
                        hasErrors = true;
                    }
                    continue;
                }
            }
            //empty lines are ok, we are only worried about unrecognised non-empty ones
            else if(lines[i].length > 0) {
                //we hold this message (i.e. unconfirmed) because it could be because the user
                //failed to put the triple dashes at the end of the header
                errorMessageHold += errorHeader + "has an unrecognised header at line " + (i+1) + ". Check if it is a typo and whether you have left out other required headers. Remember that the text on your page can only start from the line after the second set of 3 dashes (---).";
            }
        }

        //now that we have reached the end we make sure it has 3 dashes
        //and we make sure the headers we need are here
        if(i < lines.length && lines[i].startsWith("---") && lines[i].length == 3) {
            //good end headers
            //meaning we can put in the unrecognised header error message(s) held back (if any)
            if(errorMessageHold.length > 0) {
                errorMessage += errorMessageHold;
                hasErrors = true;
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

            if(!layoutPresent) {
                errorMessage += errorHeader + "is missing the layout field in the header." + headerHint;
                hasErrors = true;
            }
            if(!titlePresent) {
                errorMessage += errorHeader + "is missing the title field in the header." + headerHint;
                hasErrors = true;
            }
            if(!permalinkPresent) {
                errorMessage += errorHeader + "is missing the permalink field in the header." + headerHint;
                hasErrors = true;
            }
            if(!breadcrumbPresent && (type == 2 || type == 4)) {
                errorMessage += errorHeader + "is missing the breadcrumb field in the header." + headerHint;
                hasErrors = true;
            }
            if(!collectionNamePresent && type == 2) {
                errorMessage += errorHeader + "is missing the collection_name field in the header." + headerHint;
                hasErrors = true;
            }
            if(!datePresent && type == 3) {
                errorMessage += errorHeader + "is missing the date field in the header." + headerHint;
                hasErrors = true;
            }
        }
        else {
            //bad or non-existent end headers
            errorMessage += errorHeader + "needs to have exactly 3 dashes (---) after all the headers (e.g. layout and title), on a new line.";
            hasErrors = true;
        }

        //whew finally we are done checking headers
        //now we'll return the values for markdownHandler to handle
        if(hasErrors) {
            return errorMessage;
        }
        else {
            return false;
        }
    }
}