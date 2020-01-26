// This function takes in MARC in text form and returns it as a JS object.
// Arguments:
// - inputMarc - Input text containing MARC as a string.
// - arr       - Optional array of MARC tags to return in object. 
//              (NB no indicators or separate subfields this way.)
// If no array is supplied, returns an object with all MARC tags present. 
// broken down by field, ind1, ind2 and subfields.
// Method getFields( array, pretty ) on this object returns just those fields required
// Optional boolean 'pretty' removes subfield delimiters, making text more readable.
// TODO - add support for subfields in getFields(), so we can target 
// them precisely: e.g. parseMarc(["245|a","260|b"])

function parseMarc(inputMarc, arr) {
//    var inputMarc = document.getElementsByTagName("pre")[0].innerText;
    var returnMarc = {};
// Code here to verify if input actually contains MARC / is not null

    inputMarc = inputMarc.replace(/\n +/gm," ")   // First clean up run-over lines. Leaves one marc tag per line.                       
                         .replace(/\$/g,"|")      // Then replace $ delimiters with pipes
                         .replace(/\#/g," ");     // And replace # indicators with spaces
                                                  
    var splitRE = /^.*?([0-9]{3})(?:\t| )((?:[0-9#]| ){1}) ?((?:[0-9#]| ){1}) ?(.*)/gm;
    var splitMarc = [];
    var tagCounter = 2;

// This function to separate out subfields
    function setSubFields(text) {
        var output = {};
        var subFields = [];
        text = text + "|";                                 // append pipe so regex will catch final subfield
        if(text.slice(0,2) !== "|a") {text = "|a"+ text;}  // Add subfield a if not already present
        var subfieldRE = /\|(\S)(.*?)(?=\|)/g;             // 1st match delimiter, 2nd match subfield text

        while ((subFields = subfieldRE.exec(text)) !== null) {
            output[subFields[1]] = subFields[2];
        }
        return output;
    }

    while ((splitMarc = splitRE.exec(inputMarc)) !== null) {
        var tag = splitMarc[1].toString();
        // Check for duplicated tag
        if (returnMarc[tag]) {
        // Add suffix if dupe
            tag = tag + "-" + tagCounter;
            tagCounter++;
        }      
        returnMarc[tag]              = {};
        returnMarc[tag]["field"]     = splitMarc[4].replace(/  /g," "); // Clear any double spaces
        returnMarc[tag]["ind1"]      = splitMarc[2];
        returnMarc[tag]["ind2"]      = splitMarc[3];
        returnMarc[tag]["subfields"] = setSubFields(returnMarc[tag]["field"]); 
    }

// A method to get only the required fields
    returnMarc.getFields = function(array,pretty){
        var output = {};
        // Need to add support here for retrieving subfields
        for (var i=0 ; i<array.length ; i++){
            var tag = array[i];
            if (!returnMarc[tag]) { 
                output[tag] = "--";
            } else if (pretty) {
                output[tag] = returnMarc[tag].field.replace(/\|./g," ")  // Remove subfield delimiters
            } else {
                output[tag] = returnMarc[tag].field; 
            }
        }
        return output;
    }

// Return all MARC fields in an object if no array supplied, 
// or just requested fields if array supplied.

    if (arr) {
        return returnMarc.getFields(arr,true);
      } else {
        return returnMarc;
    }
}
