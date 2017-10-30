sap.ui.define([
    "sap/ui/core/util/MockServer"
], function (MockServer) {
    "use strict";
    return {
        init: function () {
            // create MockServer
            var oMockServer = new MockServer({
                rootUri: "/ScenarioMod/DataSet/"
            });
            var oUriParameters = jQuery.sap.getUriParameters();

            // configure mock server with a delay
            MockServer.config({
                autoRespond: true,
                autoRespondAfter: oUriParameters.get("serverDelay") || 1000
            });

            // simulate
            var sPath = jQuery.sap.getModulePath("ScenarioMod.localService");
            oMockServer.simulate(sPath + "/metadata.xml", sPath + "/mockdata");

            // handle suggest in input fields (OData search query)
            // oMockServer.attachAfter(sap.ui.core.util.MockServer.HTTPMETHOD.GET, function(oEvent) {
            //     var oXhr = oEvent.getParameter("oXhr");
            //     var aResultFiltered = [];
            //     var fGetUriParameter = function(sUri, sKey) {
            //         var sValue = "";
            //         var aParams = decodeURIComponent(sUri).replace("?", "&").split("&");
            //         aParams.some(function(sPairs) {
            //             if (sKey === sPairs.split("=")[0]) {
            //                 sValue = sPairs.split("=")[1];
            //                 return true;
            //             }
            //         });
            //         return sValue;
            //     };
            //     var sSearchText = fGetUriParameter(oXhr.url, "search");
            //     if (sSearchText) {
            //         var aResults = oEvent.getParameter("oFilteredData").results;
            //         aResults.forEach(function(oEntry) {
            //             if (JSON.stringify(oEntry).indexOf(sSearchText) > -1) {
            //                 aResultFiltered.push(oEntry);
            //             }
            //         });
            //         oEvent.getParameter("oFilteredData").results = aResultFiltered;
            //     }
            // });

            // start
            oMockServer.start();
        }
    };

});
