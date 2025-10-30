/* eslint-disable @typescript-eslint/no-unused-vars */
import { _ActionsTree, _GettersTree, defineStore } from "pinia";

import { maxDetailsListItems, patchMetaDataList } from "@/helpers/arrayHelper";
import { calcSizeString } from "@/helpers/fileHelper";
import * as LOG from "@/log";
import { debug } from "@/log";
import { notifyError } from "@/notify";
import {
  createFile,
  createFileData,
  deleteFile,
  getFileDetails,
  updateFile,
} from "@/services/FilesService";
import {
  FileLink,
  FileSourceType,
  TickWorkspaceFile
} from "@/TickApi";
import { PiniaStorageType } from "../helpers/piniaStatehelper";
import { getTickStorage } from "./pinia";
import { PiniaStoragePath } from "./piniaStoragePaths";
import useUserStore from "./user";

export class UploadableFile {
  group: string;
  file: File;
  name: string;
  id: string;
  url: string;
  percentageUploaded: number;
  uploadStarted: boolean;
  errorMessage: string;

  constructor(group: string, file: File) {
    this.group = group;
    this.name = file.name;
    this.file = file;
    this.id = `${file.name}-${file.size}-${file.lastModified}-${file.type}`;
    this.url = URL.createObjectURL(file);
    this.percentageUploaded = 0;
    this.uploadStarted = false;
    this.errorMessage = "";
  }
}

interface State {
  files: TickWorkspaceFile[];
  uploadableFiles: UploadableFile[];
}

interface Getters extends _GettersTree<State> {
  all(state: State): TickWorkspaceFile[];
  getFileUpload: (state: State) => (fileId: string) => UploadableFile | null;
}

interface Actions extends _ActionsTree {
  use(): void;
  get(id: string): Promise<TickWorkspaceFile | null>;
  add(): Promise<string>;
  save(id: string): Promise<TickWorkspaceFile>;
  delete(id: string): Promise<boolean>;

  setUploadProgress(id: string, percentage: number): void;
  startUpload(group: string, newFiles: []): Promise<TickWorkspaceFile[]>;
  startUploadFileData(
    group: string,
    newFiles: [],
    type: FileSourceType
  ): Promise<FileLink[]>;

  addUploadableFiles(group: string, files: UploadableFile[]): void;
  removeUploadableFiles(group: string): void;
}

const useFilesStore = defineStore<"files", State, Getters, Actions>("files", {
  state: () => ({
    files: [],
    uploadableFiles: [],
  }),
  getters: {
    all: (state) => state.files,
    getFileUpload(state) {
      return (fileId: string) => (state.uploadableFiles as UploadableFile[]).find((p) => p.id == fileId) ?? null;
    },
  },
  actions: {
    async removeUploadableFiles(group: string) {
      debug("[FILES:Flush]", group);
      if (!group) { return; }

      this.uploadableFiles = (this.uploadableFiles as UploadableFile[]).filter(
        (p) => p.group != group
      );
    },
    addUploadableFiles(group: string, newUploadableFiles: []) {
      this.uploadableFiles = this.uploadableFiles.concat(newUploadableFiles);
    },
    fileExists(group: string, otherId: string) {
      const exists = (this.uploadableFiles as UploadableFile[]).some(
        (p) => p.id == otherId && p.group == group
      );

      return exists;
    },
    async startUploadFileData(
      group: string,
      newFiles: [],
      type: FileSourceType
    ) {
      const newUploadableFiles: UploadableFile[] = [...newFiles]
        .map((file) => new UploadableFile(group, file))
        .filter((file) => !this.fileExists(group, file.id));

      this.addUploadableFiles(group, newUploadableFiles);

      LOG.debug("Files store: start upload");
      const filesToUpload = newUploadableFiles; //this.uploadableFiles.filter(p => p.group == group) || []
      const maxFileSize = useUserStore().activeWorkspace?.maxAllowedFileSize;

      const responses = [];
      for (const file of filesToUpload) {
        // skip large uploads
        if (maxFileSize && file.file.size > maxFileSize) {
          notifyError("File too large", "The file was too large to upload.")
          LOG.warn("[File:Issue]the file was too big");
          file.errorMessage = `To big (> ${calcSizeString(maxFileSize, 2)} )`;
          continue;
        }

        const r = await createFileData(file, type);
        responses.push(r);
        LOG.debug("file uploaded");
      }

      LOG.debug("all files uploaded");

      setTimeout(() => {
        this.uploadableFiles = [];
      }, 2000);


      LOG.debug(` ${responses.length}  File responses`);
      return responses;
    },
    async startUpload(group: string, newFiles: []) {
      const responses = [];
      const newUploadableFiles = [...newFiles]
        .map((file) => new UploadableFile(group, file))
        .filter((file) => !this.fileExists(group, file.id));

      this.addUploadableFiles(group, newUploadableFiles);

      LOG.debug("Files store: start upload");
      const filesToUpload = newUploadableFiles; //this.uploadableFiles.filter(p => p.group == group) || []
      const wsId = useUserStore().activeWorkspaceId ?? "";
      const maxFileSize = useUserStore().activeWorkspace?.maxAllowedFileSize;
      for (const file of filesToUpload) {
        // skip large uploads
        if (maxFileSize && file.file.size > maxFileSize) {
          LOG.debug("[File:Issue]the file was to big");
          file.errorMessage = `To big (> ${calcSizeString(maxFileSize, 2)} )`;
          continue;
        }

        const r = await createFile(file, wsId);
        responses.push(r);
        LOG.debug("file uploaded");
      }

      return responses;
    },
    async setUploadProgress(id, percentage) {
      const uploads = (this.uploadableFiles as UploadableFile[]);
      const file = uploads.find(
        (s) => s.id === id
      ) as UploadableFile;
      if (!file) {
        return;
      }

      file.percentageUploaded = percentage;
      file.uploadStarted = true;
      // remove file upload progress after 2 sec
      if (percentage == 100) {


        setTimeout(() => {
          const index = uploads.findIndex(s => s.id === file.id);
          if (index > -1) {
            this.uploadableFiles.splice(index, 1);
          }
        }, 2000);
      }


    },
    async delete(id) {
      const progress = await deleteFile(id);

      //if (progress.removalStatus != RemovalStatus.Failed) {
      const index = (this.files as TickWorkspaceFile[]).findIndex(
        (s) => s.id === id
      );
      if (index > -1) {
        this.files.splice(index, 1);
      }
      //}

      return true;
    },
    async use() {
      this.loaded = true;
    },
    async save(id: string) {
      const item = (this.files as TickWorkspaceFile[]).find(
        (f) => f.id === id
      ) as TickWorkspaceFile;
      return await updateFile(item);
    },

    async add() {
      //const item: TickWorkspaceFile = await createFile(useUserStore().activeWorkspaceId);
      //this.files.push(item);
      //return item.id;
      return "";
    },
    async get(id): Promise<TickWorkspaceFile | null> {
      this.activeLoaded = false;
      this.activeId = id;

      if (!id) {
        return null;
      }

      const serverData = await getFileDetails(this.activeId);
      this.patch(serverData);

      return serverData;
    },
    patch(serverData: TickWorkspaceFile) {
      this.files = patchMetaDataList(serverData, this.files, maxDetailsListItems);

      // const index = (this.files as TickWorkspaceFile[]).findIndex(
      //   (s) => s.id === serverData.id
      // );
      // if (index === -1) {
      //   this.files.push(serverData);
      // } else {
      //   this.files.splice(index, 1, serverData);
      // }
    },
  },
  persist: [
    {
      pick: undefined,
      key: PiniaStoragePath.files,// "tick-files",
      storage: getTickStorage(PiniaStorageType.Session),
    },
  ],
});

export default useFilesStore;
