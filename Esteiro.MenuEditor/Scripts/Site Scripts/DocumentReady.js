var model;
$(document).ready(function () {
    model = new ViewModel(sections, accessOptions, functions);
    ko.applyBindings(model);
    $("#tabs").tabs({
        show: function (event, ui) {
            if (ui.panel != undefined) {
                model.filter($(ui.panel).data('filter'));
            }
        }
    });

    $("#edit").tabs();
    $("#preview").height($(window).height() - $("#filter").height() - $("#edit").height() - 50);
    $(window).resize(function () {
        $("#preview").height($(window).height() - $("#filter").height() - $("#edit").height() - 50);
    });

    $("#NavigateWizardDialog").dialog().dialog('close');
    $("#MoveTabWizardDialog").dialog().dialog('close');
});
