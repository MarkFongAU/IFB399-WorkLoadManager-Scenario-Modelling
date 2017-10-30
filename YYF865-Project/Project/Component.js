/**
 * Controller of the Components
 *
 * Author: Mark (YeeChen Fong)
 */
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel",
    "sap/viz/ui5/format/ChartFormatter",
    "sap/viz/ui5/api/env/Format",
	"sap/ui/Device"
], function (UIComponent, JSONModel, ResourceModel, ChartFormatter, Format, Device) {
	"use strict";

	return UIComponent.extend("ScenarioMod.Component", {
		metadata: {
			manifest: "json"
			//root View: "sap.ui.scemod.view.App"
		},
		init: function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

            // Set Data Model to be used in all views
            var oModel = new JSONModel();
            oModel.setData({
                // inputParameters : {
                //     value1 : "",
                //     value2 : "",
                //     value3 : "",
                //     value4 : "",
                //     value5 : ""
                // }
            });
            this.setModel(oModel, "component");
            // var oModel = new sap.ui.model.odata.ODataModel("proxy/http/services.odata.org/Northwind/Northwind.svc");
            // sap.ui.getCore().setModel(oModel);
            // var oText = new sap.ui.commons.TextView("l1", {text: "{CompanyName}"});
            // oText.bindElement("/Customers('ALFKI')");
            // oText.placeAt("content");


            // disable batch grouping for v2 API of the northwind service, loads faster
            // this.getModel("parameters").setUseBatch(false);

            // set device model
			var oDeviceModel = new JSONModel(Device);
			oDeviceModel.setDefaultBindingMode("TwoWay");
			this.setModel(oDeviceModel, "device");

			// set Options Dialog
			//this._optionsDialog = new Dialog(this.getRootControl());
			//this._optionsDialog = new Dialog(this.getAggregation("rootControl"));

            // create the views based on the url/hash
			this.getRouter().initialize();
		},

        // Render the Options Dialog for the Parameters List
        // openOptionsDialog : function () {
			// this._optionsDialog.open();
        // },
		
		// Render display based on Content Density
		getContentDensityClass : function() {
			if (!this._sContentDensityClass) {
				if (!sap.ui.Device.support.touch) {
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		}
	});
});
