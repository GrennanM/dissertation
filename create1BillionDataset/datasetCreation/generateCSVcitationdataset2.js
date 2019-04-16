//Author: M.Schibel 2018
//License: CC0 1.0 Universal - https://creativecommons.org/publicdomain/zero/1.0/ (in other words: feel free to use it)
function csvline(fields) {
  var string = "";
  for (var i = 0; i < fields.length; i++) {
    string += '"' + fields[i].replace(/\n/g, '').replace(/\"/g, '""') + "\",";
  }
  return string;
}
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

function escapeXml(unsafe) {
  //https://stackoverflow.com/questions/7918868/how-to-escape-xml-entities-in-javascript
  return unsafe.replace(/[<>&'"]/g, function(c) {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
    }
  });
}

function escapeXml2(unsafe) {
  return escapeXml(escapeXml(unsafe));
}

function makebib(styleString, keys) {

  try {
    var engine = sys.newEngine(styleString, 'en-US');
    //sys.items = citations;
    engine.setOutputFormat("text");
    engine.updateItems(keys);
    var bib = engine.makeBibliography();
    return bib[1];
  } catch (error) {
    console.error(error);
    fs.appendFileSync('log.txt', 'Error with ' + csls[i] + "\n" + error);
  }
}

//console.log(process.argv);
console.time("script");

//0. require depenancies
var fs = require('fs');
var citeproc = require("citeproc-js-node");
var xmldom = require('xmldom').DOMParser;

//needed for tagged output
var xml = new xmldom();
var XMLSerializer = require('xmldom').XMLSerializer;
var serializer = new XMLSerializer();

//taken from http://docs.citationstyles.org/en/1.0.1/specification.html#appendix-iii-types
var citationTypeIndex = {"article":0,
"article-magazine":1,
"article-newspaper":2,
"article-journal":3,
"bill":4,
"book":5,
"broadcast":6,
"chapter":7,
"dataset":8,
"entry":9,
"entry-dictionary":10,
"entry-encyclopedia":11,
"figure":12,
"graphic":13,
"interview":14,
"legislation":15,
"legal_case":16,
"manuscript":17,
"map":18,
"motion_picture":19,
"musical_score":20,
"pamphlet":21,
"paper-conference":22,
"patent":23,
"post":24,
"post-weblog":25,
"personal_communication":26,
"report":27,
"review":28,
"review-book":29,
"song":30,
"speech":31,
"thesis":32,
"treaty":33,
"webpage":34}


//This folder should have all the CSL files
const cslFolder = './csl/';
//the output

//1. Start reading input file
if (process.argv[3]) {
  var fileName = './' + process.argv[3];
} else {
  var fileName = './cr20.json';
}

console.time("readrawfile");
var data = fs.readFileSync(fileName, 'utf8');
data = data.replace(/</g, "&lt;").replace(/>/g, "&rt;");
console.timeEnd("readrawfile");

var lines = data.split('\n');
//2. cut it into pieces if specified
if (process.argv[4]) {
  // node --max-old-space-size=50000 generateCSVcitationdataset.js tags cr10k_random.json
  var treshhold = parseInt(process.argv[4]);
  var multiplier = 50;
  //treshhold = 0;
  lines = lines.slice(multiplier * treshhold, multiplier * (1 + treshhold));
  console.log("Treshold" + treshhold + " count " + lines.length + "until" + (multiplier * (1 + treshhold) - 1));
  fs.appendFileSync('log.txt', "Treshold" + treshhold + " count\n");
}
var counter = 0;
var count = lines.length;

var crossref = require("./crossref2citeprocjson.js");
var citations = crossref.crossref2citeproc(lines);

//csls = ["bibtex","modern-language-association","apa"];
var files = fs.readdirSync(cslFolder);
var csls = [];
for (var i in files) {
  if ((files[i] + "").slice(-4) == ".csl") {
    csls.push(files[i].slice(0, -4));
  }
}


// file path
var output_file = "/home/markg/dissertation/previousGithub1B/ouput/output_strings_" +
  (count) + "_rand" + Math.floor(Math.random() * 1000) + ".csv";
var output = "";
//clear the file
fs.writeFileSync(output_file, "");
//Start creating the output file--
fs.appendFileSync('log.txt', "Writing file " + output_file + "\n");

var citation_keys = Object.keys(citations);
// https://groups.google.com/forum/#!topic/zotero-dev/2i_-1EZZbUU

//create bibtex bibliography
console.log("creating bibtex");
var sys = new citeproc.simpleSys();
var enUS = fs.readFileSync('./locales/locales-en-US.xml', 'utf8');
sys.addLocale('en-US', enUS);
var styleString = fs.readFileSync('bibtex.csl_', 'utf8').replace(/<sort>([\s\S]*?)<\/sort>/g, '');

var engine = sys.newEngine(styleString, 'en-US');
sys.items = citations;
engine.setOutputFormat("text");
engine.updateItems(citation_keys);
var bibtex = engine.makeBibliography();
bibtex = bibtex[1];
//bibtex done

//create header
fs.appendFileSync(output_file, csvline(["doi", "articleType", "citationStyle", "citationStringAnnotated"]) + "\n");

var failedbibliographies = [];

// changed i < length to 1
for (var i = 0, len = csls.length; i < len; i++) {
  console.log(i + ". " + csls[i]);
  var styleString = fs.readFileSync(cslFolder + csls[i] + '.csl', 'utf8');

  styleString = styleString.replace(/<([^>]*)(\sdefault-locale=\".+?\"(\s|))(.*?)>/, '<$1$3>'); //prevent error caused by default locale https://github.com/Juris-M/citeproc-js/issues/81
  styleString = styleString.replace(/<sort>([\s\S]*?)<\/sort>/g, ''); //remove sorting
  styleString = styleString.replace(/<text variable=\"citation-number\"(.*?)\/>/g, ''); //remove citation number at the beginning of the string
  styleString = styleString.replace(/disambiguate-add-year-suffix=\"true\"/g, ''); //remove year suffix such as 2006b

  // bib = makebib(styleString);

  var variable, newprefix, newsuffix;
  if (process.argv[2] == "tags") {

    var doc = xml.parseFromString(styleString, 'application/xml');

    var xmlname = doc.getElementsByTagName("name");
    for (var a = 0; a < xmlname.length; a++) {

      if (xmlname[a].parentNode.parentNode.tagName != "info") {
        var namepart = xmlname[a].getElementsByTagName("name-part");
        var has = {
          family: false,
          given: false
        };
        for (var z = 0; z < namepart.length; z++) {
          has[namepart[z].getAttribute("name")] = true;
        }


        if (!has.family) {
          var family = doc.createElement("name-part");
          family.setAttribute("name", "family");
          xmlname[a].appendChild(family);
        }
        if (!has.given) {
          var given = doc.createElement("name-part");
          given.setAttribute("name", "given");
          xmlname[a].appendChild(given);
        }
      }
    }
    for (var a = 0; a < 5; a++) {
      var tagname = ["text", "date", "names", "name-part", "date-part"][a];
      var text = doc.getElementsByTagName(tagname);

      for (id in text) {

        try {
          if (tagname.slice(-5) == "-part") {
            variable = text[id].getAttribute("name");
          } else {
            variable = text[id].getAttribute("variable");
          }
        } catch (error) {
          //console.log(tex[id]);
          variable = null;
        }
        //console.log(variable);
        newprefix = "";
        newsuffix = "";
        if (variable) {
          newprefix = "<" + variable + ">";
          newsuffix = "</" + variable + ">"; //match(/[a-zA-Z0-9_-]+/)[0]
        }
        //        text[id].setAttribute("prefix",(text[id].getAttribute("prefix").replace("&","&amp;"))+newprefix);
        try {
          text[id].setAttribute("prefix", escapeXml2(text[id].getAttribute("prefix")) + newprefix);
          text[id].setAttribute("suffix", newsuffix + escapeXml2(text[id].getAttribute("suffix")));
          if (text[id].getAttribute("value")) {
            text[id].setAttribute("value", escapeXml2(text[id].getAttribute("value")));
          }
        } catch (error) {}
      }
    }
    var styleStringAnnotated = serializer.serializeToString(doc);
    fs.writeFileSync("csl_with_tags/" + csls[i] + ".csl", styleStringAnnotated);
  }


  for (var c = 0; c < citations.length; c++) {

    //The issue with two double issued tags
    var annotatedstring = makebib(styleStringAnnotated, ["" + c]);
    if (annotatedstring != undefined && annotatedstring.length && annotatedstring[0] != undefined) {
      annotatedstring = annotatedstring[0].replace(/<\/issued>([^<]*)<issued>/g, "$1").replace(/&amp;/g, "&");


      // Note: certain types still not in citationTypeIndex e.g. proceedings-article
      // check if in dict
      // if not add to dict
      // then add to file
      console.log(citations[c]["type"] + ": " + citationTypeIndex[citations[c]["type"]]);
      console.log("-------------------------------");
      fs.appendFileSync(output_file, csvline([
        citations[c]["DOI"],
        // citationTypeIndex[citations[c]["type"]], //citationType index FIX THIS!
        i.toString(), //citationStyle index
        annotatedstring,
      ]) + "\n");
    } else {
      annotatedstring = "";
      failedbibliographies.push(i + ". " + csls[i]);
    }
  }
}

var failedBibs = new Set(failedbibliographies);

console.log("Failed ones:");
console.log(failedbibliographies);
console.log('Saved CSV to ' + output_file);
console.timeEnd("script");