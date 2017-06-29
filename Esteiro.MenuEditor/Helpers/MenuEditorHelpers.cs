using System;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace Esteiro.MenuEditor.Helpers
{
    public static class MenuEditorHelpers
    {
        public static IHtmlString MenuDisplay(this HtmlHelper helper)
        {
            StringBuilder sb = new StringBuilder();
            
            sb.Append("<div data-bind=\"foreach: $root.GetSections()\">");
            sb.Append("     <div class=\"section-holder\">");
            sb.Append("         <h3 data-bind=\"text: name\"></h3>");
            sb.Append("         <div class=\"section\">");
            sb.Append("             <div class=\"menu-holder-outer\">");
            sb.Append("             <div data-bind=\"foreach: menus\">");
            sb.Append("                 <h3 data-bind=\"text: name\"></h3>    ");
            sb.Append("                     <div class=\"menu-holder-inner\">");
            sb.Append("                         <button type=\"button\" data-bind=\"click: AddNewMenuItem\">Add Item</button>");
            sb.Append("                         <ul class=\"menu\" data-bind=\"foreach: GetMenuItems(), sortable: GetMenuItems(), attr: {'data-menuid': menuid}\">");
            sb.Append("                             <li class=\"menu-item\" data-bind=\"style: {left: getLeftOffset()}, click: $root.SelectItem, css: {deleted: Deleted, 'empty-item': emptyItem, button: IsButton, fromextensionfile: fromExtensionFile, coreItem: !fromExtensionFile}, attr: {'data-menuid': $parent.menuid, 'data-index': index}\"><span data-bind=\"text: Label\"></span></li>");
            sb.Append("                         </ul>");
            sb.Append("                     </div>");
            sb.Append("             </div>");
            sb.Append("             <div class=\"clear\"></div>");
            sb.Append("             </div>");
            sb.Append("         </div>  ");
            sb.Append("     </div>       ");
            sb.Append("</div>");
            return MvcHtmlString.Create(sb.ToString());
        }
    }
}