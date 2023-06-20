using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.Configuration;

public partial class autenticar : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        string usuario = User.Identity.Name;

        if (usuario.LastIndexOf('\\') != -1)
        {
            usuario = usuario.Substring(usuario.LastIndexOf('\\') + 1);
        }

        //string script = string.Format("localStorage.usuario= '{0}';", usuario);
        //ClientScript.RegisterClientScriptBlock(this.GetType(), "key", script, true);

        Response.Redirect(WebConfigurationManager.AppSettings["RutaWeb"] + "?usuario=" + usuario);
    }
}