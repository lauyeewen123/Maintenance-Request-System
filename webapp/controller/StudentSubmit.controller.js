sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (Controller, UIComponent, MessageToast, History) {
    "use strict";

    return Controller.extend("project1.controller.StudentSubmit", {
        onInit: function () {
            // Setup default values when entering if needed
             var oRouter = UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteStudentSubmit").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            // Reset form
            var oModel = this.getView().getModel("maintenance");
             oModel.setProperty("/newTicket/description", "");
             oModel.setProperty("/newTicket/category", "Electrical");
        },

        onSubmit: function () {
            var oModel = this.getView().getModel("maintenance");
            var oNewTicket = oModel.getProperty("/newTicket");

            var sFile = this.byId("fileUploader").getValue();
            var bValidationError = false;

            // Validation
            if (!oNewTicket.description || oNewTicket.description.trim() === "") {
                 bValidationError = true;
            }
            if (!sFile || sFile.trim() === "") {
                 bValidationError = true;
            }

            if (bValidationError) {
                MessageToast.show("Please fill all required fields and upload evidence.");
                return;
            }

            // Generate ID
            var aTickets = oModel.getProperty("/tickets");
            var sId = "MT-2025-" + (100 + aTickets.length + 1);

            // Create payload
            var oPayload = {
                id: sId,
                studentName: oNewTicket.studentName,
                room: oNewTicket.room,
                category: oNewTicket.category,
                description: oNewTicket.description,
                status: "Pending",
                date: new Date().toISOString().split('T')[0],
                technician: ""
            };

            // Add to list (Unshift to add to TOP of list for better visibility)
            aTickets.unshift(oPayload);
            oModel.setProperty("/tickets", aTickets);

            MessageToast.show("Request Submitted Successfully");
            
            // Navigate back
            this.onNavBack();
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = UIComponent.getRouterFor(this);
                oRouter.navTo("RouteStudent", {}, true);
            }
        }
    });
});
