/// <reference path="../typings/index.d.ts" />


// Webservice Info Start
// LIVE 
//var baseURL = 'http://nav2015srv.navtilus.dk:10000/NAVWS';
//var scrumboardURL = baseURL + '/Navtilus2015WSNTLM/WS/Navtilus%20Software%20P%2FS/Codeunit/Scrumboard'
//var scrumboardNS = 'http://schemas.xmlsoap.org/soap/envelope/';
//var SoapEnvelopeNS = "http://schemas.xmlsoap.org/soap/envelope/";
// LIVE SNAP TEST
// var baseURL = 'http://nav2015srv.navtilus.dk:10000/NAVWS';
// var scrumboardURL = baseURL + '/Navtilus2015WSNTLM/WS/Navtilus%20Software%20P%2FS/Codeunit/ScrumboardSnap'
// var scrumboardNS = 'http://schemas.xmlsoap.org/soap/envelope/';
// var SoapEnvelopeNS = "http://schemas.xmlsoap.org/soap/envelope/";
// TEST
var baseURL = 'http://nav2015srv.navtilus.dk:10001/NAVWS';
var scrumboardURL = baseURL + '/NavtilusUDV2015WSNTLM/WS/TEST%20Navtilus%20Software%20PS/Codeunit/Scrumboard'
var scrumboardNS = 'http://schemas.xmlsoap.org/soap/envelope/';
var SoapEnvelopeNS = "http://schemas.xmlsoap.org/soap/envelope/";
// TEST SNAP
// var baseURL = 'http://nav2015srv.navtilus.dk:10001/NAVWS';
// var scrumboardURL = baseURL + '/NavtilusUDV2015WSNTLM/WS/TEST%20Navtilus%20Software%20PS/Codeunit/Scrumboard'
// var scrumboardNS = 'http://schemas.xmlsoap.org/soap/envelope/';
// var SoapEnvelopeNS = "http://schemas.xmlsoap.org/soap/envelope/";
// Webservice Info End

var carddata;
var setupJSON;
var postItEvent = new Event('PostItData');
var setupEvent = new Event('SetupData');

InvokeNavWS(scrumboardURL, 'Headers', scrumboardNS, 'return_value', '', setSetupJSON);

// LIVE
function getPostItData() {
  InvokeNavWS(scrumboardURL, 'JobTasks', scrumboardNS, 'return_value', '', setCardData);
}
// TEST
//function getPostItData() {
// InvokeNavWS(scrumboardURL, 'JobTasksFromSnapshot', scrumboardNS, 'return_value', '', setCardData);
//}

var draw = Snap('#svgDiv');
var g = draw.group();
var cardgroup = draw.group();

var globalResourceHeight = 0;
var globalPostITScaling = 0;
var horizontalHeaderLineDrawn = false;

function drawHeaders() {
  var svgDiv = Snap.load("svg/svgHeader.svg", function (loadedFragment) {
    console.log('Drawing headers');
    var header = loadedFragment.select("#Header");

    setupJSON.Headers.forEach(function (obj) {
      var tempHeader = header;
      var yPos = getCenterYPos(0, heightPctToPix(5));
      // Attempt to offset y pos to center text
      tempHeader.transform(getTransformationString(widthPctToPix(obj.Position), yPos, ));
      tempHeader.node.setAttribute("height", String(heightPctToPix(5/2)));
      tempHeader.node.setAttribute("width", String(widthPctToPix(Number(obj.Width))));
      tempHeader.select("#HeaderText").node.textContent = obj.Description;
      tempHeader.select("#HeaderText").node.setAttribute("height", String(heightPctToPix(5/2)));
      tempHeader.select("#HeaderText").node.setAttribute("width", String(widthPctToPix((Number(obj.Width)))));
      tempHeader.select("#HeaderText").node.setAttribute("vertical-align", "middle");
      g.append(tempHeader.clone())
      var line = draw.line(widthPctToPix(obj.Position), 0, widthPctToPix(obj.Position), "100%");
      line.attr({
        stroke: "#000",
        strokeWidth: 2
      });
      g.append(line);
    });
  });
}

function drawResources() {
  var svgDiv = Snap.load("svg/ResourceHeader.svg", function (loadedFragment) {
    var resource = loadedFragment.select("#Resource");
    setupJSON.Resources.forEach(function (obj) {
      var tempResource = resource;
      var yPosTop = heightPctToPix(getResourceYPctPosition(Number(obj.ID)));
      var yPosBottom = heightPctToPix(getResourceYPctPosition(Number(obj.ID) + 1));
      //var yPosCenter = getCenterYPos(yPosTop, yPosBottom);
      var xPos = getResourceXPosition(findWithAttr(setupJSON.Headers,"Description","ID"));
      tempResource.transform(getTransformationString(xPos, yPosTop, ));
      tempResource.node.setAttribute("width", String(widthPctToPix(Number(setupJSON.Headers[0].Width))));
      var height = offsetHeight(yPosBottom - yPosTop);
      tempResource.node.setAttribute("height", String(height));
      tempResource.select(".IDText").node.textContent = obj.Name;
      tempResource.select(".IDText").node.setAttribute("width", String(widthPctToPix(Number(setupJSON.Headers[0].Width))));
      tempResource.select(".IDText").node.setAttribute("height", String(offsetHeight(yPosBottom - yPosTop)));

      if (obj.Name.length > 0) {
        tempResource.select(".BufferText").node.textContent = obj.Buffer;
        tempResource.select(".BufferText").node.setAttribute("width", String(widthPctToPix(Number(setupJSON.Headers[0].Width))));
        //tempResource.select(".BufferText").node.setAttribute("height", String(offsetHeight(yPosBottom - yPosTop)));
        tempResource.select(".DetailText").node.textContent = obj.RemainingEstimate + "/" + obj.Capacity;
        tempResource.select(".DetailText").node.setAttribute("width", String(widthPctToPix(Number(setupJSON.Headers[0].Width))));
        tempResource.select(".DetailText").node.setAttribute("height", String(yPosBottom - yPosTop - tempResource.select(".DetailText").node.getAttribute("y")));
      }
      g.append(tempResource.clone());

      var lineX = 0;
      var lineX2 = widthPctToPix(100);
      if (JSON.parse(setupJSON.Headers[0].Controlbar))
        {
          lineX = widthPctToPix(setupJSON.Headers[0].Width);
        }
      else if (JSON.parse(setupJSON.Headers[setupJSON.Headers.length - 1].Width))
        {
          lineX2 = widthPctToPix(100 - setupJSON.Headers[setupJSON.Headers.length - 1].Width);
        }

      if (!horizontalHeaderLineDrawn)
        {
          var line = draw.line(lineX, heightPctToPix(5), lineX2, heightPctToPix(5));
          line.attr({
            stroke: "#000",
            strokeWidth: 2
          });
          g.append(line);
          horizontalHeaderLineDrawn = true;
        }
      var line = draw.line(lineX, yPosBottom, lineX2, yPosBottom);
      line.attr({
        stroke: "#000",
        strokeWidth: 2
      });
      g.append(line);
    })
  });
}

function drawRefreshButton() {
  var svgDiv = Snap.load("svg/RefreshButton.svg",function (loadedFragment){
    var button = loadedFragment.select(".RefreshButton");
    var ControlbarIndex = findWithAttr(setupJSON.Headers,"Controlbar","true");
    var startX = widthPctToPix(setupJSON.Headers[ControlbarIndex].Position) + 2;
    var width = widthPctToPix(setupJSON.Headers[ControlbarIndex].Width) - 4;
    var scale = width / 100;
    var height = 100 * scale;
    var startY = heightPctToPix(100) - height;
    button.transform(getTransformationString(startX,startY,scale));
    g.append(button);
  });
}

function drawColorLegend() {
  var svgDiv = Snap.load("svg/ColorLegend.svg", function (loadedFragment){
    var legend = loadedFragment.select(".ColorLegend");
    var ControlbarIndex = findWithAttr(setupJSON.Headers,"Controlbar","true");
    var startX = widthPctToPix(setupJSON.Headers[ControlbarIndex].Position) + 2;
    var width = widthPctToPix(setupJSON.Headers[ControlbarIndex].Width) - 4;
    var scale = width / 100;
    var offset = (400 * scale) + 10;
    var startY = 5;
    legend.node.setAttribute("style","p{transform: -webkit-transform: rotate(90deg);}")

    var index = findWithAttrPair(carddata.Tasks,"Priority","0","Unplanned","0");
    if (index != -1)
      {
        legend.select(".Color").node.setAttribute("fill",carddata.Tasks[index].Color);
        legend.select(".LegendDescription").node.textContent = "Normal";
        legend.transform(getTransformationString(startX, startY, scale));
        g.append(legend.clone());
        startY = startY + offset;
      }
    var index = findWithAttrPair(carddata.Tasks,"Priority","1","Unplanned","0");
    if (index != -1)
      {
        legend.select(".Color").node.setAttribute("fill",carddata.Tasks[index].Color);
        legend.select(".LegendDescription").node.textContent = "Høj";
        legend.transform(getTransformationString(startX, startY, scale));
        g.append(legend.clone());
        startY = startY + offset;
      }
    var index = findWithAttrPair(carddata.Tasks,"Priority","0","Unplanned","1");
    if (index != -1)
      {
        legend.select(".Color").node.setAttribute("fill",carddata.Tasks[index].Color);
        legend.select(".LegendDescription").node.textContent = "Uplanlagt";
        legend.transform(getTransformationString(startX, startY, scale));
        g.append(legend.clone());
        startY = startY + offset;
      }
    var index = findWithAttrPair(carddata.Tasks,"Priority","1","Unplanned","1");
    if (index != -1)
      {
        legend.select(".Color").node.setAttribute("fill",carddata.Tasks[index].Color);
        legend.select(".LegendDescription").node.textContent = "Uplanlagt Høj";
        legend.transform(getTransformationString(startX, startY, scale));
        g.append(legend.clone());
        startY = startY + offset;
      }
  });
}

window.addEventListener('PostItData', function (e) {
  drawPostIts();
  drawColorLegend();
}, false);

window.addEventListener('SetupData', function (e) {
  drawHeaders();
  drawResources();
  drawRefreshButton();
  getPostItData();
}, false);

function drawPostIts() {
  Snap.load("svg/postit.svg", function (loadedFragment) {
    var postIt = loadedFragment.select("#PostIT");
    carddata.Tasks.forEach(function (obj) {
      var tempCard = postIt;
      // Find placement
      var xPos = findPostITXPos(Number(Number(obj.Status) +1), Number(obj.Index), Number(obj.Count));
      var yPos = heightPctToPix(getPostItYPctPosition(findWithAttr(setupJSON.Resources, "Name", obj.Resource)));
      //Transform PostIT
      tempCard.transform(getTransformationString(xPos, yPos, globalPostITScaling));
      tempCard.select("#ID").node.textContent = obj.Job + "/" + obj.Task;
      tempCard.select("#Name").node.textContent = obj.Name;
      tempCard.select("#ShortText").node.textContent = obj.Title;
      tempCard.select("#Background").node.setAttribute("fill", obj.Color);
      cardgroup.append(tempCard.clone());
    });
  });
}

function getCenterYPos(top, bottom) {
  var yPos = (bottom - top) / 2;
  var textsize = parseFloat(getComputedStyle(document.documentElement).fontSize);
  var halfEM = textsize / 2;
  var yPos = (yPos - halfEM) + top;
  return yPos;
}

function enlargePostIt(parameter) {
  Snap.load("svg/largePostit.svg", function (loadedFragment) {
    // find the post it data
    var parameterPostIt = Snap(parameter);
    var jobIDText = parameterPostIt.select('.JobID').node.textContent;
    var n = jobIDText.indexOf('/');
    var JobID = jobIDText.substring(0, n != -1 ? n : jobIDText.length);
    var TaskID = jobIDText.substring(n + 1, jobIDText.length)
    var index = findWithAttrPair(carddata.Tasks,"Job",JobID,"Task",TaskID);
    var jobTask = carddata.Tasks[index];
    // Draw the post it
    var tempPostIt = loadedFragment.select('.LargePostIt');
    tempPostIt.select('.JobID').node.textContent = jobTask.Job + '/' + jobTask.Task ;
    tempPostIt.select('.JobID').node.setAttribute("style", "font-size: 0.75em");
    tempPostIt.select('.Name').node.textContent = jobTask.Name;
    tempPostIt.select('.Name').node.setAttribute("style", "font-size: 0.75em");
    tempPostIt.select('.ShortText').node.textContent = jobTask.Title;
    tempPostIt.select('.ShortText').node.setAttribute("height", "25");
    tempPostIt.select('.ShortText').node.setAttribute("style", "font-size: 0.75em");
    tempPostIt.transform(getTransformationString(widthPctToPix(25), heightPctToPix(25), getLargePostItScaling()));
    tempPostIt.select('.Description').node.textContent = jobTask.Desc;
    tempPostIt.select("#Background").node.setAttribute("fill", jobTask.Color);
    tempPostIt.node.setAttribute("onclick", "this.remove()");
    cardgroup.append(tempPostIt.clone());
  });
}

/**
  * Offset height of headers, for use in centering.
  * @param {number} height Height of the header space
  * @return {number}
  */
function offsetHeight(height) {
  var offset = parseFloat(getComputedStyle(document.documentElement).fontSize) / 2;
  return height - offset;
}

/**
  * Returns PostIT scaling based on the total height of the page
  * @return {number}
  */
function calcPostITScaling() {
  return (globalResourceHeight / 200) * 0.7;
}

/**
  * Returns PostIt width based on global scale
  * @return {number} PostIt width in pixels
  */
function getPostItWidth() {
  return 300 * globalPostITScaling;
}

/**
  * Returns the position on the x axis for a post it.
  * @param {number} Status The status index on the PostIT
  * @param {number} PostItIndex The index of the PostIT, within the given status
  * @param {number} Count The total amount of PostIT's within the given status, for the PostIT's resource.
  * @return {number}
  */
function findPostITXPos(Status, PostItIndex, Count) {
  // TODO: Global variable for scaling of post its. Hardcoded for now
  // Using 5 pixels spacing for post its - Do this smarter...
  var startPos = widthPctToPix(setupJSON.Headers[Status].Position) + 5;
  var statusWidth = widthPctToPix(setupJSON.Headers[Status].Width) - 10;
  if (Count == 1) {
    return startPos;
  }
  if (((getPostItWidth() + 5) * Count) <= statusWidth) {
    return startPos + (PostItIndex * (getPostItWidth() + 5))
  } else {
    var offset = (statusWidth - getPostItWidth()) / (Count - 1);
    return startPos + (offset * PostItIndex);
  }
}

/**
  * Returns the index number for the object in the array with an attribute with the passed value.
  * @param {string} attr The attribute to search for the value in.
  * @param {string} value The value to search for.
  * @return {number} The index of the object. -1 = Not found.
  */
function findWithAttr(array, attr, value) {
  for (var i = 0; i < array.length; i += 1) {
    if (array[i][attr] === value) {
      return i;
    }
  }
  return -1;
}

/**
  * Returns the index number for the object in the array with an attribute pair with the passed values.
  * @param {string} attr1 The first attribute to search for the value in.
  * @param {string} value1 The first  value to search for.
  * @param {string} attr2 The second attribute to search for the value in.
  * @param {string} value2 The second value to search for.
  * @return {number} The index of the object. -1 = Not found.
  */
function findWithAttrPair(array, attr1, value1, attr2, value2) {
  for (var i = 0; i < array.length; i += 1) {
    if (String(array[i][attr1]) == String(value1) && String(array[i][attr2]) == String(value2)) {
      return i;
    }
  }
  return -1;
}

/**
  * Returns the position in percentage on the y axis for a given resource index relative to coordinate 0,0.
  * @param {number} index The resource index.
  * @return {number} Placement on the y axis, in percentages of screen height
  */
function getResourceYPctPosition(index) {
  var pos = index;
  var pctPerResource = 95 / setupJSON.Resources.length;
  var result = pctPerResource * pos + 5;
  if (globalResourceHeight == 0) {
    globalResourceHeight = heightPctToPix(pctPerResource);
    globalPostITScaling = calcPostITScaling();
  }
  return result;
}

/**
  * Returns the position in pixels on the x axis for a given resource index relative to coordinate 0,0.
  * @param {number} index The resource index.
  * @return {number} Number of pixels from coordinate 0,0.
  */
function getResourceXPosition(index) {
  var pos = widthPctToPix(setupJSON.Headers[index].Position) + 5;
  return pos;
}

/**
  * Calculate a PostIT's y position in persentages, based on the PostIT's resource index
  * @param {number} resourceIndex The Index of the resource the PostIT is attached to
  * @return {number} The Percentage y position
  */
function getPostItYPctPosition(resourceIndex) {
  var pos = resourceIndex;
  var pctPerResource = 95 / setupJSON.Resources.length;
  var result = pctPerResource * pos + 5 + (pctPerResource * 0.15);
  return result;
}

/**
  * Calculates the required scaling for large PostIT's
  * @return {number}
  */  
function getLargePostItScaling() {
  var onePct = $(window).height() / 100;
  var scaling = (onePct * 50) / 200;
  return scaling;
}

/**
  * Returns an SVG transformation string 
  * @param {number|string} x The x coordinate for the SVG element
  * @param {number|string} y The y coordinate for the SVG element
  * @param {number|string} scale The scaling for the SVG element
  * @return {string} The finished transformation string
  */
function getTransformationString(x, y, scale) {
  var result = "translate(" + x + "," + y + ")";
  if (scale != null) {
    result = result + " scale(" + scale + ")";
  }
  return result;
}

/**
  * Converts a percentage based on the windows width, to pixels.
  * @param {number} pct A percentage to convert to pixels.
  * @return {number} Number of pixels from coordinate 0,0.
  */
function widthPctToPix(pct) {
  var onePct = $(window).width() / 100;
  return Number(pct) * onePct;
}

/**
  * Converts a percentage based on the window height, to pixels.
  * @param {number} pct A percentage to convert to pixels.
  * @return {number} Number of pixels from coordinate 0,0.
  */
function heightPctToPix(pct) {
  var onePct = $(window).height() / 100;
  return pct * onePct;
}

// Function to Invoke a NAV WebService and return data from a specific Tag in the responseXML 
/**
  * @param {string} URL URL to call.
  * @param {string} method The name of the method to call on the webservice.
  */
function InvokeNavWS(URL, method, nameSpace, returnTag, parameters, callback) {
  var result = null;
  try {
    var xmlhttp;
    if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari 
      xmlhttp = new XMLHttpRequest();
    } else { // code for IE6, IE5 
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    var request = '<Soap:Envelope xmlns:Soap="' + SoapEnvelopeNS + '">' +
      '<Soap:Body>' +
      '<' + method + ' xmlns="' + nameSpace + '">' +
      parameters +
      '</' + method + '>' +
      '</Soap:Body>' +
      '</Soap:Envelope>';

    // Use Post and async 
    xmlhttp.open('POST', URL, true);
    xmlhttp.setRequestHeader('Content-type', 'text/xml; charset=utf-8');
    xmlhttp.setRequestHeader('SOAPAction', method);
    //xmlhttp.setRequestHeader("Authorization","Basic " + btoa("USERNAME:PASSWORD"));
    xmlhttp.setRequestHeader('withCredentials', 'TRUE');

    // Setup event handler when readystate changes 
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
          xmldoc = xmlhttp.responseXML;
          result = xmldoc.documentElement.textContent;
          callback(result);
          //xmldoc.setProperty('SelectionLanguage', 'XPath');
          //xmldoc.setProperty('SelectionNamespaces', 'xmlns:tns="' + nameSpace + '"');
          //result = xmldoc.selectNodes('//tns:' + returnTag);
        }
      }
    }
    // Send request will return when event has fired with readyState 4 
    xmlhttp.send(request);
  } catch (e) {
    alert(e.message);
  }
}

function setCardData(result) {
  carddata = JSON.parse(result);
  window.dispatchEvent(postItEvent);
};

function setSetupJSON(result) {
  setupJSON = JSON.parse(result);
  window.dispatchEvent(setupEvent);
}

