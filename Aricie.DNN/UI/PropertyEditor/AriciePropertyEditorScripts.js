﻿/// <reference name="MicrosoftAjax.js"/>

Type.registerNamespace('Aricie.DNN.AriciePropertyEditorScripts');
var AriciePropertyEditorScripts;

Aricie.DNN.AriciePropertyEditorScripts = function (element) {
    Aricie.DNN.AriciePropertyEditorScripts.initializeBase(this, [element]);

    AriciePropertyEditorScripts = this;
    this._clientId = null;
    //this._hash = null;
};
Aricie.DNN.AriciePropertyEditorScripts.prototype = {

    initialize: function () {
        Aricie.DNN.AriciePropertyEditorScripts.callBaseMethod(this, 'initialize');
        initialisePropertyEditorsScripts();
    },

    dispose: function () {
        Aricie.DNN.AriciePropertyEditorScripts.callBaseMethod(this, 'dispose');
    },

    // ClientId
    get_clientId: function () {
        return this._clientId;
    },

    set_clientId: function (value) {
        if (this._clientId !== value) {
            this._clientId = value;
            this.raisePropertyChanged('clientId');
        }
    },

    // Hash
    //get_hash: function () {
    //    return this._hash;
    //},

    //set_hash: function (value) {
    //    if (this._hash !== value) {
    //        this._hash = value;
    //        this.raisePropertyChanged('hash');
    //    }
    //}
};

function initialisePropertyEditorsScripts() {

    initJSON();
    var selector;
    var cookieAccName;
    var cookieTabName;

    // accordion
    selector = ".aricie_pe_accordion" + "-" + AriciePropertyEditorScripts.get_clientId();
    //cookieAccName = 'cookieAccordion' + AriciePropertyEditorScripts.get_clientId() + AriciePropertyEditorScripts.get_hash();
    cookieAccName = 'cookieAccordion';

    // on fait l'évaluation du noeud un minimum
    var selectedNodes = jQuery(selector);
    if (selectedNodes.length > 0) {
        jQuery.each(selectedNodes, function (i, selectedNodeDom) {
            var selectedNode = jQuery(selectedNodeDom);
          var accordionPath = selectedNode.data('entitypath');
          var cookieVal = getAdvanceVariableValue(accordionPath + "-" + cookieAccName); 
            if (cookieVal == undefined || cookieVal === -1) { 
                cookieVal = false;
            } else {
                cookieVal = parseInt(cookieVal);
            }
            selectedNode.accordion(
            {
                active: cookieVal,
                heightStyle: "content",
                clearStyle: true,
                autoHeight: false,
                collapsible: true
            });

            jQuery('> h3.ui-accordion-header>a', selectedNode).click(function () {
                var h3 = jQuery(this).parent();
                var index = h3.parent().children('h3.ui-accordion-header').index(h3);
                var cookieVal = getAdvanceVariableValue(accordionPath + "-" + cookieAccName); //eval(jQuery.cookie(cookieAccName));

                if (cookieVal === index) {

                    setAdvanceVariableValue(accordionPath + "-" + cookieAccName, null);
                } else {

                    setAdvanceVariableValue(accordionPath + "-" + cookieAccName, index);
                }
            });

            jQuery.each(jQuery(" > h3", selectedNode), function (i, h3) {
                jQuery.each(jQuery(h3).data("events") || jQuery._data(h3, "events"), function (j, event) {
                    jQuery.each(event, function (k, h) {
                        if (h.type === 'click') {
                            jQuery(h3).unbind(h.type, h.handler);
                            jQuery(h3).children("a").click(function () {
                                jQuery(this).parent().bind(h.type, h.handler);
                                jQuery(this).parent().triggerHandler(h.type);
                                jQuery(this).parent().unbind(h.type, h.handler);
                            });
                        }
                    });
                });
            });

        });
    }

    // tabs
    selector = ".aricie_pe_tabs-" + AriciePropertyEditorScripts.get_clientId();
    //cookieTabName = 'cookieTab' + AriciePropertyEditorScripts.get_clientId() + AriciePropertyEditorScripts.get_hash();
    cookieTabName = 'cookieTab';
    var tabsItemCt = jQuery(selector);
    if (tabsItemCt.length > 0) {
        jQuery.each(tabsItemCt, function (i, tabItem) {
            var selectedNode = jQuery(tabItem);

            var tabPath = selectedNode.data('entitypath');
            
            var localCookieTabName = tabPath + "-" + cookieTabName;
            selectedNode.tabs({
                select: function (event, ui) {
                    setAdvanceVariableValue(localCookieTabName, ui.index); 
                    var resultat = performASPNetValidation();
                    return resultat;
                },
                activate: function (e, ui) {
                    var currentIndex = ui.newTab.parent().find("li").index(ui.newTab);
                    setAdvanceVariableValue(localCookieTabName, currentIndex); 
                    var resultat = performASPNetValidation();
                    return resultat;
                },
                active: (parseInt(getAdvanceVariableValue(localCookieTabName)) || 0),
                selected: (parseInt(getAdvanceVariableValue(localCookieTabName)) || 0)
            });
        });
        
        }
    
}
function initJSON() {
    window.JSON = JSON || {};

    // implement JSON.stringify serialization
    JSON.stringify = JSON.stringify || function (obj) {

        var t = typeof (obj);
        if (t !== "object" || obj === null) {

            // simple data type
            if (t === "string") { obj = '"' + obj + '"'; }
            return String(obj);

        } else {

            // recurse array or object
            var n, v, json = [], arr = (obj && obj.constructor == Array);

            for (n in obj) {
                v = obj[n]; t = typeof (v);

                if (t === "string") {
                    v = '"' + v + '"';
                } else {
                    if (t == "object" && v !== null) {
                        v = JSON.stringify(v);
                    }
                }

                json.push((arr ? "" : '"' + n + '":') + String(v));
            }

            return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
        }
    };

    // implement JSON.parse de-serialization
    JSON.parse = JSON.parse || function (str) {
        if (str === "") {
            str = '""';
        }
        eval("var p=" + str + ";");
        return p;
    };
}
function getAdvanceVariableValue(key) {
    var toReturn = "";
    var Adv = dnn.getVar("AdvVar");
    var AdvObj;
    if (Adv != undefined) {

        if (JSON) {
            AdvObj = JSON.parse(Adv);
        } else {
            AdvObj = eval(Adv);
        }
        if (AdvObj != undefined) {
            toReturn = AdvObj[key];
        }
    }
    return toReturn;
}
function setAdvanceVariableValue(key, value) {
    var Adv = dnn.getVar("AdvVar");
    var AdvObj;
    if (Adv != undefined) {
        if (JSON) {
            AdvObj = JSON.parse(Adv);
        } else {
            AdvObj = eval(Adv);
        }
    } else {
        AdvObj = {};
    }
    AdvObj[key] = value;
    Adv = JSON.stringify(AdvObj);
    dnn.setVar("AdvVar", Adv);
}
function performASPNetValidation() {
    if (typeof Page_ClientValidate === "function") {
        var validated = Page_ClientValidate();
        return validated;
    }
    return true;
}


function SelectAndActivateParentHeader(src) {
    var targetItem = jQuery(src).parent().parent().find(">a");
    targetItem.attr('onclick', '');
    targetItem.click();
    //return false;
    window.location.hash = targetItem.attr("href");
}

// Register the class as a type that inherits from Sys.UI.Control.
Aricie.DNN.AriciePropertyEditorScripts.registerClass('Aricie.DNN.AriciePropertyEditorScripts', Sys.UI.Control);

if (typeof (Sys) !== 'undefined') { Sys.Application.notifyScriptLoaded(); }