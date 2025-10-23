import * as LOG from "@/log";
import { debugApi } from "@/log";
import { notifySaved } from "@/notify";
import { Get, Post } from "@/services/Server";
import URL from "@/services/urls";
import useUserStore from "@/store/user";
import { AddTeamRequest, AddUserRequest, MetaDataItem, TickDashboard, TickManagerTeamData, TickManagerUserData, TickUserAvatarStyleGroup, UpdateAdminRequest, UpdateMyUserRequest, UserSummary, UserTypeEnum } from "@/TickApi";


export async function getUsers(workspaceId: string) {
    try {
        const response = await Get<UserSummary[]>(URL.getUsers + `/${workspaceId}`);
        debugApi(`[USER:Fetch]Get users => ${response.data.length} found`);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching users', { workspaceId, error });
        throw new Error(`Error while fetching users ${workspaceId}: ${JSON.stringify(error)}`);
    }
}

export async function getUserDetails(workspaceId: string, id: string) {
    try {
        const response = await Get<TickManagerUserData>(URL.getUser.toString() + `/${workspaceId}/${id}`);
        debugApi(`[USER:Fetch]Get users details=> ${response.data.name}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching user', { id, error });
        throw new Error(`Error while fetching details for user ${id}: ${JSON.stringify(error)}`);
    }
}

export async function updateMyUser(def: UpdateMyUserRequest): Promise<unknown> {
    debugApi(`[USER:Update]Update me`);
    try {
        const response = await Post<UpdateMyUserRequest>(URL.updateMyUser.toString(), def);
        notifySaved();
        return response.data;
    } catch (error) {
        LOG.error('Error while updating user', { error });
        throw new Error(`Error while updating a user ${JSON.stringify(error)}`);
    }
}

export async function updateUser(def: TickManagerUserData): Promise<TickManagerUserData> {
    debugApi(`[USER:Update]Update user ${def.id} new name=> ${def.name}`);
    try {
        const response = await Post<TickManagerUserData>(URL.updateUser.toString(), def);
        notifySaved();
        return response.data;
    } catch (error) {
        LOG.error('Error while updating user', { error });
        throw new Error(`Error while updating a user ${JSON.stringify(error)}`);
    }
}

export async function updateUserAdmin(def: UpdateAdminRequest): Promise<unknown> {
    debugApi(`[USER:Update]Update user admin`);
    try {
        const response = await Post<unknown>(URL.updateUserAdmin.toString(), def);
        notifySaved();
        return response.data;
    } catch (error) {
        LOG.error('Error while updating user admin rights', { error });
        throw new Error(`Error while updating a user ${JSON.stringify(error)}`);
    }
}

export async function addUser(def: AddUserRequest): Promise<MetaDataItem> {
    debugApi(`[USER:Create]Create user ${def.name}`);
    try {
        const response = await Post<MetaDataItem>(URL.createUser.toString(), def);
        return response.data;
    } catch (error) {
        LOG.error('Error while creating user', { error });
        throw new Error(`Error while creating a user ${JSON.stringify(error)}`);
    }
}

export async function deleteUser(id: string): Promise<unknown> {
    debugApi(`[USER:Delete]Delete user ${id}`);
    try {
        const response = await Post<unknown>(URL.deleteUser.toString() + `/${id}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while deleting user', { error });
        throw new Error(`Error while deleting a user ${JSON.stringify(error)}`);
    }
}


export async function adminLogoutUser(userId: string): Promise<unknown> {
    debugApi(`[USER:Logout]logout user ${userId}`);
    try {
        const response = await Post<unknown>(URL.adminLogoutUser.toString() + `/${userId}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while logging out user', { error });
        throw new Error(`Error while logging out a user ${JSON.stringify(error)}`);
    }
}

//TEAMS

export async function getTeams(workspaceId: string) {
    try {
        const response = await Get<UserSummary[]>(URL.getTeams + `/${workspaceId}`);
        debugApi(`[TEAMS:Fetch]Get teams => ${response.data.length} found`);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching teams', { workspaceId, error });
        throw new Error(`Error while fetching teams ${workspaceId}: ${JSON.stringify(error)}`);
    }
}
export async function getTeamDetails(id: string) {
    try {
        const response = await Get<TickManagerTeamData>(URL.getTeam.toString() + `/${id}`);
        debugApi(`[TEAMS:Fetch]Get team details=> ${response.data.name}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching team', { id, error });
        throw new Error(`Error while fetching details for team ${id}: ${JSON.stringify(error)}`);
    }
}


export async function updateTeam(def: TickManagerTeamData): Promise<TickManagerTeamData> {
    debugApi(`[TEAMS:Update]Update team ${def.id} new name=> ${def.name}`);
    try {
        const response = await Post<TickManagerTeamData>(URL.updateTeam.toString(), def);
        notifySaved();
        return response.data;
    } catch (error) {
        LOG.error('Error while updating user', { error });
        throw new Error(`Error while updating a user ${JSON.stringify(error)}`);
    }
}

export async function addTeam(def: AddTeamRequest): Promise<MetaDataItem> {
    debugApi(`[TEAMS:Create]Create team ${def.name}`);
    try {
        const response = await Post<MetaDataItem>(URL.createTeam.toString(), def);
        return response.data;
    } catch (error) {
        LOG.error('Error while creating team', { error });
        throw new Error(`Error while creating a team ${JSON.stringify(error)}`);
    }
}

export async function deleteTeam(id: string): Promise<unknown> {
    debugApi(`[TEAMS:Delete]Delete user ${id}`);
    try {
        const response = await Post<unknown>(URL.deleteTeam.toString() + `/${id}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while deleting team', { error });
        throw new Error(`Error while deleting a team ${JSON.stringify(error)}`);
    }
}


export async function getAvatarStyles(type: UserTypeEnum): Promise<TickUserAvatarStyleGroup[]> {
    debugApi(`[AVATAR:STyles]get avatar style options`);
    try {
        const response = await Get<TickUserAvatarStyleGroup[]>(URL.getAvatarStyles.toString() + `/${type}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while retrieving styles', { error });
        throw new Error(`Error while retrieving styles ${JSON.stringify(error)}`);
    }
}


export async function getUserDashboardSmall(userId: string): Promise<TickDashboard> {
    debugApi(`[User:dashboard]get avatar style options`);
    try {
        const response = await Get<TickDashboard>(URL.getUserDashboardSmall.toString() + `/${useUserStore().activeWorkspaceId}/${userId}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while retrieving styles', { error });
        throw new Error(`Error while retrieving styles ${JSON.stringify(error)}`);
    }
}