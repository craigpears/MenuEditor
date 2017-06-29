using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Esteiro.MenuEditor.Common.Models
{
    public class MenuModel
    {
        public String Label { get; set; }
        public String Id { get; set; }
        public List<MenuItemModel> Items { get; set; }
        public Boolean TopMenu { get; set; }
        public Boolean SubMenu { get; set; }
        public String SourceFile { get; set; }
        public Boolean HasButtons { get; set; }
        public String OverlayFileLineName1 { get; set; }
        public String OverlayFileLineName2 { get; set; }
        public String OverlayFileLineNameButtons { get; set; }
    }
}
