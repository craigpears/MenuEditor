var nextMenuId = 0;
function Menu(name, sourcefile, menuJson) {
    var self = this;
    if (name != undefined) {
        self.name = name;
        self.menuitems = ko.observableArray();
        self.menuid = nextMenuId++;
        self.sourcefile = ko.observable(sourcefile); 

        if (menuJson !== undefined) {
            self.topmenu = menuJson.TopMenu;
            self.submenu = menuJson.SubMenu;
            self.id = menuJson.Id;
            self.hasbuttons = menuJson.HasButtons;
            // Menus need two lines, e.g. <top /> and <menu />
            self.OverlayFileLineName1 = menuJson.OverlayFileLineName1;
            self.OverlayFileLineName2 = menuJson.OverlayFileLineName2;
            self.OverlayFileLineNameButtons = menuJson.OverlayFileLineNameButtons;
            self.Saved = true;
        }
        else {
            self.topmenu = false;
            self.submenu = false;
            self.id = "";
            self.hasbuttons = false;
            // Menus need two lines, e.g. <top /> and <menu />
            self.OverlayFileLineName1 = null;
            self.OverlayFileLineName2 = null;
            self.OverlayFileLineNameButtons = null;
            self.Saved = false;
            self.SectionName = "";
        }

        self.section = function () {
            // find the section that contains this menu
            var sections = model.sections();
            for (var i = 0; i < sections.length; i++) {
                if (sections[i].menus().indexOf(this) !== -1) return sections[i];
            }
        };

        self.ContainsModifications = ko.computed(function () {
            if (self.sourcefile().indexOf("overlay") != -1) {
                return true;
            }
            for (var i = 0; i < self.menuitems().length; i++) {
                if (self.menuitems()[i].ContainsModifications()) {
                    return true;
                }
            }
            return false;
        });

        self.GetMenuItems = function () {
            // Add a placeholder if the menu is empty
            if (self.menuitems().length === 0) {
                var item = new MenuItem("Empty", 0, "emptyitem");
                item.emptyItem(true);
                item.menu = self;
                return [item];
            }
            else
                return self.menuitems();
        };

        self.AddNewMenuItem = function (menu) {
            self.AddMenuItem();
        };

        self.AddNewButton = function (type) {
            var newButton = new MenuItem("", 0, self.sourcefile());
            newButton.OverlayFileLineName = self.name + type + "Button";
            newButton.AccessLevel(1);
            newButton.IsButton(true);
            switch (type) {
                case "blank":
                    break;
                case "save":
                    newButton.Label("Save");
                    newButton.Function("SaveAndCloseClick");
                    newButton.Param1("this.value");
                    newButton.Value("save");
                    newButton.Id = "SaveButton";
                    break;
                case "close":
                    newButton.Label("Close");
                    newButton.Function("SaveAndCloseClick");
                    newButton.Param1("this.value");
                    newButton.Value("close");
                    newButton.Id = "SaveCloseButton";
                    break;
                case "editsave":
                    newButton.Label("Edit");
                    newButton.Function("SaveOrEditClick");
                    newButton.Param1("this.value");
                    newButton.Value("Edit");
                    newButton.Id = "EditButton";
                    break;
                case "undo":
                    newButton.Label("Undo");
                    newButton.Function("UndoClick");
                    newButton.Param1("'account'");
                    newButton.Param2("[guid]");
                    newButton.Value("Undo");
                    newButton.Id = "UndoButton";
                    break;
            }
            self.AddMenuItem(newButton);
            newButton.SaveChanges();
        };

        self.AddMenuItem = function (menuitem, index) {
            var newItem = false;
            if (menuitem === undefined) {
                menuitem = new MenuItem("New Item", 0, "options.overlay.menueditor.dat");
                newItem = true;
            }
            if (index === undefined) index = self.menuitems().length;
            
            // If the menu item is a button, make sure that you have a buttons node
            if (menuitem.IsButton() && !self.hasbuttons) {
                self.AddButtonsNode();
            }

            menuitem.menu(self);
            menuitem.index(index);

            if (newItem) {

                var line = menuitem.OverlayFileLineName + "|" + menuitem.GetxPath(true) + "|" + menuitem.ToXmlNode();

                $.post("Home/AddLine", { line: line }, function (data) {
                    if (data.success) {
                        self.menuitems.splice(index, 0, menuitem);
                        self.UpdateMenuItemIndices();
                    }
                });
            }
            else {
                self.menuitems.splice(index, 0, menuitem);
                self.UpdateMenuItemIndices();
            }
        };

        self.AddButtonsNode = function () {
            var newItemId = GetNewItemId();
            $.ajax({
                type: "POST",
                url: "/Home/AddLine",
                data: { line: newItemId + "|" + self.GetxPath() + "|<buttons />" },
                async: false
            });
            self.OverlayFileLineNameButtons = newItemId;
            self.hasbuttons = true;
        };

        self.GetxPath = function () {
            var xPath = "/lang/menus/" + self.section().parentmenu + "/" + self.section().name + "/";
            if (self.topmenu) xPath += "top/";
            if (self.submenu) xPath += "sub/";
            xPath += "menu";

            return xPath;
        };

        self.RemoveMenuItem = function (index) {
            self.menuitems.splice(index, 1);
            // Fix the menu item indexes
            self.UpdateMenuItemIndices();
        };

        self.UpdateMenuItemIndices = function () {
            var nextIndex = 0;
            $.each(self.menuitems(), function (index, item) {
                item.index(nextIndex++);
            });
        };

        self.IsEmpty = function () {
            return self.menuitems.length === 0;
        };

        self.filteredByAccessOption = function (ao) {
            var copy = cloneObj(self);
            var filteredMenuItems = [];
            for (var i = 0; i < self.menuitems().length; i++) {
                var menuItem = self.menuitems()[i];
                if (menuItem.AccessOption() == ao) {
                    filteredMenus.push(menuItem);
                }
            }
            copy.menuitems = ko.observableArray(filteredMenuItems);
            return copy;
        }

        self.SaveChanges = function () {
            var line1;
            var line2;
            var labelName = self.SectionName.replace("newextension_", "").replace("extension_", "");
            if (self.topmenu) {
                if (self.OverlayFileLineName1 == null) self.OverlayFileLineName1 = self.SectionName + "Top";
                if (self.OverlayFileLineName2 == null) self.OverlayFileLineName2 = self.SectionName + "TopMenu";
                line1 = self.OverlayFileLineName1 + "|/lang/menus/items/" + self.SectionName + "|<top />";
                line2 = self.OverlayFileLineName2 + "|/lang/menus/items/" + self.SectionName + "/top|<menu id=\"" + self.id + "\" label=\"" + self.SectionName + "\"/>";
            }
            else {
                if (self.OverlayFileLineName1 == null) self.OverlayFileLineName1 = self.SectionName + "Sub";
                if (self.OverlayFileLineName2 == null) self.OverlayFileLineName2 = self.SectionName + "SubMenu";
                line1 = self.OverlayFileLineName1 + "|/lang/menus/items/" + self.SectionName + "|<sub />";
                line2 = self.OverlayFileLineName2 + "|/lang/menus/items/" + self.SectionName + "/sub|<menu id=\"" + self.id + "\" label=\"" + self.SectionName + "\"/>";
            }

            if (!self.Saved) {
                
                $.ajax({
                    type: "POST",
                    url: "/Home/AddLine",
                    data: { line: line1 },
                    async: false
                });
                $.ajax({
                    type: "POST",
                    url: "/Home/AddLine",
                    data: { line: line2 },
                    async: false
                });
                self.Saved = true;
            }
            else {
                $.ajax({
                    type: "POST",
                    url: "/Home/UpdateItem",
                    data: { SourceFile: self.SourceFile(), LineName: self.OverlayFileLineName, Line: line1 },
                    async: false
                });
                $.ajax({
                    type: "POST",
                    url: "/Home/UpdateItem",
                    data: { SourceFile: self.SourceFile(), LineName: self.OverlayFileLineName, Line: line2 },
                    async: false
                });
            }
        }
    }
}
