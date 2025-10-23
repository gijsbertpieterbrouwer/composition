/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiBaseUrl, FilesBaseUrl } from "@/services/urls";
import useUserStore from "@/store/user";

export function getDownloadUrl(fileId: string, extension?: string) {
  if (!fileId) { return ""; }


  if (fileId.startsWith('11111111-0000')) {
    const ext = extension ? `.${extension}` : "";
    return `${FilesBaseUrl()}/default/${fileId}${ext}`;
  }


  const tenantId = useUserStore().tenantId;
  return `${ApiBaseUrl()}/filedata/downloads/get/${tenantId}/${fileId}/avatar`;
}

export function calcSizeString(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function acceptableAvatarFormats(): string[] {
  return acceptableImageFormats();
}

export function acceptableChatWidgetImageFormats(): string[] {
  return [".jpg", ".jpeg", ".png", ".svg"];
}


export function acceptableImageFormats(): string[] {
  return [".jpg", ".jpeg", ".png"];
}


export function getPreviewableImageExtensions(): string[] {
  return ["jpeg", "jpg", "gif", "bmp", "png"];
}

export function getPreviewableAudioExtensions(): string[] {
  return ["ogg", "oga", "mpeg", "mp3", "wav", "aac"];
}

export function getPreviewableVideoExtensions() {
  return ["avi", "wmv", "mov", "mp4", "webm"];
}

export function getPreviewableExtensions(): string[] {
  let list: string[] = [];
  list = list.concat(getPreviewableImageExtensions());
  list = list.concat(getPreviewableAudioExtensions());
  list = list.concat(getPreviewableVideoExtensions());
  return list;
}


export function pathHasPreviewer(path: string | object, formats?: string[]): boolean {
  if (typeof (path) != "string") { return false; }

  formats = formats || getPreviewableExtensions();
  const extension = path.split('.').pop().toLowerCase();

  if (formats.some(p => p == extension)) {
    return true;
  } else {
    return false;
  }

}

export function isImageFormat(fileName: string): boolean {
  return acceptableImageFormats().some(p => fileName.endsWith(p));
}

export function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = () => {
      const width = image.width;
      const height = image.height;

      if (width <= maxWidth && height <= maxHeight) {
        resolve(file);
      }

      let newWidth;
      let newHeight;

      if (width > height) {
        newHeight = height * (maxWidth / width);
        newWidth = maxWidth;
      } else {
        newWidth = width * (maxHeight / height);
        newHeight = maxHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;

      const context = canvas.getContext('2d');

      context.drawImage(image, 0, 0, newWidth, newHeight);

      canvas.toBlob(resolve, file.type);
    };
    image.onerror = reject;
  });
}


export function tableToExcel() {
  const uri = 'data:application/vnd.ms-excel;base64,'
    , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><?xml version="1.0" encoding="UTF-8" standalone="yes"?><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
    , base64 = function (s: string) { return window.btoa(unescape(encodeURIComponent(s))) }
    , format = function (s: string, c: any) { return s.replace(/{(\w+)}/g, function (m: any, p: any) { return c[p]; }) }
  return function (tableDomId: string, name: string) {
    const tableDom = document.getElementById(tableDomId)
    const ctx = { worksheet: name || 'Worksheet', table: tableDom.innerHTML }
    window.location.href = uri + base64(format(template, ctx))
  }
}