using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Esteiro.MenuEditor.Common.Models
{
    public class MenuItemModel
    {
        public String Label { get; set; }
        public String Name { get; set; }
        public Guid AccessOption { get; set; }
        public String AccessOptionSummary { get; set; }
        public int AccessLevel { get; set; }
        public String Function { get; set; }
        public int FunctionType { get; set; }
        public String Param1 { get; set; }
        public String Param2 { get; set; }
        public String Id { get; set; }
        public Boolean IsButton { get; set; }
        public MenuModel Submenu { get; set; }
        public String ChildName { get; set; }
        public String PageMatch { get; set; }
        public String IconUrl { get; set; }
        public String Value { get; set; }
        public Boolean InSubmenu { get; set; }
        public String SourceFile { get; set; }
        public Boolean Deleted { get; set; }
        public String OverlayFileLineName { get; set; }
    }
}
