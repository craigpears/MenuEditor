using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using Esteiro.MenuEditor.DataAccess;

namespace Esteiro.MenuEditor.TestProject
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void removeOverlayItem_Click(object sender, EventArgs e)
        {
            GoldVisionDataAccess da = new GoldVisionDataAccess();
            da.RemoveLineFromOverlay("menueditor", txtOverlayItemToRemove.Text);
        }
    }
}
