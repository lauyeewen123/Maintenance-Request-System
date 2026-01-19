sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
], function (Controller, UIComponent) {
    "use strict";

    return Controller.extend("project1.controller.Home", {
        onPressStudent: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RouteStudent");
        },

        onPressAdmin: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RouteAdmin");
        }
    });
});
