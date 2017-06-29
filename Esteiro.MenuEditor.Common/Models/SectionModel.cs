using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Esteiro.MenuEditor.Common.Models
{
    public class SectionModel
    {
        public String Name { get; set; }
        public Guid AccessOption { get; set; }
        public String AccessOptionSummary { get; set; }
        public List<MenuModel> Menus { get; set; }
        public String ParentMenu { get; set; }
        public Boolean IsExtensionSection { get; set; }
        public String SourceFile { get; set; }
        public String OverlayFileLineName { get; set; }
    }
}
