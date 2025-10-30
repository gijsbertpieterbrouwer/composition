import { createPinia } from "pinia";
import createPersistedState from "pinia-plugin-persistedstate";

const pinia = createPinia();
pinia.use(createPersistedState);

export default pinia;

export enum TickStorageEnum {
    tickLocalStorage,
    tickSessionStorage,
}

import { PiniaStorageType, TickSessionStorage } from "../helpers/piniaStatehelper";
import { AppStorageKeyPrefix } from "../services/urls";
import useUserStore from '../store/user';

export const getTickStorage = (storageType: PiniaStorageType, ignoreWorkspaceId?: boolean) => {
    return new TickSessionStorage({
        ignoreWorkspaceId: ignoreWorkspaceId,
        getWorkspaceId: () => useUserStore().activeWorkspaceId || 'default', // Safe here
        storageType, // StorageType.Session or StorageType.Local
        prefix: AppStorageKeyPrefix(),
    });
};