import { calcSizeString, isImageFormat, resizeImage } from "@/helpers/fileHelper";
import * as LOG from "@/log";
import { debugApi } from "@/log";
import { notifySaved } from "@/notify";
import { Delete, Get, Post } from "@/services/Server";
import URL from "@/services/urls";
import useFilesStore, { UploadableFile } from "@/store/files";
import {
  FileLink,
  FileSourceType,
  TickWorkspaceFile,
} from "@/TickApi";
import { AxiosRequestConfig } from "axios";

export async function getFileDetails(id: string) {
  try {
    const response = await Get<TickWorkspaceFile>(
      URL.getFile.toString() + `/${id}`
    );
    debugApi(
      `[Files:Fetch]Get file with with id: ${id} => ${response.data.name} `
    );
    return response.data;
  } catch (error) {
    LOG.error("Error while fetching file", { id, error });
    throw new Error(
      `Error while fetching details for file ${id}: ${JSON.stringify(error)}`
    );
  }
}

export async function createFile(
  file: UploadableFile,
  workspaceid: string
): Promise<TickWorkspaceFile> {
  debugApi(`[Files:Upload]Upload file ${file.name} `);
  try {
    const formData = new FormData();
    formData.append("file", file.file);

    useFilesStore().setUploadProgress(file.id, 0);

    const uploadConfig: AxiosRequestConfig = {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.ceil(
          (progressEvent.loaded / (progressEvent.total ?? 1)) * 100
        );
        useFilesStore().setUploadProgress(file.id, percentCompleted);
      },
    };

    const response = await Post<TickWorkspaceFile>(
      URL.createFile.toString() + `/${workspaceid}`,
      formData,
      uploadConfig
    );
    return response.data;
  } catch (error) {
    LOG.error("Error while creating file", { error });
    throw new Error(`Error while creating a file ${JSON.stringify(error)}`);
  }
}

export async function createFileData(file: UploadableFile, type: FileSourceType): Promise<FileLink> {
  debugApi(`[Files:Upload avatar]Upload file ${file.name} `);

  try {

    let fileData: Blob = file.file;
    if (isImageFormat(file.name)) {

      switch (type) {
        case FileSourceType.InternalAvatar:
        case FileSourceType.CommunicatorAvatar:
          debugApi(`[Files:RESIZE]Resizing avatar ${file.name} `);
          resizeImage(file.file, 400, 400).then((d) => {
            fileData = d;
            debugApi(`[Files:RESIZE]resize avatar complete, from ${calcSizeString(file.file.size, 2)} to ${calcSizeString(d.size, 2)}`);
          })
          break;
        case FileSourceType.Attachment:
          debugApi(`[Files:RESIZE]Resizing attachment ${file.name} `);
          resizeImage(file.file, 1000, 1000).then((d) => {
            fileData = d;
            debugApi(`[Files:RESIZE]resize attachment complete, from ${calcSizeString(file.file.size, 2)} to ${calcSizeString(d.size, 2)}`);
          })
          break;
        default:
        // do nothing for other types of files
      }
    }

    const formData = new FormData();
    formData.append("file", fileData);

    useFilesStore().setUploadProgress(file.id, 0);

    const uploadConfig: AxiosRequestConfig = {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.ceil((progressEvent.loaded / (progressEvent.total ?? 1)) * 100);
        useFilesStore().setUploadProgress(file.id, percentCompleted);
      },
    };

    const response = await Post<FileLink>(
      URL.uploadFileData.toString() + `/${type}`,
      formData,
      uploadConfig
    );
    return response.data;
  } catch (error) {
    LOG.error("Error while creating avatar file", { error });
    throw new Error(
      `Error while creating a avatar file ${JSON.stringify(error)}`
    );
  }
}

export async function updateFile(
  def: TickWorkspaceFile
): Promise<TickWorkspaceFile> {
  debugApi(`[Files:Update]Update file ${def.id} and newname: ${def.name} `);
  try {
    const response = await Post<TickWorkspaceFile>(
      URL.updateFile.toString(),
      def
    );
    notifySaved();
    return response.data;
  } catch (error) {
    LOG.error("Error while updating file", { error });
    throw new Error(`Error while updating a file ${JSON.stringify(error)}`);
  }
}

export async function deleteFile(id: string): Promise<unknown> {
  debugApi(`[Files:Delete]Delete file ${id} `);
  try {
    const response = await Delete<unknown>(URL.deleteFile.toString() + `/${id}`);
    return response.data;
  } catch (error) {
    LOG.error("Error while deleting file", { error });
    throw new Error(`Error while deleting a file ${JSON.stringify(error)}`);
  }
}
