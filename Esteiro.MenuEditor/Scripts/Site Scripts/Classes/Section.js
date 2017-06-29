function Section(name, sourcefile, parentmenu, sectionJson) {
    var self = this;
    if (name == undefined) return;

    self.name = name;
    self.menus = ko.observableArray();
    self.collapsed = ko.observable(true);
    self.parentmenu = parentmenu;
    self.sourcefile = ko.observable(sourcefile);
    if (sectionJson !== undefined) {
        self.isextensionsection = sectionJson.IsExtensionSection;
        self.accessoption = ko.observable(sectionJson.AccessOption);
        self.OverlayFileLineName = sectionJson.OverlayFileLineName;
        self.Saved = true;
    }
    else {
        self.isextensionsection = true;
        self.accessoption = ko.observable("00000000-0000-0000-0000-000000000000");
        self.OverlayFileLineName = GetNewItemId();
        self.Saved = false;

        self.top = new Menu("top", "options.overlay.menueditor.dat");
        self.top.topmenu = true;
        self.top.SectionName = self.name;

        self.sub = new Menu("sub", "options.overlay.menueditor.dat");
        self.sub.submenu = true;
        self.sub.SectionName = self.name;

        self.menus.push(self.top);
        self.menus.push(self.sub);
    }

    self.AddDefaultButtons = function(type)
    {
        if (type == 'new') {
            self.top.AddNewButton('save');
        }
        else {
            self.top.AddNewButton('close');
            self.top.AddNewButton('undo');
            self.top.AddNewButton('editsave');
        }
    };

    self.ToggleCollapsed = function () {
        self.collapsed(!this.collapsed());
    };

    self.ToggleStatus = ko.computed(function () {
        return self.collapsed() ? "collapsedSection" : "expandedSection";
    });

    self.AddMenu = function (menu) {
        self.menus.push(menu);
    }

    self.ContainsModifications = ko.computed(function () {

        if (self.sourcefile().indexOf("overlay") != -1) {
            return true;
        }
        for (var i = 0; i < self.menus().length; i++) {
            if (self.menus()[i].ContainsModifications()) {
                return true;
            }
        }
        return false;
    });

    self.filteredByAccessOption = function (ao) {
        var copy = cloneObj(self);

        var filteredMenus = [];
        for (var i = 0; i < self.menus().length; i++) {
            var filteredMenu = self.menus()[i].filteredByAccessOption(ao);
            if (self.menus()[i].AccessOption() == ao || filteredMenu.menuitems().length != 0) {
                filteredMenus.push(filteredMenu);
            }
        }
        copy.menus = ko.observableArray(filteredMenus);
        return copy;
    }

    self.SaveChanges = function () {
        var line = self.OverlayFileLineName + "|/lang/menus/" + self.parentmenu + "|<" + self.name + "/>";
        if (!self.Saved) {
            $.ajax({
                type: "POST",
                url: "/Home/AddLine",
                data: { line: line },
                async: false
            });
            ko.utils.arrayForEach(self.menus(), function (menu) {
                menu.SaveChanges();
            });
            self.Saved = true;
        }
        else {
            $.ajax({
                type: "POST",
                url: "/Home/UpdateItem",
                data: { SourceFile: self.SourceFile(), LineName: self.OverlayFileLineName, Line: line },
                async: false
            });
        }
    }
}
