function ViewModel(sections, accessoptions, functions) {
    var self = this;
    self.filter = ko.observable("none");
    self.newsectionname = ko.observable("newsection");

    accessoptions.unshift({ Id: "00000000-0000-0000-0000-000000000000", Summary: "Not Set" });
    self.accessoptions = ko.observableArray(accessoptions);
    self.functions = ko.observableArray(functions);

    // Build the sections and menus
    var sectionsArray = [];
    for (var i = 0; i < sections.length; i++) {
        var sectionJson = sections[i];
        var section = new Section(sectionJson.Name, sectionJson.SourceFile, sectionJson.ParentMenu, sectionJson);
        for (var j = 0; j < sectionJson.Menus.length; j++) {
            var menuJson = sectionJson.Menus[j];
            var menu = new Menu(menuJson.Label, menuJson.SourceFile, menuJson);
            for (var k = 0; k < menuJson.Items.length; k++) {
                var menuItemJson = menuJson.Items[k];
                var menuitem = new MenuItem(menuItemJson.Label, 0, menuItemJson.SourceFile, menuItemJson);

                menu.AddMenuItem(menuitem);
                if (menuItemJson.Submenu != null) {
                    menuitem.hassubmenu(true);
                    for (var l = 0; l < menuItemJson.Submenu.Items.length; l++) {
                        var submenuItemJson = menuItemJson.Submenu.Items[l];
                        var submenuitem = new MenuItem(submenuItemJson.Label, 1, submenuItemJson.SourceFile, submenuItemJson);
                        menu.AddMenuItem(submenuitem);
                    }
                }

            }
            section.AddMenu(menu);
        }
        sectionsArray.push(section);
    }

    self.sections = ko.observableArray(sectionsArray);
    self.selecteditem = ko.observable(self.sections()[0].menus()[0].menuitems()[0]);
    self.byAccessOptionFilterValue = ko.observable("00000000-0000-0000-0000-000000000000");

    self.GetMenuItems = function () {
        var items = [];
        for (var i = 0; i < self.sections().length; i++) {
            for (var j = 0; j < self.sections()[i].menus().length; j++) {
                items = items.concat(self.sections()[i].menus()[j].menuitems());
            }
        }
        return items;
    };

    self.GetMenus = function () {
        var items = [];
        for (var i = 0; i < self.sections().length; i++) {
                items = items.concat(self.sections()[i].menus());
        }
        return items;
    };

    self.GetSections = ko.computed(function () {
        var filter = self.filter();
        var sectionsArray = self.sections();
        var aoFilter = self.byAccessOptionFilterValue();

        var returnSections = [];
        switch (filter) {
            case "none":
                return self.sections();
            case "mainonly":
            case "mainuseronly":
            case "mainadminonly":
                for (var i = 0; i < sectionsArray.length; i++) {
                    if (sectionsArray[i].parentmenu == "main") {
                        if ((sectionsArray[i].name.indexOf("admin") === 0 && filter == "mainadminonly")
                            || filter == "mainonly"
                            || sectionsArray[i].name.indexOf("main") === 0 && filter == "mainuseronly") {
                            returnSections.push(sectionsArray[i]);
                        }
                    }
                }
                break;
            case "itemsonly":
                for (var i = 0; i < sectionsArray.length; i++) {
                    if (sectionsArray[i].parentmenu == "items") {
                        returnSections.push(sectionsArray[i]);
                    }
                }
                break;
            case "extensionobjectsonly":
                for (var i = 0; i < sectionsArray.length; i++) {
                    if (sectionsArray[i].sourcefile().indexOf("overlay") != -1) {
                        returnSections.push(sectionsArray[i]);
                    }
                }
                break;
            case "modifiedonly":
                for (var i = 0; i < sectionsArray.length; i++) {
                    if (sectionsArray[i].ContainsModifications()) {
                        returnSections.push(sectionsArray[i]);
                    }
                }
                break;
            case "byaccessoption":
                if (aoFilter == "00000000-0000-0000-0000-000000000000") {
                    break;
                }
                for (var i = 0; i < sectionsArray.length; i++) {
                    var filteredSection = sectionsArray[i].filteredByAccessOption(aoFilter);
                    if (sectionsArray[i].accessoption() == aoFilter || filteredSection.menus().length != 0) {
                        returnSections.push(filteredSection);
                    }
                }
                break;
            default:
                console.log("didn't recognise filter");
                break;

        }

        return returnSections;
    });

    self.AddSection = function () {
        // Fire off an ajax request to the server to delete this item
        var xPath = "/lang/menus/items";
        var fullNewSectionName = self.newsectionname();
        if (fullNewSectionName.indexOf("extension_") != 0) fullNewSectionName = "extension_" + fullNewSectionName;
        var fullNewSectionNameNew = "new" + fullNewSectionName;
        
        var section = new Section(fullNewSectionName, "options.overlay.menueditor.dat", "items");
        section.SaveChanges();
        self.sections.push(section);
        var sectionNew = new Section(fullNewSectionNameNew, "menueditoroptions.overlay.menueditor.dat", "items");        
        sectionNew.SaveChanges();
        self.sections.push(sectionNew);

        section.AddDefaultButtons();
        sectionNew.AddDefaultButtons('new');
    }

    self.IsEmptyMenu = function (menuname) {
        return ko.utils.arrayFilter(self.menuitems(), function (item) {
            return item.menu() === menuname;
        }).length === 0;
    };

    self.SelectItem = function (item) {
        $(".selected").each(function (index, e) {
            $(e).removeClass("selected");
        });
        $(item).addClass("selected");
        self.selecteditem(item);
    };

    self.GetAllSectionsCollapsed = function () {
        var allCollapsed = true;
        $.each(self.sections(), function () {
            if (!this.collapsed()) allCollapsed = false;
        });
        return allCollapsed;
    };

    self.ToggleAllSections = function () {
        var newValue = self.GetAllSectionsCollapsed() ? false : true;
        $.each(self.sections(), function () {
            this.collapsed(newValue);
        });
    };

    self.ToggleAllSectionsText = function () {
        if (self.GetAllSectionsCollapsed())
            return "Expand Sections";
        else
            return "Collapse Sections";
    };

    self.GetMenuById = function (id) {
        var returnMenu;
        $.each(self.sections(), function (index, section) {
            $.each(section.menus(), function (index, menu) {
                if (menu.menuid === id) {
                    returnMenu = menu;
                    return;
                }
            });
        });

        return returnMenu;
    };

    self.DialogHelper = new DialogHelper();
};
