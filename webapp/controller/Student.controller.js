sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment"
], function (Controller, UIComponent, History, Fragment) {
    "use strict";

    return Controller.extend("project1.controller.Student", {
        onInit: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteStudent").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function () {
            this._updateStats();
        },

        _updateStats: function () {
            var oModel = this.getView().getModel("maintenance");
            var aTickets = oModel.getProperty("/tickets");
            
            var iActive = aTickets.filter(function(t){ return t.status !== 'Completed'; }).length;
            var iCompleted = aTickets.filter(function(t){ return t.status === 'Completed'; }).length;

            oModel.setProperty("/stats/active", iActive);
            oModel.setProperty("/stats/completed", iCompleted);
        },

        onPressReport: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RouteStudentSubmit");
        },

        onListItemPress: function (oEvent) {
             var oContext = oEvent.getSource().getBindingContext("maintenance");
             this._openDetailsDialog(oContext);
        },

        _openDetailsDialog: function (oContext) {
             var oView = this.getView();
            if (!this._pDetailsDialog) {
                this._pDetailsDialog = Fragment.load({
                    id: oView.getId(),
                    name: "project1.view.fragments.TicketDetails",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pDetailsDialog.then(function (oDialog) {
                oDialog.setBindingContext(oContext, "maintenance");
                oDialog.open();
            });
        },

        onCloseDetails: function () {
             this._pDetailsDialog.then(function (oDialog) {
                oDialog.close();
            });
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = UIComponent.getRouterFor(this);
                oRouter.navTo("RouteHome", {}, true);
            }
        }
    });
});
