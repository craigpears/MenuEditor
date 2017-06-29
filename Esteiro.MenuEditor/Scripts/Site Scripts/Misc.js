function GetNewItemId() {
    // Check that this item id is unique
    var no = 0;
    while (true) {
        var id = "NewItem" + no;
        var foundId = false;
        var menuitems = model.GetMenuItems();
        for (var i = 0; i < menuitems.length ; i++) {
            if (menuitems[i].OverlayFileLineName == id) {
                foundId = true;
                break;
            }
        }

        var sections = model.GetSections();
        for (var i = 0; i < sections.length ; i++) {
            if (sections[i].OverlayFileLineName == id) {
                foundId = true;
                break;
            }
        }

        var menus = model.GetMenus();
        for (var i = 0; i < menus.length ; i++) {
            if (menus[i].OverlayFileLineName1 == id || menus[i].OverlayFileLineName2 == id || menus[i].OverlayFileLineNameButtons == id) {
                foundId = true;
                break;
            }
        }


        if (!foundId) return id;
        no++;
    }
};

ko.dirtyFlag = function (root) {
    var _isDirty = ko.observable(false);

    var result = ko.computed(function () {
        if (!_isDirty()) {
            ko.toJS(root); //just for subscriptions
        }

        return _isDirty();
    });

    result.subscribe(function () {
        if (!root.initialised) {
            root.initialised = true;
            return;
        }
        if (!_isDirty()) {
            _isDirty(true);
        }
    });

    return result;
};

cloneObj = function (obj) {
    if (ko.isWriteableObservable(obj)) return ko.observable(obj()); //this is the trick
    if (obj === null || typeof obj !== 'object') return obj;

    var temp = new obj.constructor(); // give temp the original obj's constructor

    for (var key in obj) {
        if(key != "self")
            temp[key] = cloneObj(obj[key]);
    }

    return temp;
};



function NavigateWizardOK()
{
    alert("Navigate OK");
}

function MoveTabWizardOK()
{
    alert("Move Tab OK");
}

function ParametersHelperClick() {
    var functionName = model.selecteditem().Function();
    if (functionName == "NavigateMainFrame") {
        DialogHelper.ShowGenericDialog("NavigateWizardDialog", "Navigate Main Frame Wizard", NavigateWizardOK);
    }
    else if (functionName == "MoveTab") {
        DialogHelper.ShowGenericDialog("MoveTabWizardDialog", "Move Tab Wizard", MoveTabWizardOK);
    }
    else {
        alert("No helper for this function");
    }
}
