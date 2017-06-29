function DialogHelper() {
    var self = this;

    self.ShowGenericDialog = function (id, title, okfunctionname) {
        //Create buttons
        var buttons = {};
        buttons["OK"] = function () {
            okfunctionname();
            model.selecteditem().SaveChanges();
            $("#" + id).dialog('close');
        };
        buttons["Cancel"] = function () {
            $("#" + id).dialog('close');
        };

        $("#" + id).removeClass("hidden");
        $("#" + id).dialog({ buttons: buttons, title: title });
    }


    self.ShowNewButtonDialog = function (callingmenu) {
        var buttons = {};
        buttons["Add Button"] = function () {
            callingmenu.AddNewButton($("#buttontype").val());
            $("#NewButtonDialog").dialog('close');
        };
        buttons["Cancel"] = function () {
            $("#NewButtonDialog").dialog('close');
        };
        $("#NewButtonDialog").removeClass("hidden");
        $("#NewButtonDialog").dialog({ buttons: buttons, title: "New Button" });
    }
}


