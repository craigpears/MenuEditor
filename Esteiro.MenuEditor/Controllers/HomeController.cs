using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using Esteiro.MenuEditor.Common;
using Esteiro.MenuEditor.Common.Models;
using Esteiro.MenuEditor.DataAccess;

namespace Esteiro.MenuEditor.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            GoldVisionDataAccess gv = new GoldVisionDataAccess();
            
            // Check that the current user has admin level access

            JavaScriptSerializer jss = new JavaScriptSerializer();
            jss.MaxJsonLength = int.MaxValue;
            SortedSet<String> Functions;

            ViewBag.AccessOptions = jss.Serialize(gv.ListAccessOptions());
            ViewBag.Sections = jss.Serialize(gv.GetSections(out Functions));
            ViewBag.Functions = jss.Serialize(Functions);

            gv.Dispose();
            return View();
        }

        [HttpPost]
        [ValidateInput(false)]
        public JsonResult AddLine(String line)
        {
            GoldVisionDataAccess gv = new GoldVisionDataAccess();
            gv.WriteLineToOverlay("menueditor", line);

            JsonResult result = new JsonResult();
            result.Data = new { success = true };
            return result;
        }

        [HttpPost]
        [ValidateInput(false)]
        public JsonResult AddLines(string[] lines)
        {
            GoldVisionDataAccess gv = new GoldVisionDataAccess();
            foreach (string line in lines)
            {
                gv.WriteLineToOverlay("menueditor", line);
            }

            JsonResult result = new JsonResult();
            result.Data = new { success = true };
            return result;
        }

        [HttpPost]
        [ValidateInput(false)]
        public JsonResult RemoveLine(String SourceFile, String LineName)
        {
            GoldVisionDataAccess gv = new GoldVisionDataAccess();
            gv.RemoveLineFromOverlay(SourceFile, LineName);

            JsonResult result = new JsonResult();
            result.Data = new { success = true };
            return result;
        }

        [HttpPost]
        [ValidateInput(false)]
        public JsonResult UpdateItem(String SourceFile, String LineName, String Line)
        {

            GoldVisionDataAccess da = new GoldVisionDataAccess();
            da.UpdateOverlayLine(SourceFile, LineName, Line);

            JsonResult result = new JsonResult();
            result.Data = new { success = true };
            return result;
        }

    }
}
