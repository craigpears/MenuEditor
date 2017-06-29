using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Text;
using System.Xml;
using System.Web;

namespace Esteiro.MenuEditor.DataAccess
{
    public static class Registry
    {
        public static string GetValue(string hklmKey, string name)
        {
            return GetValue(hklmKey, name, false);
        }

        public static string GetValue(string hklmKey, string name, bool failOnError)
        {
            try
            {
                return (string)Microsoft.Win32.Registry.LocalMachine.OpenSubKey(hklmKey).GetValue(name);
            }
            catch (Exception ex)
            {
                if (failOnError) throw ex;
                return "";
            }
        }

        public static Microsoft.Win32.RegistryKey GetKey(string hklmKey, bool writeable)
        {
            try
            {
                return Microsoft.Win32.Registry.LocalMachine.OpenSubKey(hklmKey, writeable);
            }
            catch (Exception ex)
            {
                throw new Exception(string.Format("There was a problem getting the registry hive for '{0}': {1}", hklmKey, ex.Message));
            }
        }

        public static bool CheckKey(string hklmKey)
        {
            try
            {
                Microsoft.Win32.RegistryKey rk = Microsoft.Win32.Registry.LocalMachine.OpenSubKey(hklmKey);
                if (rk == null) return false;
                return true;
            }
            catch
            {
                return false;
            }
        }

        public static bool SetValue(string hklmKey, string name, string value)
        {
            return SetValue(hklmKey, name, value, false);
        }

        public static bool SetValue(string hklmKey, string name, string value, bool failOnError)
        {
            try
            {
                Microsoft.Win32.Registry.LocalMachine.OpenSubKey(hklmKey, true).SetValue(name, value);
                return true;
            }
            catch (Exception ex)
            {
                if (failOnError) throw ex;
                return false;
            }
        }

    } // Registry
}
