/**
 * Controller of the Metrics List Division
 *
 * Author: Frank (PengYuan Ge)
 */
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel'
], function(jQuery, Controller, JSONModel) {
	"use strict";
	return Controller.extend("ScenarioMod.controller.MetricsList", {
		onInit: function () {
            // set Metrics model on this Controller
            var oModel = new JSONModel(jQuery.sap.getModulePath("ScenarioMod.localService.mockdata", "/Metrics.json"));
            this.getView().setModel(oModel);
		},
        onPress:function(oEvent) {
            // Alternative to "var selectedMetricID = oEvent.getSource().mProperties.number;"
            var selectedMetricID = oEvent.getSource().getBindingContext().getObject().METRICS_ID;
            console.log("Clicked here", selectedMetricID);

            var completedChart = sap.ui.getCore().byId("__xmlview0--visualisation--vizChart").byId("columnChartCompleted");
            var overdueChart = sap.ui.getCore().byId("__xmlview0--visualisation--vizChart").byId("columnChartOverdue");
            if(selectedMetricID == 1){ // Completed Items
                if(overdueChart.getVisible()) {
                    overdueChart.setVisible(false);
                    console.log("overdueChart hide", selectedMetricID);
                }
                completedChart.setVisible(true);
            } else if (selectedMetricID == 2) { // Overdue Items
                if(completedChart.getVisible()) {
                    completedChart.setVisible(false);
                    console.log("completedChart hide", selectedMetricID);
                }
                overdueChart.setVisible(true);
            }
        }
	});
});
