<%@ WebHandler Language="c#" Class="ImageCropper" Debug="true" %>
using System;
using System.Web;
using System.Drawing;
using System.IO;

public class ImageCropper : IHttpHandler
{

#region IHttpHandler 成员

public void ProcessRequest(HttpContext context)
{
	string ImgPath = Convert.ToString(context.Request["p"]);
	int PointX = Convert.ToInt32(context.Request["x"]);
	int PointY = Convert.ToInt32(context.Request["y"]);
	int CutWidth = Convert.ToInt32(context.Request["w"]);
	int CutHeight = Convert.ToInt32(context.Request["h"]);
	int PicWidth = Convert.ToInt32(context.Request["pw"]);
	int PicHeight = Convert.ToInt32(context.Request["ph"]);

	context.Response.ContentType = "image/jpeg";
	ShowImage(HttpContext.Current.Server.MapPath(ImgPath), PointX, PointY, CutWidth, CutHeight, PicWidth, PicHeight).WriteTo(context.Response.OutputStream);
}

private MemoryStream ShowImage(string path, int PointX, int PointY, int CutWidth, int CutHeight, int PicWidth, int PicHeight)
{
	Image image = Image.FromFile(path);
	Bitmap bm = new Bitmap(CutWidth, CutHeight, System.Drawing.Imaging.PixelFormat.Format24bppRgb);
	Graphics graphics = Graphics.FromImage(bm);
	graphics.DrawImage(image, new Rectangle(0, 0, CutWidth, CutHeight), PointX * image.Width / PicWidth, PointY * image.Height / PicHeight, CutWidth * image.Width / PicWidth, CutHeight * image.Height / PicHeight, GraphicsUnit.Pixel);
	int a = path.LastIndexOf('.');
	int b = path.LastIndexOf('\\');
	string _newPic = path.Substring(0, b) + "\\new_" + DateTime.Now.ToFileTimeUtc().ToString("X") + ".jpg";
	bm.Save(_newPic, System.Drawing.Imaging.ImageFormat.Jpeg);
	MemoryStream ms = new MemoryStream();
	bm.Save(ms, System.Drawing.Imaging.ImageFormat.Jpeg);
	image.Dispose();
	graphics.Dispose();
	bm.Dispose();
	return ms;
}
public bool IsReusable
{
	get
	{
	return false;
	}
}

#endregion
}