using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.Configuration;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Design;


public partial class upload : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        string ruta =  WebConfigurationManager.AppSettings["ruta"];

        try
        {
            for (int i = 0; i < Request.Files.Count; i++)
            {
                var file = Request.Files[i];
                var fileName = Path.GetFileName(file.FileName);                

                var carpeta = Request["carpeta"];
                //var folder = Path.Combine(Server.MapPath("~/uploads"), carpeta);
                var folder = Path.Combine(ruta, carpeta);
                if (!Directory.Exists(folder))
                {
                    Directory.CreateDirectory(folder);
                }

                var path = Path.Combine(folder, fileName);
                file.SaveAs(path);

               

                
                /*
                var fileStream = File.Create(path);
                file.InputStream.Seek(0, SeekOrigin.Begin);
                file.InputStream.CopyTo(fileStream);
                fileStream.Close();
                file.InputStream.Close();
                fileStream.Dispose();
                file.InputStream.Dispose();
                 * */

                
                Bitmap sourceBmp = new Bitmap(path);
                
                Size targetSize;
                if (sourceBmp.Width >= sourceBmp.Height)
                {
                    if (sourceBmp.Width > 120)
                    {
                        //dismimuimos el tamaño a 120 de ancho
                        targetSize = new Size(120, sourceBmp.Height * 120 / sourceBmp.Width);
                    } 
                    else {
                        targetSize = new Size(sourceBmp.Width, sourceBmp.Height);
                    }
                }
                else
                {
                    if (sourceBmp.Height > 120)
                    {
                        //dismimuimos el tamaño a 120 de alto
                        targetSize = new Size(sourceBmp.Width * 120 / sourceBmp.Height, 120);
                    }                    
                    else {
                        targetSize = new Size(sourceBmp.Width, sourceBmp.Height);
                    }
                }

                Bitmap targetBmp = new Bitmap(sourceBmp, targetSize);
                
                ImageCodecInfo codecInfo = GetEncoderInfo("image/png");
                Encoder encoder = Encoder.Quality;
                EncoderParameters encoderParams = new EncoderParameters(1);
                long compression = 85;
                EncoderParameter encoderParam = new EncoderParameter(encoder, compression);
                encoderParams.Param[0] = encoderParam;

                //var pathDestino = Path.Combine(Server.MapPath("~/uploads"), "m_" + fileName);
                var pathDestino = Path.Combine(folder, "m_" + fileName);
                targetBmp.Save(pathDestino, codecInfo, encoderParams);

                sourceBmp.Dispose();
            }

        }
        catch (Exception ex)
        {
            string mensaje = ex.Message;
        }

       
    }


    private static ImageCodecInfo GetEncoderInfo(String mimeType)
    {
        int j;
        ImageCodecInfo[] encoders;
        encoders = ImageCodecInfo.GetImageEncoders();
        for (j = 0; j < encoders.Length; ++j)
        {
            if (encoders[j].MimeType == mimeType)
                return encoders[j];
        }
        return null;
    }



}