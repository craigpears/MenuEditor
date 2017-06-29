var firedReceiveEvent = false;
ko.bindingHandlers.sortable = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        // cached vars for sorting events
        var startIndex = -1;

        var sortableSetup = {
            // cache the item index when the dragging starts
            start: function (event, ui) {

                firedReceiveEvent = false;
                // set the height of the placeholder when sorting
                ui.placeholder.height(ui.item.height());
                ui.placeholder.width(ui.item.width());
            },
            // capture the item index at end of the dragging
            // then move the item
            stop: function (event, ui) {
                if (firedReceiveEvent === false) {
                    var menu = valueAccessor()[0].menu();
                    var oldIndex = ui.item.data('index');
                    var draggedItem = menu.menuitems()[oldIndex];

                    var xPosChange = ui.position.left - ui.originalPosition.left;
                    var levelChange = Math.floor(xPosChange / 25);
                    draggedItem.level(Math.max(0, Math.min(1, draggedItem.level() + levelChange)));



                    var newIndex = ui.item.index();

                    menu.RemoveMenuItem(oldIndex);
                    menu.AddMenuItem(draggedItem, newIndex);

                    if (draggedItem.level() == 1) {
                        var parent = draggedItem.GetParent();
                        if (!parent.hassubmenu) {
                            console.log("There is no parent to attach to, please create a submenu.");
                            draggedItem.level(0);
                        }
                    }




                    draggedItem.SaveChanges();

                    // ko rebinds the array so remove duplicate ui item
                    ui.item.remove();
                }

            },
            receive: function (event, ui) {
                // Deal with updating the menu
                firedReceiveEvent = true;
                var targetMenu = valueAccessor()[0].menu();
                var sourceMenu = model.GetMenuById(ui.item.data('menuid'));
                var oldIndex = ui.item.data('index');
                var draggedItem = sourceMenu.menuitems()[oldIndex];

                sourceMenu.RemoveMenuItem(oldIndex);
                var newIndex = ui.item.index();
                targetMenu.AddMenuItem(draggedItem, newIndex);

                // ko rebinds the array so remove duplicate ui item
                ui.item.remove();
            },
            placeholder: 'placeholder',
            connectWith: '.menu',
            cancel: '.empty-item'
        };

        // bind
        $(element).sortable(sortableSetup);
    }
};