/**
 * Controller of the Scenario Modelling Application
 *
 * Author: Mark (YeeChen Fong)
 */
sap.ui.define([ 
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel"
] , function(Controller, MessageToast, JSONModel, ResourceModel) {
	"use strict";
	return Controller.extend("ScenarioMod.controller.App", {
        onInit: function () {
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        }
	});
});
