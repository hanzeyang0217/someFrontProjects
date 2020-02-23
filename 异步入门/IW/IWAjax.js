function AjaxRequest() {
    var req = new Object();
    req.timeout = null;
    req.generateUniqueUrl = true;
    req.url = window.location.href;
    req.method = "GET";
    req.async = true;
    req.username = null;
    req.password = null;
    req.parameters = new Object();
    req.requestIndex = AjaxRequest.numAjaxRequests++;
    req.responseReceived = false;
    req.groupName = null;
    req.queryString = "";
    req.responseText = null;
    req.responseXML = null;
    req.status = null;
    req.statusText = null;
    req.aborted = false;
    req.xmlHttpRequest = null;
    req.onTimeout = null;
    req.onLoading = null;
    req.onLoaded = null;
    req.onInteractive = null;
    req.onComplete = null;
    req.onSuccess = null;
    req.onError = null;
    req.onGroupBegin = null;
    req.onGroupEnd = null;
    req.eventParams = null;
    req.xmlHttpRequest = AjaxRequest.getXmlHttpRequest();
    if (req.xmlHttpRequest == null) {
        return null;
    }

    req.xmlHttpRequest.onreadystatechange = function () {
        if (req == null || req.xmlHttpRequest == null) {
            return;
        }

        if (req.xmlHttpRequest.readyState == 1) {
            req.onLoadingInternal(req);
        }

        if (req.xmlHttpRequest.readyState == 2) {
            req.onLoadedInternal(req);
        }

        if (req.xmlHttpRequest.readyState == 3) {
            req.onInteractiveInternal(req);
        }
        if (req.xmlHttpRequest.readyState == 4) {
            logMessage(req.url + ' is finished ready state = ' + req.xmlHttpRequest.readyState);
            req.onCompleteInternal(req);
            XHRObjects.splice(XHRObjects.indexOf(req.xmlHttpRequest), 1);
            req.xmlHttpRequest = null;
        }
    };

    req.onLoadingInternalHandled = false;
    req.onLoadedInternalHandled = false;
    req.onInteractiveInternalHandled = false;
    req.onCompleteInternalHandled = false;
    req.onLoadingInternal = function () {
        if (req.onLoadingInternalHandled) {
            return;
        }
        AjaxRequest.numActiveAjaxRequests++;
        if (AjaxRequest.numActiveAjaxRequests == 1 && typeof (window['AjaxRequestBegin']) == "function") {
            AjaxRequestBegin();
        }
        if (req.groupName != null) {
            if (typeof (AjaxRequest.numActiveAjaxGroupRequests[req.groupName]) == "undefined") {
                AjaxRequest.numActiveAjaxGroupRequests[req.groupName] = 0;
            }
            AjaxRequest.numActiveAjaxGroupRequests[req.groupName]++;
            if (AjaxRequest.numActiveAjaxGroupRequests[req.groupName] == 1 && typeof (req.onGroupBegin) == "function") {
                req.onGroupBegin(req.groupName);
            }
        }
        if (typeof (req.onLoading) == "function") {
            req.onLoading(req);
        }
        req.onLoadingInternalHandled = true;
    };

    req.onLoadedInternal = function () {
        if (req.onLoadedInternalHandled) {
            return;
        }
        if (typeof (req.onLoaded) == "function") {
            req.onLoaded(req);
        }
        req.onLoadedInternalHandled = true;
    };
    req.onInteractiveInternal = function () {
        if (req.onInteractiveInternalHandled) {
            return;
        }
        if (typeof (req.onInteractive) == "function") {
            req.onInteractive(req);
        }
        req.onInteractiveInternalHandled = true;
    };
    req.onCompleteInternal = function () {
        if (req.onCompleteInternalHandled || req.aborted) {
            return;
        }
        req.onCompleteInternalHandled = true;
        AjaxRequest.numActiveAjaxRequests--;
        if (AjaxRequest.numActiveAjaxRequests == 0 && typeof (window['AjaxRequestEnd']) == "function") {
            AjaxRequestEnd(req.groupName);
        }
        if (req.groupName != null) {
            AjaxRequest.numActiveAjaxGroupRequests[req.groupName]--;
            if (AjaxRequest.numActiveAjaxGroupRequests[req.groupName] == 0 && typeof (req.onGroupEnd) == "function") {
                req.onGroupEnd(req.groupName);
            }
        }
        req.responseReceived = true;
        req.status = req.xmlHttpRequest.status;
        req.statusText = req.xmlHttpRequest.statusText;
        req.responseText = req.xmlHttpRequest.responseText;
        req.responseXML = req.xmlHttpRequest.responseXML;
        if (typeof (req.onComplete) == "function") {
            req.onComplete(req);
        }
        if (req.xmlHttpRequest.status == 200 && typeof (req.onSuccess) == "function") {
            req.onSuccess(req);
        } else
            if (typeof (req.onError) == "function") {
                req.onError(req);
            }
        delete req.xmlHttpRequest['onreadystatechange'];
    };

    req.onTimeoutInternal = function () {
        if (req != null && req.xmlHttpRequest != null && !req.onCompleteInternalHandled) {
            req.aborted = true;
            req.xmlHttpRequest.abort();
            AjaxRequest.numActiveAjaxRequests--;
            if (AjaxRequest.numActiveAjaxRequests == 0 && typeof (window['AjaxRequestEnd']) == "function") {
                AjaxRequestEnd(req.groupName);
            }
            if (req.groupName != null) {
                AjaxRequest.numActiveAjaxGroupRequests[req.groupName]--;
                if (AjaxRequest.numActiveAjaxGroupRequests[req.groupName] == 0 && typeof (req.onGroupEnd) == "function") {
                    req.onGroupEnd(req.groupName);
                }
            }
            if (typeof (req.onTimeout) == "function") {
                req.onTimeout(req);
            }
            delete req.xmlHttpRequest['onreadystatechange'];
            req.xmlHttpRequest = null;
        }
    };

    req.process = function () {
        if (req.xmlHttpRequest != null) {
            if (req.generateUniqueUrl && req.method == "GET") {
                req.parameters["AjaxRequestUniqueId"] = new Date().getTime() + "" + req.requestIndex;
            }
            var content = null;
            for (var i in req.parameters) {
                if (req.queryString.length > 0) {
                    req.queryString += "&";
                }
                req.queryString += encodeURIComponent(i) + "=" + encodeURIComponent(req.parameters[i]);
            }
            if (req.method == "GET") {
                if (req.queryString.length > 0) {
                    req.url += ((req.url.indexOf("?") > -1) ? "&" : "?") + req.queryString;
                }
            }
            if (req.url.indexOf(".DoOnExit") > 0) {
                req.async = false;
            }
            req.xmlHttpRequest.open(req.method, req.url, req.async, req.username, req.password);
            logMessage(req.url + ' is open status= ' + req.xmlHttpRequest.readyState);
            if (req.method == "POST") {
                if (typeof (req.xmlHttpRequest.setRequestHeader) != "undefined") {
                    req.xmlHttpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                }
                content = req.queryString + req.eventParams;
            }
            if (req.timeout > 0) {
                setTimeout(req.onTimeoutInternal, req.timeout);
            }
            req.xmlHttpRequest.send(content);
            logMessage(req.url + ' is sent status= ' + req.xmlHttpRequest.readyState);
        }
    };

    req.handleArguments = function (args) {
        for (var i in args) {
            if (typeof (req[i]) == "undefined") {
                req.parameters[i] = args[i];
            } else {
                req[i] = args[i];
            }
        }
    };

    req.getAllResponseHeaders = function () { if (req.xmlHttpRequest != null) { if (req.responseReceived) { return req.xmlHttpRequest.getAllResponseHeaders(); } logMessage("Cannot getAllResponseHeaders because a response has not yet been received"); } };
    req.getResponseHeader = function (headerName) {
        if (req.xmlHttpRequest != null) {
            if (req.responseReceived) {
                return req.xmlHttpRequest.getResponseHeader(headerName);
            }
            logMessage("Cannot getResponseHeader because a response has not yet been received");
        }
    };
    return req;
}

AjaxRequest.getXmlHttpRequest = function () {
    if (window.XMLHttpRequest) {
        var xhr = new XMLHttpRequest();
        XHRObjects.push(xhr);
        return xhr;
    } else
        if (window.ActiveXObject) {/*@cc_on @*/
            /*@if(@_jscript_version >=5)
            try{return new ActiveXObject("Msxml2.XMLHTTP");}catch(e){try{return new ActiveXObject("Microsoft.XMLHTTP");}catch(E){return null;}}@end @*/
        } else {
            return null;
        }
};

AjaxRequest.isActive = function () {
    return (AjaxRequest.numActiveAjaxRequests > 0);
};

AjaxRequest.get = function (args) {
    AjaxRequest.doRequest("GET", args);
};

AjaxRequest.post = function (args, eventParams) {
    AjaxRequest.doRequest("POST", args, eventParams);
};

AjaxRequest.doRequest = function (method, args, eventParams) {
    if (typeof (args) != "undefined" && args != null) {
        var myRequest = new AjaxRequest();
        myRequest.method = method;
        if (method == "POST") {
            myRequest.eventParams = eventParams;
        }
        myRequest.handleArguments(args);
        myRequest.process();
    }
};

AjaxRequest.submit = function (theform, args) {
    var myRequest = new AjaxRequest();
    if (myRequest == null) {
        return false;
    }
    var serializedForm = AjaxRequest.serializeForm(theform);
    myRequest.method = theform.method.toUpperCase();
    myRequest.url = theform.action;
    myRequest.eventParams = theform.eventParams;
    myRequest.handleArguments(args);
    myRequest.queryString = serializedForm;
    myRequest.process();
    return true;
};

AjaxRequest.serializeForm = function (theform) {
    var els = theform.elements;
    var len = els.length;
    var queryString = "";
    this.addField = function (name, value) {
        if (queryString.length > 0) {
            queryString += "&";
        }
        queryString += encodeURIComponent(name) + "=" + encodeURIComponent(value);
    };
    for (var i = 0; i < len; i++) {
        var el = els[i];
        if (!el.disabled) {
            switch (el.type) {
                case 'text':
                case 'password':
                case 'hidden':
                case 'textarea':
                    this.addField(el.name, el.value);
                    break;
                case 'select-one':
                    if (el.selectedIndex >= 0) {
                        this.addField(el.name, el.options[el.selectedIndex].value);
                    }
                    break;
                case 'select-multiple':
                    for (var j = 0; j < el.options.length; j++) {
                        if (el.options[j].selected) {
                            this.addField(el.name, el.options[j].value);
                        }
                    }
                    break;
                case 'checkbox':
                case 'radio':
                    if (el.checked) {
                        this.addField(el.name, el.value);
                    }
                    break;
            }
        }
    }
    return queryString;
};

AjaxRequest.numActiveAjaxRequests = 0;
AjaxRequest.numActiveAjaxGroupRequests = new Object();
AjaxRequest.numAjaxRequests = 0;

var gSentValue = null;
var gSenderName = null;

function PrepareSubmitter(aSender) {
    var i = 0;
    var j = 0;
    var xItem;
    var xSubmitFormOriginal = getSubmitForm();
    var xSubmitForm = xSubmitFormOriginal.cloneNode(true);

    if (xSubmitForm.childNodes.length == 0) {
        for (i = 0; i < window.document.forms.length; i++) {
            if (window.document.forms.item(i).name == 'SubmitForm') {
                xSubmitFormOriginal = window.document.forms.item(i);
                logMessage('found submitform: ' + xSubmitFormOriginal.elements.length);
                break;
            }

        }
        logMessage('Adding child nodes');
        logMessage('child nodes:' + xSubmitFormOriginal.childNodes.length);
        for (j = xSubmitFormOriginal.elements.length - 1; j >= 0; j--) {
            xItem = cloneNode(xSubmitFormOriginal.elements.item(j));
            xSubmitForm.appendChild(xItem);
            logMessage(xSubmitFormOriginal.elements.item(j).name + ' ' + xSubmitFormOriginal.elements.item(j).type)
        }
    }

    logMessage(xSubmitForm.childNodes.length);

    //DO NOT use xSubmitForm.elements - some Browsers have problems with that
    //Use xSubmitForms.childNodes instead
    if (xSubmitForm != null) {
        var xName = '';
        for (j = xSubmitForm.childNodes.length - 1; j >= 0; j--) {
            xItem = xSubmitForm.childNodes.item(j);
            xName = xItem.name;
            if (xItem.tagName == 'INPUT') {
                if ((xName != "IW_Action") && (xName != "IW_ActionParam") && (xName != "IW_FormName") && (xName != "IW_FormClass") && (xName != "IW_width") && (xName != "IW_height") && (xName != "IW_TrackID_") && (xName != "IW_SessionID_")) {
                    if (!containsName(xName)) { // Remove all hidden fields except those that have new content
                        xSubmitForm.removeChild(xItem)
                    }
                }
            } else {
                //Item is non Input - only keep INPUT elements
                xSubmitForm.removeChild(xItem);
            }
        }

        gSentValue = null;

        for (j = 0; j < xSubmitForm.childNodes.length; j++) {
            xItem = xSubmitForm.childNodes.item(j);
            //Copy value to corresponding hidden field
            LocateInputElement(xItem.name, xSubmitForm, ProcessElement);
            AddChangedControl(xItem.name);
            if (aSender != null && xItem != null && xItem.name == aSender.name) {
                gSentValue = xItem.value;
                gSenderName = aSender.name;
            }
        }

        if (aSender != null) {
            if (!xSubmitForm.IW_Action) {
                //Some browsers have problems with cloning/elements, i.e. xSubmitForm.IW_Action won't work
                for (i = 0; i < xSubmitForm.childNodes.length; i++) {
                    if (xSubmitForm.childNodes.item(i).name == 'IW_Action') {
                        xSubmitForm.childNodes.item(i).value = aSender.name;
                        break;
                    }
                }
            } else {
                xSubmitForm.IW_Action.value = aSender.name;
                //Not sure if we need that
                //SubmitForm.elements.IW_ActionParam.value=param;
            }
        }
    }
    return xSubmitForm;
}

function modifiers(lEvent) {
    return (lEvent.altKey ? "ALT_MASK," : "")
        + (lEvent.ctrlKey ? "CTRL_MASK," : "")
        + (lEvent.metaKey ? "META_MASK," : "")
        + (lEvent.shiftKey ? "SHIFT_MASK" : "");
}

var eventGenerators = new Array(
    null, //  "abort"
    function (lEvent) { // "blur"
        return "";
    },
    function (lEvent) { // "change"
        return "";
    },
    function (lEvent) { // "click"
        if (ie4) {
            return "&x=" + lEvent.offsetX + "&y=" + lEvent.offsetY + "&which="
                + lEvent.button + "&modifiers=" + modifiers(lEvent)
                + "&mouseX=" + Math.round(lEvent.pageX) + "&mouseY=" + Math.round(lEvent.pageY);
        } else {
            return "&x=" + lEvent.layerX + "&y=" + lEvent.layerY + "&which="
                + lEvent.which + "&modifiers=" + modifiers(lEvent)
                + "&mouseX=" + Math.round(lEvent.pageX) + "&mouseY=" + Math.round(lEvent.pageY);
        }
    },
    function (lEvent) { // "dblclick"
        if (ie4) {
            return "&x=" + lEvent.offsetX + "&y=" + lEvent.offsetY + "&which="
                + lEvent.button + "&modifiers=" + modifiers(lEvent)
                + "&mouseX=" + Math.round(lEvent.pageX) + "&mouseY=" + Math.round(lEvent.pageY);
        } else {
            return "&x=" + lEvent.layerX + "&y=" + lEvent.layerY + "&which="
                + lEvent.which + "&modifiers=" + modifiers(lEvent)
                + "&mouseX=" + Math.round(lEvent.pageX) + "&mouseY=" + Math.round(lEvent.pageY);
        }
    },
    function (lEvent) { // "dragdrop"
        if (lEvent.sourceId) {
            return "&obj=" + lEvent.sourceId + '&x=' + lEvent.offsetX + '&y=' + lEvent.offsetY;
        } else {
            return "";
        }
    },
    null, // "error"
    function (lEvent) { // "focus"
        return "";
    },
    function (lEvent) { // "keydown"
        if (ie4) {
            return "&x=" + lEvent.offsetX + "&y=" + lEvent.offsetY + "&which="
                + lEvent.keyCode + "&modifiers=" + modifiers(lEvent);
        } else {
            return "&x=" + lEvent.layerX + "&y=" + lEvent.layerY + "&which="
                + lEvent.which + "&modifiers=" + modifiers(lEvent);
        }
    },
    function (lEvent) { // "keypress"
        if (ie4) {
            return "&x=" + lEvent.offsetX + "&y=" + lEvent.offsetY + "&which="
                + lEvent.keyCode + "&modifiers=" + modifiers(lEvent);
        } else {
            return "&x=" + lEvent.layerX + "&y=" + lEvent.layerY + "&which="
                + lEvent.which + "&modifiers=" + modifiers(lEvent);
        }

    },
    function (lEvent) { // "keyup"
        if (ie4) {
            return "&x=" + lEvent.offsetX + "&y=" + lEvent.offsetY + "&which="
                + lEvent.keyCode + "&modifiers=" + modifiers(lEvent);
        } else {
            return "&x=" + lEvent.layerX + "&y=" + lEvent.layerY + "&which="
                + lEvent.which + "&modifiers=" + modifiers(lEvent);
        }
    },
    function (lEvent) { // "load"
        return "";
    },
    function (lEvent) { // "mousedown"
        if (ie4) {
            return "&x=" + lEvent.offsetX + "&y=" + lEvent.offsetY + "&which="
                + lEvent.button + "&modifiers=" + modifiers(lEvent)
                + "&mouseX=" + Math.round(lEvent.pageX) + "&mouseY=" + Math.round(lEvent.pageY);
        } else {
            return "&x=" + lEvent.offsetX + "&y=" + lEvent.offsetY + "&which="
                + lEvent.which + "&modifiers=" + modifiers(lEvent)
                + "&mouseX=" + Math.round(lEvent.pageX) + "&mouseY=" + Math.round(lEvent.pageY);
        }
    },
    function (lEvent) { // "mousemove"
        if (ie4) {
            return "&x=" + lEvent.offsetX + "&y=" + lEvent.offsetY
                + "&mouseX=" + Math.round(lEvent.pageX) + "&mouseY=" + Math.round(lEvent.pageY);
        } else {
            return "&x=" + lEvent.offsetX + "&y=" + lEvent.offsetY
                + "&mouseX=" + Math.round(lEvent.pageX) + "&mouseY=" + Math.round(lEvent.pageY);
        }
    },
    function (lEvent) { // "mouseout"
        if (ie4) {
            return "&x=" + lEvent.offsetX + "&y=" + lEvent.offsetY;
        } else {
            return "&x=" + lEvent.layerX + "&y=" + lEvent.layerY;
        }
    },
    function (lEvent) { // "mouseover"
        if (ie4) {
            return "&x=" + lEvent.offsetX + "&y=" + lEvent.offsetY;
        } else {
            return "&x=" + lEvent.layerX + "&y=" + lEvent.layerY;
        }
    },
    function (lEvent) { // "mouseup",
        if (ie4) {
            return "&x=" + lEvent.offsetX + "&y=" + lEvent.offsetY + "&which="
                + lEvent.button + "&modifiers=" + modifiers(lEvent)
                + "&mouseX=" + Math.round(lEvent.pageX) + "&mouseY=" + Math.round(lEvent.pageY);
        } else {
            return "&x=" + lEvent.offsetX + "&y=" + lEvent.offsetY + "&which="
                + lEvent.which + "&modifiers=" + modifiers(lEvent)
                + "&mouseX=" + Math.round(lEvent.pageX) + "&mouseY=" + Math.round(lEvent.pageY);
        }
    },
    null, // "move",
    null, // "reset",
    null, // "resize",
    function (lEvent) { // "select"
        return "";
    },
    null, // "submit"
    null, // "unload"
    function (lEvent) { // "contextmenu"
        return "";
    },
    function (lEvent) { // "dragstart"
        return "";
    },
    function (lEvent) { // "dragend"
        return "";
    },
    function (lEvent) { // "dragover"
        if (lEvent.sourceId) {
            return "&obj=" + lEvent.sourceId + '&x=' + lEvent.offsetX + '&y=' + lEvent.offsetY;
        } else {
            return "";
        }
    },
    function (lEvent) { // "mouseenter"
        return '&x=' + Math.round(lEvent.offsetX) + '&y=' + Math.round(lEvent.offsetY) + "&modifiers=" + modifiers(lEvent);
    },
    function (lEvent) { // "mouseleave"
        return '&x=' + Math.round(lEvent.offsetX) + '&y=' + Math.round(lEvent.offsetY) + "&modifiers=" + modifiers(lEvent);
    }
);

function constructEventURL(lEvent) {
    var j;
    var eventName = null;

    for (j = 0; j < eventList.length; j++) {
        if (eventList[j] == lEvent.type) {
            eventName = lEvent.type;
            break;
        }
    }

    var url = "";

    if (eventName != null) {
        var eventFunction = eventGenerators[j];

        url += eventFunction(lEvent);
    }

    return url;
}

function SendPostRequest(eventParams, aSender, aCallback) {
    var xSubmitForm = PrepareSubmitter(aSender);

    var aURL = GURLBase + '/callback' + '?callback=' + aCallback;

    window.ChangedControls = "";

    xSubmitForm.eventParams = eventParams;
    xSubmitForm.action = aURL;
    logMessage('Ajax Submitting Form : ' + xSubmitForm);
    logMessage('Action : ' + xSubmitForm.action);
    logMessage('Elements: ' + xSubmitForm.childNodes.length);
    for (i = 0; i < xSubmitForm.childNodes.length; i++) {
        var xItem = xSubmitForm.childNodes.item(i);
        logMessage(xItem.name + ' = ' + xItem.value);
    }
    if (PreAsyncScript == true) {
        PreAsyncProgressScript();
    }
    if (typeof showCVFormLoading !== 'undefined' && !cvFormLoadingTimeOutId && (aCallback.indexOf('CheckSession') < 0)) {
        if ((aCallback.indexOf('DoOnClick') > -1)) {
            cvFormLoadingTimeOutId = showCVFormLoading(0);
        } else {
            cvFormLoadingTimeOutId = showCVFormLoading();
        }
    }
    var status = AjaxRequest.submit(
        xSubmitForm, {
        'onSuccess': function (req) {
            if (req.responseText.substring(0, 6) === '<html>') {
                var array = req.responseText.split('\n');
                var index = 0;
                triggerBeforeUnload = false;
                document.open();
                triggerBeforeUnload = true;
                for (index in array) {
                    if (index < array.length - 4) {
                        document.writeln(array[index]);
                    }
                }
                document.close();
            } else {
                var xmldoc;
                xmldoc = loadAjaxResponse(req.responseText);
                try {
                    processAjaxResponse(xmldoc);
                } catch (e) {
                    if (typeof hideCVFormLoading !== 'undefined') { hideCVFormLoading(cvFormLoadingTimeOutId); cvFormLoadingTimeOutId = 0; }
                    ErrorNotification(e, req);
                }
                if (PostAsyncScript == true) {
                    PostAsyncProgressScript();
                }
                //processEventQueue();
                window.eventProcessing = false;
            }
            if (typeof hideCVFormLoading !== 'undefined') { hideCVFormLoading(cvFormLoadingTimeOutId); cvFormLoadingTimeOutId = 0; }
        }
        , 'onError': function (req) {
            if (PostAsyncScript == true) {
                PostAsyncProgressScript();
            }
            window.eventProcessing = false;
            if (typeof hideCVFormLoading !== 'undefined') { hideCVFormLoading(cvFormLoadingTimeOutId); cvFormLoadingTimeOutId = 0; }
            if (req.responseText == "") {
                window.serverProblem = true;
            }
            logMessage('Ajax-Error!\nStatusText=' + req.statusText + '\nContents=' + req.responseText);
        }
    }
    );
    //restore old action
    // xSubmitForm.action = oldAction;

    return status;
}

window.serverProblem = false

window.ChangedControls = "";

window.eventProcessing = false;

function updateChangeEvent(componentName) {
    OnControlContentChange(componentName);
}

function containsName(controlName) {
    var indexOf = window.ChangedControls.indexOf(controlName + ",");
    return indexOf >= 0;
}

function AddChangedControl(controlName) {
    logMessage('changed control: ' + controlName);
    //No dupes, no empty strings
    if (!containsName(controlName) && (controlName > '')) {
        window.ChangedControls += controlName + ",";
        logMessage('changed control added: ' + controlName);
    }
}

function OnControlContentChange(event) {

    var xEvent;
    var xTarget;
    if (event.id) {
        //event is already the source element
        xTarget = event;
    } else {
        //event is a "event"
        xEvent = event ? event : window.event;
        xTarget = xEvent.srcElement ? xEvent.srcElement : xEvent.target;
    }
    while (xTarget.id == "") {
        if (ie4 || opera_browser) {
            xTarget = xTarget.parentElement;
        } else {
            xTarget = xTarget.parentNode;
        }
    }
    var xControlName = xTarget.id;
    if (xTarget.name) {
        xControlName = xTarget.name;
    }
    AddChangedControl(xControlName);
    //Radiogroups have a nested input control which carries the actual value
    if ((xTarget.attributes.type != null) && (xTarget.attributes.type.value == "RADIOGROUP")) {
        AddChangedControl(xControlName + "_INPUT");
    }
}

function processAjaxEvent(event, aSender, aCallback, aDirectSend, aSendControl, aAppend) {
    var lEvent = event ? event : window.event;

    var eventParams = "";
    if (lEvent) {
        eventParams = constructEventURL(lEvent);
    }

    executeAjaxEvent(eventParams, aSender, aCallback, aDirectSend, aSendControl, aAppend);
}

window.eventQueue = new Array();

window.lastEvent = null;

window.CV_ACTIVE_FORM_COUNT = 0;
window.lastActiveCount = 0;

function processEventQueue() {
    if (!window.lastActiveCount) {  // 0 == initial load
        window.lastActiveCount = CV_ACTIVE_FORM_COUNT;
    } else if (window.lastActiveCount != CV_ACTIVE_FORM_COUNT) { // open/close diralog or moved next form. when moved prev form, the count not change.
        //console.log("Dispose event queue: ");
        //console.log(eventQueue);
        eventQueue.length = 0;  // clear old form queue
        window.lastActiveCount = CV_ACTIVE_FORM_COUNT;
    }

    if (eventQueue.length > 0) {
        var f = window.eventQueue.shift();
        f();
    } else {
        window.lastEvent = null;
    }
}

var lastExitEventTime = 0;

function executeAjaxEvent(eventParams, aSender, aCallback, aDirectSend, aSendControl, aAppend) {
    logMessage("Process callback " + aCallback);
    if (aCallback.indexOf("_CANCEL.OnClick") === -1 && aCallback.indexOf("DoOnEnter") === -1) {
        CVPendingQueueProcess = false;
    }
    var obj = null;

    if (window.serverProblem) {
        return;
    }

    if (aCallback.indexOf("DoOnExit") > 0) {
        lastExitEventTime = new Date().getTime();
    }
    if (aCallback.indexOf("DoOnDblClick") > 0) {
        var dblClickTime = new Date().getTime();
        if ((dblClickTime - lastExitEventTime) <= 100) {
            return;
        }
    }

    if (!window.eventProcessing) {
        if (aDirectSend) {
            logMessage("Direct processing " + aCallback);
            window.eventProcessing = true;
            SendRequest(eventParams, aSender, aCallback, aSendControl, aAppend);
        } else {
            logMessage("Delayed processing " + aCallback);
            window.eventProcessing = true;

            obj = {
                method: function (eventParams, aSender, aCallback, aSendControl, aAppend) {
                    SendRequest(eventParams, aSender, aCallback, aSendControl, aAppend);
                }
            }
            window.eventQueue.push(delegate(obj, obj.method, eventParams, aSender, aCallback, aSendControl, aAppend));
            //window.setTimeout(delegate(obj, obj.method, eventParams, aSender, aCallback, aSendControl, aAppend), 10);
        }
    } else {
        obj = {
            method: function (eventParams, aSender, aCallback, aSendControl, aAppend) {
                SendRequest(eventParams, aSender, aCallback, aSendControl, aAppend);
            }
        }

        logMessage("Event queue length " + eventQueue.length);
        logMessage("Append callback " + aCallback);
        window.eventQueue.push(delegate(obj, obj.method, eventParams, aSender, aCallback, aSendControl, aAppend));
    }
}


function ErrorNotification(e, req) {
    if (typeof isTransMode === 'undefined' || isTransMode === false) {
        WriteLog(e, req);
        if (document.getElementById("EMessageSpan") != null) {
            $("#EMessageSpan").html("");
            $("#EMessageSpan").html(e);
            setTimeout(function () {
                $("#jsErrorNote").fadeIn("slow");
            }, 3000);
            setTimeout(function () {
                $("#jsErrorNote").fadeOut("slow");
            }, 5000);
        }
    }
    throw e;
}

function WriteLog(e, req) {
    var query = GURLBase + '/?JSERROR_LOG';
    var postData = {
        "evaluatedCode": evaluated_script,
        "errorMsg": e,
        "queryString": req.url
    };
    $.post(query, postData);
}

function SendRequest(eventParams, aSender, aCallback, aSendControl, aAppend) {
    try {
        if (aAppend || window.lastEvent == null || window.eventQueue.length == 0 || window.lastEvent != aCallback) {
            window.lastEvent = aCallback;
            logMessage("Processing " + aCallback);

            if (aSender != null) {
                AddChangedControl(aSender.id);
            }

            if (window.ChangedControls.length == 0) {
                //handle GET
                logMessage('Performing AJAX Get ...');
                var aURL;

                if (aSendControl && aSender != null) {
                    aURL = GURLBase + '/callback' + '?callback=' + aCallback + '&' + aSender.name + '=' + aSender.value;
                } else {
                    aURL = GURLBase + '/callback' + '?callback=' + aCallback;
                }

                //aURL = aURL + eventParams;


                if (typeof showCVFormLoading !== 'undefined' && !cvFormLoadingTimeOutId && (aCallback.indexOf('CheckSession') < 0)) {
                    if ((aCallback.indexOf('DoOnClick') > -1)) {
                        cvFormLoadingTimeOutId = showCVFormLoading(0);
                    } else {
                        cvFormLoadingTimeOutId = showCVFormLoading();
                    }
                }
                //AjaxRequest.get(
                AjaxRequest.post(
                    {
                        'url': aURL
                        , 'onSuccess': function (req) {
                            var xmldoc;
                            xmldoc = loadAjaxResponse(req.responseText);
                            try {
                                processAjaxResponse(xmldoc);
                            } catch (e) {
                                if (typeof hideCVFormLoading !== 'undefined') { hideCVFormLoading(cvFormLoadingTimeOutId); cvFormLoadingTimeOutId = 0; }
                                ErrorNotification(e, req);
                            }
                            //processEventQueue();
                            window.eventProcessing = false;
                            if (typeof hideCVFormLoading !== 'undefined') { hideCVFormLoading(cvFormLoadingTimeOutId); cvFormLoadingTimeOutId = 0; }
                        }
                        , 'onError': function (req) {
                            window.eventProcessing = false;
                            if (typeof hideCVFormLoading !== 'undefined') { hideCVFormLoading(cvFormLoadingTimeOutId); cvFormLoadingTimeOutId = 0; }
                            if (req.responseText == "") {
                                window.serverProblem = true;
                            }
                            logMessage('Callback Error!\nStatusText=' + req.statusText + '\nContents=' + req.responseText);
                        }
                    }, eventParams
                );
            } else {
                //handle  POST
                logMessage('Performing AJAX Post ...');
                return SendPostRequest(eventParams, aSender, aCallback);
            }
        } else {
            logMessage("Ignore callback " + aCallback);
            //processEventQueue();
        }
    }
    catch (e) {
        logMessage('Exception in function SendRequest(): ' + e)
    }
}

// IW Objects
// This file has methods to read/write to objects and parse XML responses
// Merge this with Ajax.js later on

// IE
function isIE() {
    if (!window.ActiveXObject) {
        if (!document.documentMode) {
            return false;
        }
    }
    return true;
}

function loadAjaxResponse(aResponse) {
    xXmlDoc = (new DOMParser()).parseFromString(aResponse, "text/xml");
    return xXmlDoc;
}

function processAjaxResponse(aXmlDoc) {
    var xSubmitForm = getSubmitForm();
    var xData = aXmlDoc.getElementsByTagName("response");

    if (xData == null || xData.length != 1) {
        return;
    }

    // Set track ID for next submit
    var xPartaialUpdateScriptFilesTag = aXmlDoc.getElementsByTagName("scriptfiles");
    if (xPartaialUpdateScriptFilesTag.length > 0 && xPartaialUpdateScriptFilesTag[0] != null) {
        processAjaxPartialUpdateScriptFiles(xPartaialUpdateScriptFilesTag[0].childNodes);
    }

    var xPartaialUpdateTag = aXmlDoc.getElementsByTagName("partialupdate");
    processAjaxPartialUpdate(xPartaialUpdateTag);

    var xTrackID = aXmlDoc.getElementsByTagName("submit");
    if (xTrackID.length > 0 && xSubmitForm != null) {
        xSubmitForm.action = xTrackID[0].lastChild.nodeValue;
    }

    var xUpdate = aXmlDoc.getElementsByTagName("update");
    if (xUpdate.length > 0) {
        processAjaxUpdate(xUpdate[0].childNodes);
    }
    var xExecute = aXmlDoc.getElementsByTagName("execute");
    if (xExecute.length > 0) {
        processAjaxExecute(xExecute[0].childNodes);
    }
}

function processAjaxPartialUpdateScriptFiles(aPartialUpdateElements) {
    if (aPartialUpdateElements) {
        for (var i = 0; i < aPartialUpdateElements.length; i++) {
            var xElement = aPartialUpdateElements[i];
            if (xElement.nodeType != 1) {
                continue;
            }
            var script = document.createElement('script');
            script.setAttribute('type', 'text/javascript');
            script.text = xElement.textContent;
            document.head.appendChild(script);
            eval(xElement.textContent);
        }
    }
}

function processAjaxPartialUpdate(aPartialUpdateElements) {
    for (var i = 0; i < aPartialUpdateElements.length; i++) {
        var xElement = aPartialUpdateElements[i];
        if (xElement.nodeType != 1) {
            continue;
        }
        processComponentElement(xElement);
        // Calls methods to update based on properties read
    }
}

tempDoc = document.implementation.createHTMLDocument('temp');

function processComponentElement(xElement) {
    var updateMode;
    var parent;
    var removelist = [];
    var addlist = [];
    var components = xElement.getElementsByTagName('component');
    for (var i = 0; i < components.length; i++) {
        var xElement = components[i];
        if (xElement.nodeType != 1) {
            continue;
        }
        if (xElement.getAttribute('updatemode') === 'Add') {
            addlist.push(xElement);
        } else {
            removelist.push(xElement);
        }
    }
    for (var i = 0; i < removelist.length; i++) {
        var xElement = removelist[i];
        var id = xElement.getAttribute('id');
        var htmlEle = document.getElementById(id);
        if (htmlEle) {
            htmlEle.parentElement.removeChild(htmlEle);
        } else {
            //throw "remove Element "+id+" not found";
        }
    }
    // loop the addlist in case parent element is added after than current
    var addedFlag = true;
    while (addedFlag) {
        addedFlag = false;
        var errList = [];
        for (var i = 0; i < addlist.length; i++) {
            var xElement = addlist[i];
            var parentId = xElement.getAttribute('parent');
            var htmlEle = document.getElementById(parentId);
            var innerHtml;
            if (htmlEle) {
                addedFlag = true;
                tempDoc.body.innerHTML = xElement.getElementsByTagName('innerhtml')[0].textContent;
                for (var j = 0; j < tempDoc.body.children.length;) {
                    var newEle = tempDoc.body.removeChild(tempDoc.body.children[j]);
                    htmlEle.appendChild(newEle);
                }
            } else {
                errList.push(xElement);
            }
        }
        addlist = errList;
    }
    //  if (errList.length > 0) {
    //    for (var i = 0; i < errList.length; i++) {
    //      var parentId = errList[i].getAttribute('parent');
    //      throw "Parent Element "+parentId+" not found";
    //    }
    //  }
}

function processAjaxUpdate(aUpdateElements) {
    var cnt = aUpdateElements.length;
    for (var i = 0; i < cnt; i++) {
        var xElement = aUpdateElements[i];
        if (xElement.nodeType != 1) {
            continue;
        }

        processNodeElement(xElement);
        // Calls methods to update based on properties read
    }
}

//for error logs
var evaluated_script = "";

function processAjaxExecute(aExecuteElements) {
    var cnt = aExecuteElements.length;
    for (var i = 0; i < cnt; i++) {
        var xElement = aExecuteElements[i];
        if (xElement.nodeType != 1) {
            continue;
        }
        // In Mozilla nodeValue is empty.
        //eval(xElement.text);
        // so we call lastChild, works in IE also
        evaluated_script = xElement.lastChild.nodeValue;
        evaluated_script = evaluated_script.replace(/]]\\>/g, ']]>');
        eval(evaluated_script);
    }
}

// Iterates children of nodes and updates controls
// Note that to avoid mapping of Delphi -> JS, we use the
// delphi name in the XML node and update the appropriate
// value via JS
function processNodeElement(aElement) {
    var xID = aElement.getAttribute("id").toUpperCase();
    var xType = aElement.getAttribute("type").toUpperCase();
    if (xID != null) {
        var xObject = IWTop().FindElem(xID);

        if (xObject != null) {
            var aElmChildNodes = aElement.childNodes;
            var cntAElmChildNodes = aElmChildNodes.length;
            for (var i = 0; i < cntAElmChildNodes; i++) {
                var aElmChildNode = aElmChildNodes[i];
                if (aElmChildNode.nodeType != 1) {
                    continue;
                }
                var xPropName = aElmChildNode.nodeName;

                var aElmChildNodeNodes = aElmChildNode.childNodes;
                var cntAElmChildNodeNodes = aElmChildNodeNodes.length;
                if (cntAElmChildNodeNodes > 0) {
                    // Get *all* childs. Easier would be  aElement.childNodes[i].textValue but IE doesn't like that
                    var xPropValue = '';
                    for (var n = 0; n < cntAElmChildNodeNodes; n++) {
                        xPropValue += aElmChildNodeNodes[n].nodeValue;
                    }
                } else {
                    var xPropValue = null;
                }

                // This allows control content to be set to an empty string
                if (xPropValue == null) {
                    xPropValue = '';
                }

                if (xPropName == "text" || xPropName == "caption") {
                    // one day I'll make sense of why I have to pass lastChild instead of just nodeValue
                    // Only one reason: nodeValue is empty while lastChild is of type Text and it contains the text.

                    // we need to handle a lot here...See what type of control it is, how to add
                    // remove, etc.
                    if (xType == "IWEDITASLABEL") {
                        var xControl = IWTop().FindElem(xID);
                        xControl.innerHTML = xPropValue.replace(/ /gi, "\u00a0");
                    }

                    if (xType == "IWCHECKBOX") {
                        var xControl = IWTop().FindElem(xID + "_CHKBCAPTION");
                        xControl.innerHTML = xPropValue.replace(/ /gi, "\u00a0");;
                    }

                    else if (xType == "IWRADIOBUTTON") {
                        var xControl = IWTop().FindElem(xID + "_CAPTRADIOBUTTON");
                        xControl.innerHTML = xPropValue.replace(/ /gi, "\u00a0");;
                    }
                    else {
                        xObject.value = xPropValue;
                    }
                } else if (xPropName.toLowerCase() == "innerhtml") {
                    if (!containsName(xID)) {
                        if (xObject.innerHTML != xPropValue) {
                            xObject.innerHTML = xPropValue.replace(/&amp;nbsp;/gi, "\u00a0");
                        }
                    }
                } else if (xPropName == "textcontent") {
                    if (!containsName(xID)) {
                        //Firefox
                        if (xObject.textContent) {
                            if (xObject.textContent != xPropValue) {
                                xObject.textContent = xPropValue;
                            }
                        }
                        //IE
                        if (xObject.innerText) {
                            if (xObject.innerText != xPropValue) {
                                xObject.innerText = xPropValue;
                            }
                        }
                    }
                } else if (xPropName == "css") {
                    xObject.className = xPropValue;
                    /* Style Sheet stuff */
                } else if (xPropName == "style") {
                    //var xItemsNode = aElement.childNodes[i];
                    var xItemsNode = aElmChildNode;
                    var cntXItemsNodes = xItemsNode.childNodes.length;
                    for (var ii = 0; ii < cntXItemsNodes; ii++) {
                        var xItemNode = xItemsNode.childNodes[ii];
                        if (xItemNode.nodeType != 1) {
                            continue;
                        }
                        if (xItemNode.nodeName == "attribute") {
                            var xPropertyName = xItemNode.getAttribute("name");
                            var xPropertyValue;

                            if (xItemNode.lastChild != null) {
                                xPropertyValue = xItemNode.lastChild.nodeValue;
                            } else {
                                xPropertyValue = "";
                            }
                            if (xObject.style != null) {
                                if (!window.jQuery) {
                                    eval("xObject.style." + xPropertyName + "=\"" + xPropertyValue + "\"");
                                } else {
                                    $(xObject).css(xPropertyName, xPropertyValue);
                                }
                            }
                        }
                    }
                } else if (xPropName == "enabled") {
                    if (xPropValue == "true") {
                        if (xType == "IWCHECKBOX") {
                            var xControl = IWTop().FindElem(xID + "_CHECKBOX");
                            xControl.removeAttribute("disabled");
                        } else {
                            xObject.disabled = false;
                        }
                    } else {
                        if (xType == "IWCHECKBOX") {
                            var xControl = IWTop().FindElem(xID + "_CHECKBOX");
                            xControl.setAttribute("disabled", "true");
                        } else {
                            xObject.disabled = true;
                        }

                    }
                } else if (xPropName == "readonly") {
                    if (xPropValue == "true") {
                        xObject.readOnly = true;
                    } else {
                        xObject.readOnly = false;
                    }
                } else if (xPropName == "maxlength") {
                    //In Delphi MaxLength=0 means unlimited.
                    if (xPropValue == 0) { xPropValue = 2147483647 } //maxint
                    //To allow zero MaxLength and to keep Delphi backward compatibility we map -1 to zero
                    else if (xPropValue == -1) { xPropValue = 0 };
                    xObject.maxLength = xPropValue;
                } else if (xPropName == "hint") {
                    logMessage("hint needs to be implemented to perform update");
                } else if (xPropName == "src") {
                    xObject.src = xPropValue;
                } else if (xPropName == "checked") {
                    if (xType == "IWCHECKBOX") {
                        var xControl = IWTop().FindElem(xID + "_CHECKBOX");
                        xPropValue = xPropValue == "true";

                        if (xControl.checked != xPropValue) {
                            xControl.checked = xPropValue;
                        }
                    }
                    if (xType == "IWRADIOBUTTON") {
                        var xControl = IWTop().FindElem(xID + "_INPUT");
                        xPropValue = xPropValue == "true";

                        if (xControl.checked != xPropValue) {
                            xControl.checked = xPropValue;
                        }
                    }
                } else if (xPropName == "select_type") {
                    if (xType == "IWLISTBOX") {
                        if (ie4 || opera_browser) {
                            // alert(xPropValue + ":" + xObject.multiple);
                            xObject.multiple = !(xPropValue == "select-one");
                        } else {
                            if (xPropValue == "select-one") {
                                xObject.removeAttribute("multiple");
                            } else {
                                xObject.setAttribute("multiple", "");
                            }
                        }
                    }
                } else if (xPropName == "items") {
                    if (xType == "IWLISTBOX" || xType == "IWCOMBOBOX" || xType == "IWRADIOGROUP") {
                        while (xObject.childNodes.length > 0) {
                            xObject.removeChild(xObject.childNodes[0]);
                        }

                        var xItemsNode = aElement.childNodes[i];
                        var xSelected = null;

                        for (var ii = 0; ii < xItemsNode.childNodes.length; ii++) {
                            if (xItemsNode.childNodes[ii].nodeType != 1) {
                                continue;
                            }
                            var xItemNode = xItemsNode.childNodes[ii];
                            var xIsSelected = xItemNode.getAttribute("selected");
                            var xItemValue = xItemNode.getAttribute("value");
                            var xItemText = null;

                            if (xItemNode.lastChild != null) {
                                xItemText = xItemNode.lastChild.nodeValue;
                            } else {
                                xItemText = "";
                            }

                            if (xType == "IWLISTBOX" || xType == "IWCOMBOBOX") {
                                if (ie4 || opera_browser) {
                                    var oOption = document.createElement("OPTION");
                                    oOption.text = xItemText;
                                    oOption.value = xItemValue;
                                    if (xIsSelected != null) {
                                        if (xSelected == null) {
                                            xSelected = oOption;
                                        } else {
                                            if (!(xSelected instanceof Array)) {
                                                xSelected = new Array(xSelected);
                                            }
                                            xSelected.push(oOption);
                                        }
                                    }
                                    xObject.add(oOption);
                                } else {
                                    // xObject.appendChild(new Option(xItemText, xItemValue, false, xIsSelected != null));
                                    var oOption = document.createElement("OPTION");
                                    // this fixes a issue in async updates where all whitespaces were ignored
                                    xItemText = xItemText.replace(/ /gi, "\u00a0");
                                    oOption.text = xItemText;
                                    oOption.value = xItemValue;
                                    oOption.selected = xIsSelected != null;
                                    xObject.appendChild(oOption);
                                }
                            } else if (xType == "IWRADIOGROUP") {
                                var xVerticalLayout = aElement.getAttribute("layout").toLowerCase() == "vertical";

                                if (ie4 || opera_browser) {
                                    //Todo: does not work with opera
                                    var element = "<input type='radio' name='" + xID + "_INPUT' "
                                        + "value='" + xItemValue + "' " + (xIsSelected != null ? "CHECKED " : "")
                                        + "id='" + xID + "_INPUT_" + ii + "'>";
                                    logMessage('create element ' + element);
                                    var xRadioInput = document.createElement(element);
                                    element = "<span onclick=\"FindElem('" + xID + "_INPUT_" + ii + "').checked = true;\"/>";
                                    var xSpan = document.createElement(element);
                                    xObject.appendChild(xRadioInput);
                                    xSpan.innerHTML = xItemText.replace(/ /gi, "\u00a0");
                                    xObject.appendChild(xSpan);
                                } else {
                                    var xRadioInput = document.createElement("input");
                                    xRadioInput.name = xID + "_INPUT";
                                    xRadioInput.id = xID + "_INPUT_" + ii;
                                    xRadioInput.type = "radio";
                                    xRadioInput.value = xItemValue;
                                    xRadioInput.checked = xIsSelected != null;
                                    xObject.appendChild(xRadioInput);

                                    var xSpan = document.createElement("span");
                                    xSpan.setAttribute("OnClick", "FindElem('" + xID + "_INPUT_" + ii + "').checked = true;");
                                    xSpan.innerHTML = xItemText.replace(/ /gi, "\u00a0");
                                    xObject.appendChild(xSpan);
                                }
                                if (xVerticalLayout) {
                                    xObject.appendChild(document.createElement("BR"));
                                }
                            }
                        }

                        if (xSelected != null) {
                            var obj = {
                                method: function (xSelected) {
                                    if (xSelected instanceof Array) {
                                        while (xSelected.length > 0) {
                                            xSelected.shift().selected = true;
                                        }
                                    } else {
                                        xSelected.selected = true;
                                    }
                                    //alert(xSelected.value);
                                }
                            }

                            window.setTimeout(delegate(obj, obj.method, xSelected), 1);
                        }
                    }
                }
            }
        }
    }
}

function setObjectDisabled(aObject, aDisabled) {
    var xObj = IWTop().FindElem(aObject);
    xObj.disabled = aDisabled;
}

function setObjectReadOnly(aObject, aReadOnly) {
    var xObj = IWTop().FindElem(aObject);
    xObj.readOnly = aReadOnly;
}

function setObjectVisibility(aObject, aVisible) {
    var xObj = IWTop().FindElem(aObject);
    if (aVisible) {
        //Do not use 'visible', that would make controls visible even if their parent is hidden.
        xObj.style.visibility = 'inherit';
    } else {
        xObj.style.visibility = 'hidden';
    }
}

function moveObjectTo(aObject, aX, aY, aZ) {
    var xObj = IWTop().FindElem(aObject);
    xObj.style.left = aX;
    xObj.style.top = aY;
    if (aZ != -1) {
        xObj.style.zIndex = aZ;
    }
}

function addItemListBox(aListBox, aItemText, aItemValue) {
    var xObj = IWTop().FindElem(aListBox);
    var xElem = document.createElement("option");

    xElem.text = aItemText;
    xElem.value = aItemValue;
    xObj.appendChild(xElem);
}

function IWTimer(enabled, interval, callback) {
    this.interval = interval;
    this.enabled = enabled;
    this.callback = callback;

    this.startTimer = function () {
        this.enabled = true;
        setTimeout(delegate(this.timeout, this.timeout.method, this), this.interval);
    };

    this.stopTimer = function () {
        this.enabled = false;
    };

    this.timeout = {
        method: function (timer) {
            // Added to prevent IWTimer Async events from stacking up in browser MRC per D.Rueter
            timer.enabled = false;
            executeAjaxEvent("", null, timer.callback, true);
            if (timer.enabled) {
                setTimeout(delegate(timer.timeout, timer.timeout.method, timer), timer.interval);
            }
        }
    };

    if (enabled) this.startTimer();
}

function checkBoxClick(event, checkbox) {
    var controlName = checkbox + "_CHECKBOX";
    AddChangedControl(controlName);

    FindElem(controlName).checked = !FindElem(controlName).checked;
    FindElem(checkbox).onclick(event);
}
function pageOnLoad() {
    var submitForm = getSubmitForm();
    oldSubmit = submitForm.submit;
    submitForm.submit = function () {
        if (typeof showCVFormLoading !== 'undefined') cvFormLoadingTimeOutId = showCVFormLoading();
        triggerBeforeUnload = false;
        /**var obj = {
        method:oldSubmit
        };
        var delegateFunction = delegate(submitForm, obj.method);
        window.eventQueue.splice(0,window.eventQueue.length);
        window.eventQueue.push(delegateFunction);
        };**/
        FormSubmitMode = true;
    }
}
/**--------------------------------NEW QUEUE PROCESSING MECHANISM-------------------------------------**/

var XHRObjects = new Array();

function IsAjaxPending() {
    var Result = false;
    for (var i = 0; i < XHRObjects.length; i++) {
        if (XHRObjects[i].readyState !== 0) {
            if (XHRObjects[i].readyState !== 4) {
                logMessage(' is ongoing ready state = ' + XHRObjects[i].readyState);
                Result = true;
                return Result;
            }
        }
    }
    return Result;
};
var FormSubmitMode = false;
var FormSubmitted = false;
var CVPendingQueueProcess = false;
var QueueProcessor = window.setInterval(function () {
    if (CVPendingQueueProcess) return;
    if (!FormSubmitMode || window.eventQueue.length !== 0) {
        if (FormSubmitMode) {
            executeAjaxEvent = function () { };
        }
        if (!IsAjaxPending()) {
            processEventQueue();
        }
    } else {
        if (!IsAjaxPending()) {
            if (!FormSubmitted) {
                //XMLHttpRequest.prototype.send = function(){};
                //window.eventQueue.splice(0,window.eventQueue.length);
                //XHRObjects.splice(0,XHRObjects.length);
                oldSubmit.call(getSubmitForm());
                FormSubmitted = true;
            }
        }
    }
}, 1);
