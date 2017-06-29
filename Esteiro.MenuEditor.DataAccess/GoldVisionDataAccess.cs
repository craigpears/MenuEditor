using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using Esteiro.MenuEditor.Common.Models;

namespace Esteiro.MenuEditor.DataAccess
{
    public class GoldVisionDataAccess
    {
        protected SqlConnection _conn;
        protected List<AccessOptionModel> _accessoptions;
        protected List<SectionModel> _sections;
        protected Dictionary<String, Boolean> _usedNames = new Dictionary<string,bool>();

        protected SortedSet<String> _functions = new SortedSet<String>();

        public GoldVisionDataAccess()
        {

        }

        private void InitialiseOrOpenConnection()
        {

            if (_conn != null)
            {
                if (_conn.State != System.Data.ConnectionState.Open) _conn.Open();
                return;
            }
            _conn = new SqlConnection();
            _conn.ConnectionString = Properties.Settings.Default.ConnectionString;
            _conn.Open();
        }

        public List<AccessOptionModel> ListAccessOptions()
        {
            try
            {
                InitialiseOrOpenConnection();
                SqlCommand command = new SqlCommand();
                command.Connection = _conn;
                command.CommandText = "select ACO_ID, SUMMARY from ACCESS_OPTIONS";
                SqlDataReader reader = command.ExecuteReader();

                List<AccessOptionModel> options = new List<AccessOptionModel>();
                while (reader.Read())
                {
                    AccessOptionModel option = new AccessOptionModel();
                    option.Id = (Guid)reader["ACO_ID"];
                    option.Summary = (String)reader["SUMMARY"];
                    options.Add(option);
                }
                reader.Close();
                _conn.Close();

                _accessoptions = options; // used later when populating menus
                return options;
            }
            catch
            {
                // If you can't load via the database connection, use the stock models
                XmlDocument accessOptionsXML = new XmlDocument();
                accessOptionsXML.Load(Properties.Settings.Default.StockAccessOptionsFilePath);

                List<AccessOptionModel> options = new List<AccessOptionModel>();
                foreach (XmlNode node in accessOptionsXML.SelectNodes("//access_options"))
                {
                    AccessOptionModel option = new AccessOptionModel();
                    option.Id = Guid.Parse(node.Attributes["aco_id"].Value);
                    option.Summary = node.Attributes["summary"].Value;
                    options.Add(option);
                }

                _accessoptions = options;
                return options;
            }
            
        }

        public List<SectionModel> GetSections(out SortedSet<String> Functions)
        {
            _sections = new List<SectionModel>();

            XmlDocument optionsXml = new XmlDocument();
            optionsXml.Load(Properties.Settings.Default.LangEnUkFolderPath + "/options.xml");

            // Load in all the custom sections, items and menus
            DirectoryInfo di = new DirectoryInfo(Properties.Settings.Default.LangEnUkFolderPath);
            FileInfo[] opFiles = di.GetFiles("options.overlay.*.dat");
            foreach (FileInfo fi in opFiles)
            {
                TextReader fsIn = new StreamReader(fi.FullName);
                string sBuffer = "";
                try
                {
                    while (true)
                    {
                        sBuffer = fsIn.ReadLine();
                        if (sBuffer != null)
                        {
                            ApplyMenuOverlayItem(sBuffer, ref optionsXml, fi.Name);
                        }
                        else
                            break;
                    }
                }
                catch (Exception ex)
                {
                    throw new Exception(String.Format("Error applying overlay item for {0} - {1}", fi.FullName, ex.Message));
                }
                finally
                {
                    fsIn.Close();
                }
            }

            _sections.AddRange(ParseSections(optionsXml.SelectSingleNode("/lang/menus/main").ChildNodes, "main"));
            _sections.AddRange(ParseSections(optionsXml.SelectSingleNode("/lang/menus/items").ChildNodes, "items"));

            Functions = _functions;


            return _sections;
        }

        public void WriteLineToOverlay(String overlayName, String line)
        {
            String filename = String.Format("options.overlay.{0}.dat", overlayName);
            String filepath = String.Format("{0}/{1}", Properties.Settings.Default.LangEnUkFolderPath, filename);
            if (!File.Exists(filepath))
            {
                File.Create(filepath);
            }
            using (StreamWriter sw = new StreamWriter(filepath, true))
            {
                sw.WriteLine(line);
            }
        }

        public void UpdateOverlayLine(String filename, String LineName, String Line)
        {
            // Load the file contents and write everything back except for the matching line name
            String filepath = String.Format("{0}/{1}", Properties.Settings.Default.LangEnUkFolderPath, filename);

            List<String> lines = File.ReadLines(filepath).Where(l => l.Split('|')[0] != LineName).ToList();
            lines.Add(Line);
            File.WriteAllLines(filepath, lines);
        }

        public void RemoveLineFromOverlay(String filename, String LineName)
        {
            // Load the file contents and write everything back except for the matching line name
            String filepath = String.Format("{0}/{1}", Properties.Settings.Default.LangEnUkFolderPath, filename);

            File.WriteAllLines(filepath, File.ReadLines(filepath).Where(l => l.Split('|')[0] != LineName).ToList());
        }

        private void ApplyMenuOverlayItem(String sBuffer, ref XmlDocument optionsXml, String sourceFile)
        {
            string[] sLineSplit = sBuffer.Split('|');
            if (sLineSplit.Length == 3 || sLineSplit.Length == 4)
            {
                XmlElement xlNode = (XmlElement)optionsXml.SelectSingleNode(sLineSplit[1]);
                if (xlNode != null)
                {

                    // Check that the name is unique, otherwise deleting/updating one could result in deleting/updating others
                    String name = sLineSplit[0];
                    if (_usedNames.ContainsKey(name)) 
                        throw new Exception("All names must be unique in an overlay (the identifier before the first '|')" + name);
                    _usedNames[name] = true;

                    // 6.20 - if last token is delete, delete
                    if (sLineSplit[2].ToLower() == "delete")
                    {
                        xlNode.SetAttribute("deleted", "true");
                        xlNode.SetAttribute("sourcefile", sourceFile);
                        xlNode.SetAttribute("overlayfilelinename", sLineSplit[0]);
                    }
                    // 6.5.1 - SRH "insertafter" functionality 13436P
                    else
                    {

                        char[] endChars = new char[2] { ' ', '/' };
                        string sNodeType = sLineSplit[2].Substring(1, sLineSplit[2].IndexOfAny(endChars) - 1);

                        XmlElement xlItem = optionsXml.CreateElement(sNodeType);
                        XmlDocument xdWork = new XmlDocument();
                        xdWork.LoadXml(string.Format("<xml>{0}</xml>", sLineSplit[2]));
                        XmlElement xlWork = (XmlElement)xdWork.SelectSingleNode(string.Format("xml/{0}", sNodeType));

                        foreach (XmlAttribute xlAttr in xlWork.Attributes)
                        {
                            xlItem.SetAttribute(xlAttr.Name, xlAttr.Value);
                        }

                        xlItem.SetAttribute("sourcefile", sourceFile);
                        xlItem.SetAttribute("overlayfilelinename", sLineSplit[0]);

                        // 6.1.5 - make it possible to overlay any node type
                        if (sLineSplit.Length == 4 && sLineSplit[3].ToLower() == "insertafter")
                            xlNode.ParentNode.InsertAfter(xlItem, xlNode);
                        else if (sLineSplit.Length == 4 && sLineSplit[3].ToLower() == "insertbefore")
                            xlNode.ParentNode.InsertBefore(xlItem, xlNode);
                        else
                            xlNode.AppendChild(xlItem);
                    }
                }
            }
        }

        private List<SectionModel> ParseSections(XmlNodeList nodes, String topMenu)
        {
            List<SectionModel> sections = new List<SectionModel>();
            
            foreach (XmlNode node in nodes)
            {
                SectionModel section = new SectionModel();
                section.Menus = ParseMenus(node.ChildNodes);
                section.Name = node.Name;
                section.ParentMenu = topMenu;
                if (node.Attributes["overlayfilelinename"] != null)
                    section.OverlayFileLineName = node.Attributes["overlayfilelinename"].Value;
                if (node.Attributes["sourcefile"] != null)
                    section.SourceFile = node.Attributes["sourcefile"].Value;
                else
                    section.SourceFile = "options.xml";
                if (node.Attributes["accessoption"] != null)
                {
                    section.AccessOption = Guid.Parse(node.Attributes["accessoption"].Value);
                    if (_accessoptions != null)
                        section.AccessOptionSummary = _accessoptions.Single(x => x.Id == section.AccessOption).Summary;
                }
                sections.Add(section);
            }

            return sections;
        }

        private List<MenuModel> ParseMenus(XmlNodeList nodes)
        {
            List<MenuModel> menus = new List<MenuModel>();
            foreach (XmlNode node in nodes)
            {
                MenuModel menu = new MenuModel();
                switch (node.Name)
                {
                    case "menu":
                        menu = ParseMenu(node);
                        break;
                    case "top":
                        menu = ParseMenu(node.FirstChild);
                        menu.TopMenu = true;
                        if (node.Attributes["overlayfilelinename"] != null)
                            menu.OverlayFileLineName1 = node.Attributes["overlayfilelinename"].Value;
                        break;
                    case "sub":
                        menu = ParseMenu(node.FirstChild);
                        menu.SubMenu = true;
                        if (node.Attributes["overlayfilelinename"] != null)
                            menu.OverlayFileLineName1 = node.Attributes["overlayfilelinename"].Value;
                        break;
                    default:
                        throw new Exception("Unrecognised menu node name" + node.Name);
                }
                if (node.Attributes["sourcefile"] != null)
                    menu.SourceFile = node.Attributes["sourcefile"].Value;
                else
                    menu.SourceFile = "options.xml";
                menus.Add(menu);
            }
            return menus;
        }

        private MenuModel ParseMenu(XmlNode node)
        {
            MenuModel menu = new MenuModel();
            if (node.Attributes["id"] != null)
                menu.Id = node.Attributes["id"].Value;
            if (node.Attributes["label"] != null)
                menu.Label = node.Attributes["label"].Value;
            if (node.Attributes["overlayfilelinename"] != null)
                menu.OverlayFileLineName2 = node.Attributes["overlayfilelinename"].Value;
            menu.Items = new List<MenuItemModel>();
            foreach (XmlNode childNode in node.ChildNodes)
            {
                switch (childNode.Name)
                {
                    case "item":
                        menu.Items.Add(ParseMenuItem(childNode));
                        break;
                    case "buttons":
                        if (childNode.Attributes["overlayfilelinename"] != null)
                            menu.OverlayFileLineNameButtons = childNode.Attributes["overlayfilelinename"].Value;
                        menu.Items.AddRange(ParseButtonsList(childNode.ChildNodes));
                        menu.HasButtons = true;
                        break;
                    case "submenu":
                        MenuModel submenu = ParseMenu(childNode);
                        foreach (MenuItemModel item in submenu.Items)
	                    {
		                    item.InSubmenu = true;
	                    }
                        menu.Items.Single(x => x.ChildName == submenu.Id).Submenu = submenu;
                        break;
                    case "icons":
                        break;
                    case "menu":
                        break;
                    default:
                        throw new Exception("Unrecognised childnode name "+childNode.Name);
                        break;
                }
            }
            return menu;
        }

        private MenuItemModel ParseMenuItem(XmlNode node)
        {
            MenuItemModel menuitem = new MenuItemModel();

            if (node.Attributes["accesslevel"] != null && !String.IsNullOrEmpty(node.Attributes["accesslevel"].Value))
                menuitem.AccessLevel = int.Parse(node.Attributes["accesslevel"].Value);
            if(node.Attributes["accessoption"] != null && !String.IsNullOrEmpty(node.Attributes["accessoption"].Value))
            {
                menuitem.AccessOption = Guid.Parse(node.Attributes["accessoption"].Value);
                if(_accessoptions != null)
                menuitem.AccessOptionSummary = _accessoptions.Single(x => x.Id == menuitem.AccessOption).Summary;
            }
            if(node.Attributes["functiontype"] != null && !String.IsNullOrEmpty(node.Attributes["functiontype"].Value))
                menuitem.FunctionType = int.Parse(node.Attributes["functiontype"].Value);
            if(node.Attributes["childname"] != null)
                menuitem.ChildName = node.Attributes["childname"].Value;
            if (node.Attributes["function"] != null)
            {
                menuitem.Function = node.Attributes["function"].Value;
                _functions.Add(menuitem.Function);
            }
            if (node.Attributes["id"] != null)
                menuitem.Id = node.Attributes["id"].Value;
            menuitem.IsButton = false;
            if (node.Attributes["label"] != null)
                menuitem.Label = node.Attributes["label"].Value;
            if (node.Attributes["pagematch"] != null)
                menuitem.PageMatch = node.Attributes["pagematch"].Value;
            if (node.Attributes["functionparam"] != null)
                menuitem.Param1 = node.Attributes["functionparam"].Value;
            if (node.Attributes["param1"] != null)
                menuitem.Param1 = node.Attributes["param1"].Value;
            if (node.Attributes["param2"] != null)
                menuitem.Param2 = node.Attributes["param2"].Value;
            if (node.Attributes["iconurl"] != null)
                menuitem.IconUrl = node.Attributes["iconurl"].Value;
            if (node.Attributes["value"] != null)
                menuitem.Value = node.Attributes["value"].Value;
            if (node.Attributes["name"] != null)
                menuitem.Name = node.Attributes["name"].Value;
            if (node.Attributes["deleted"] != null)
                menuitem.Deleted = Boolean.Parse(node.Attributes["deleted"].Value);
            if (node.Attributes["sourcefile"] != null)
                menuitem.SourceFile = node.Attributes["sourcefile"].Value;
            else
                menuitem.SourceFile = "options.xml";
            if(menuitem.SourceFile.Contains("overlay"))
                menuitem.OverlayFileLineName = node.Attributes["overlayfilelinename"].Value;
            return menuitem;
        }
        
        private List<MenuItemModel> ParseButtonsList(XmlNodeList nodes)
        {
            List<MenuItemModel> buttons = new List<MenuItemModel>();
            foreach (XmlNode node in nodes)
            {
                MenuItemModel button = ParseMenuItem(node);
                button.IsButton = true;
                buttons.Add(button);
            }
            return buttons;
        }

        public void Dispose()
        {
            _conn.Close();
        }
    }
}
