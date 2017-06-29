namespace Esteiro.MenuEditor.TestProject
{
    partial class Form1
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.removeOverlayItem = new System.Windows.Forms.Button();
            this.txtOverlayItemToRemove = new System.Windows.Forms.TextBox();
            this.SuspendLayout();
            // 
            // removeOverlayItem
            // 
            this.removeOverlayItem.Location = new System.Drawing.Point(176, 35);
            this.removeOverlayItem.Name = "removeOverlayItem";
            this.removeOverlayItem.Size = new System.Drawing.Size(144, 20);
            this.removeOverlayItem.TabIndex = 0;
            this.removeOverlayItem.Text = "Remove Overlay Item";
            this.removeOverlayItem.UseVisualStyleBackColor = true;
            this.removeOverlayItem.Click += new System.EventHandler(this.removeOverlayItem_Click);
            // 
            // txtOverlayItemToRemove
            // 
            this.txtOverlayItemToRemove.Location = new System.Drawing.Point(22, 35);
            this.txtOverlayItemToRemove.Name = "txtOverlayItemToRemove";
            this.txtOverlayItemToRemove.Size = new System.Drawing.Size(148, 20);
            this.txtOverlayItemToRemove.TabIndex = 1;
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(791, 494);
            this.Controls.Add(this.txtOverlayItemToRemove);
            this.Controls.Add(this.removeOverlayItem);
            this.Name = "Form1";
            this.Text = "Form1";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button removeOverlayItem;
        private System.Windows.Forms.TextBox txtOverlayItemToRemove;
    }
}

