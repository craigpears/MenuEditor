
function MenuItem(label, level, sourcefile, itemJson) {
    var self = this;

    self.Label = ko.observable(label);

    self.level = ko.observable(level); //Doesn't apply to buttons.  For menu items, it is whether or not they are in a sub menu (0 = top level, 1 = submenu)
    self.menu = ko.observable(); // Set by AddMenuItem in Menu
    self.index = ko.observable(); // Set by AddMenuItem in Menu

    self.emptyItem = ko.observable(false);

    self.SourceFile = ko.observable(sourcefile);

    self.hassubmenu = ko.observable(false);

    if (itemJson !== undefined) {
        self.Deleted = ko.observable(itemJson.Deleted);
        self.IsButton = ko.observable(itemJson.IsButton);
        self.Name = itemJson.Name;
        self.AccessOption = ko.observable(itemJson.AccessOption);
        if (itemJson.AccessLevel === undefined) itemJson.AccessLevel = 1;
        self.AccessLevel = ko.observable(itemJson.AccessLevel);
        self.Function = ko.observable(itemJson.Function);
        self.FunctionType = ko.observable(itemJson.FunctionType);
        self.Param1 = ko.observable(itemJson.Param1);
        self.Param2 = ko.observable(itemJson.Param2);
        self.Id = itemJson.Id;
        self.ChildName = ko.observable(itemJson.ChildName);
        self.PageMatch = ko.observable(itemJson.PageMatch);
        self.IconUrl = ko.observable(itemJson.IconUrl);
        self.Value = ko.observable(itemJson.Value);
        self.OverlayFileLineName = itemJson.OverlayFileLineName;
    }
    else {
        self.Deleted = ko.observable(false);
        self.IsButton = ko.observable(false);
        self.Name = "New Item"; // TODO: GENERATE SOMETHING UNIQUE
        self.AccessOption = ko.observable("00000000-0000-0000-0000-000000000000");
        self.AccessLevel = ko.observable(1);
        self.Function = ko.observable("DoNothing");
        self.FunctionType = ko.observable(1);
        self.Param1 = ko.observable("none");
        self.Param2 = ko.observable("none");
        self.Id = "newitemid"; // TODO: GENERATE SOMETHING UNIQUE
        self.ChildName = ko.observable("");
        self.PageMatch = ko.observable("");
        self.IconUrl = ko.observable("");
        self.Value = ko.observable("");
        self.OverlayFileLineName = GetNewItemId();
    }

    self.ConvertToSubmenu = function () {
        var newchildname = self.ChildName() == "" ? ("pop_" + self.OverlayFileLineName) : self.ChildName();

        if (!self.hassubmenu()) {
            $.post("/Home/AddLine", { line: self.OverlayFileLineName + "submenu|" + self.menu().GetxPath() + "|<submenu id=\"" + newchildname + "\" />" }, function () {
                self.hassubmenu(true);
                self.ChildName(newchildname);
                self.FunctionType(5);
                self.SaveChanges();
                alert("Successfully converted to submenu");
            });
        }
    }

    self.GetParent = function () {
        if (self.level() == 0) {
            return self.menu();
        }
        else {
            var menuitems = self.menu().menuitems();
            // Find the first item before this one, that isn't a sub-item
            for (var i = self.index() - 1; i >= 0; i--) {
                if (menuitems[i].level() == 0 && menuitems[i].Deleted() == false && menuitems[i].FunctionType() == 5) {
                    return menuitems[i];
                }
            }
        }
    };

    self.fromExtensionFile = ko.computed(function () {
        return self.SourceFile().indexOf("overlay") != -1;
    });

    self.coreItem = ko.computed(function () {
        return !self.fromExtensionFile() || self.Deleted(); // Only core items can be deleted
    });

    self.ContainsModifications = ko.computed(function () {
        var modified = self.fromExtensionFile() || self.Deleted();
        return modified;
    });

    self.buttonText = ko.computed(function () {
        if (self.IsButton()) return "true";
        else return "false";
    });

    self.accessLevelText = ko.computed(function () {
        return self.AccessLevel().toString();
    });

    self.getLeftOffset = function () {
        if (self.IsButton()) return "0px";
        else return self.level() * 25 + 'px';
    };

    self.ToggleDeleteItem = function () {
        if (!self.Deleted()) {
            if (self.fromExtensionFile()) {
                if (confirm("Deleting extension file items can't be undone, are you sure you want to delete this item?")) {
                    $.post("Home/RemoveLine", { SourceFile: self.SourceFile(), LineName: self.OverlayFileLineName }, function (data) {
                        if (data.success) {
                            self.Deleted(true);
                        }
                    });
                }
            }
            else {
                // Fire off an ajax request to the server to delete this item
                var line = self.Name + "Delete|" + self.GetxPath() + "|delete";
                $.post("Home/AddLine", { line: line }, function (data) {
                    if (data.success) {
                        self.Deleted(true);
                        self.SourceFile("options.overlay.menueditor.dat");
                        self.OverlayFileLineName(self.Name + "Delete");
                    }
                });
            }
        }
        else {
            // Fire off an ajax request to the server to restore this item
            $.post("Home/RemoveLine", { SourceFile: self.SourceFile(), LineName: self.OverlayFileLineName }, function (data) {
                if (data.success) {
                    self.Deleted(false);
                    self.SourceFile("options.xml");
                    self.OverlayFileLineName("");
                }
            });
        }
    };

    self.DeleteItemText = function () {
        return self.Deleted() ? "UnDelete" : "Delete";
    };

    self.GetxPath = function (inserting) {
        if (inserting == undefined) inserting = false;
        var xPath = "/lang/menus/" + self.menu().section().parentmenu + "/" + self.menu().section().name + "/";
        if (self.menu().topmenu) xPath += "top/";
        if (self.menu().submenu) xPath += "sub/";
        xPath += "menu[@id='" + self.menu().id + "']";
        if (self.IsButton()) xPath += "/buttons";

        if (self.level() == 1) {
            xPath += "/submenu[@id='" + self.GetParent().ChildName() + "']";
        }

        if (!inserting) {
            if (self.IsButton()) xPath += "/button";
            if (!self.IsButton()) xPath += "/item";
            // There are some problems with the id not being unique in the admin menus, so try to use name if it is defined
            // If it isn't, then pray that id is!
            if (self.Name != undefined && self.Name != "")
                xPath += "[@name='" + self.Name + "']";
            else
                xPath += "[@id='" + self.Id + "']";
        }



        return xPath;
    };

    self.ToXmlNode = function () {
        var node = "<";
        if (self.IsButton()) node += "button ";
        else node += "item ";

        if (self.AccessOption() != "00000000-0000-0000-0000-000000000000") {
            node += "accessoption=\"" + self.AccessOption() + "\" ";
        }
        else {
            node += "accessoption=\"\" ";
        }
        node += "accesslevel=\"" + self.AccessLevel() + "\" ";

        node += "functiontype=\"" + self.FunctionType() + "\" ";
        node += "childname=\"" + self.ChildName() + "\" ";
        node += "function=\"" + self.Function() + "\" ";
        node += "id=\"" + self.Id + "\" ";
        node += "label=\"" + self.Label() + "\" ";
        node += "pagematch=\"" + self.PageMatch() + "\" ";

        if (self.IsButton()) {
            node += "param1=\"" + self.Param1() + "\" ";
            node += "param2=\"" + self.Param2() + "\" ";
            node += "value=\"" + self.Value() + "\" ";
        }
        else {
            node += "functionparam=\"" + self.Param1() + "\" ";
        }

        node += "iconurl=\"" + self.IconUrl() + "\" ";
        node += "name=\"" + self.Name + "\"";
        node += "/>";

        return node;
    };

    self.initialised = false;
    self.dirtyFlag = new ko.dirtyFlag(self);



    self.SaveChanges = function () {
        // TODO - Have this fire automatically when an item is updated by using something along the lines of the example dirty flag code
        // or just subscribe to a bunch of events

        // If this comes from options.xml, then delete it and add a new line to options.overlay.menueditor.dat
        if (self.OverlayFileLineName == null) {
            if (confirm("Changing this will cause this item to be deleted and a copy created, are you sure you want to do this?")) {
                // Create a copy of this
                // TODO - this is going wrong because self contains knockout observables, and the values are being copied into the copy as these observables
                var copy = cloneObj(self);
                copy.SourceFile("options.overlay.menueditor.dat");
                copy.OverlayFileLineName(self.Label() + "Copy");
                self.menu().AddMenuItem(copy, self.index());
                copy.SaveChanges();
                self.ToggleDeleteItem();
            }
        }
        else {

            var line = self.OverlayFileLineName + "|" + self.GetxPath(true) + "|" + self.ToXmlNode();
            $.ajax({
                type: "POST",
                url: "/Home/UpdateItem",
                data: { SourceFile: self.SourceFile(), LineName: self.OverlayFileLineName, Line: line },
                async: false
            });
        }


    };
}
