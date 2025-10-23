import * as LOG from '@/log';
import { debugApi } from '@/log';
import { notifySaved } from '@/notify';
import { Delete, Get, Post } from "@/services/Server";
import URL from "@/services/urls";

import { AddTaskDefinitionRequest, FormValidationResponse, GetTasksRequest, GetTasksResponse, SetTaskAssignmentsRequest, TickCreateTaskInstanceRequest, TickTaskDefinition, TickTaskInstanceSummary, TickTaskWorkingData } from "@/TickApi";



export async function getTasks(workspaceId: string, req: GetTasksRequest): Promise<GetTasksResponse> {

  try {
    const response = await Post<GetTasksResponse>(URL.getTasks + `/${workspaceId}`, req);
    debugApi(`[TASKS:FETCH]Retrieved ${response.data.tasks.length} task summaries`)
    return response.data;
  } catch (err) {
    // TODO: services should throw errors
    LOG.error('Error while fetching tasks', { workspaceId, err });
    return null;
  }
}


// export async function getTasks(workspaceId: string) {
//   try {
//     const response = await Get<TickTaskInstanceSummary[]>(URL.getTasks + `/${workspaceId}`);
//     debugApi(`[TASKS:FETCH]Retrieved ${response.data.length} task summaries`)
//     return response.data;
//   } catch (error) {
//     // TODO: services should throw errors
//     LOG.error('Error while fetching tasks', { workspaceId, error });
//     return [];
//   }
// }

export async function getTask(id: string) {
  try {
    const response = await Get<TickTaskWorkingData>(URL.getTask + `/${id}`);
    debugApi(`[TASKS:FETCH]Retrieved task`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while fetching task', { id, error });
    return {};
  }
}

export async function addTask(data: TickCreateTaskInstanceRequest): Promise<TickTaskInstanceSummary> {
  try {
    const response = await Post<TickTaskInstanceSummary>(URL.addTask, data);
    debugApi(`[TASKS:Create]Create task`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while creating task', { error });

  }
}

export async function updateTask(id: string, data: TickTaskWorkingData) {
  try {
    const response = await Post<FormValidationResponse>(URL.updateTask + `/${id}`, data);
    debugApi(`[TASKS:UPDATE]Update task`);
    notifySaved();
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while updating task', { id, error });
    return {};
  }
}

export async function getTaskDefinition(id: string): Promise<TickTaskDefinition> {

  try {
    const response = await Get<TickTaskDefinition>(URL.getTaskDefinition + `/${id}`);
    debugApi(`[TASKS:FETCH]get task definition`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while retrieving task', error);
    throw new error();
  }
}

export async function deleteTaskDefinition(id: string): Promise<unknown> {

  try {
    const response = await Delete<unknown>(URL.deleteTaskDefinition + `/${id}`);
    debugApi(`[TASKS:DELETE]delete definition ${id}`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while deleting task', error);
    throw new error();
  }
}


export async function addTaskDefinition(request: AddTaskDefinitionRequest): Promise<TickTaskDefinition> {

  try {
    const response = await Post<TickTaskDefinition>(URL.addTaskDefinition, request);
    debugApi(`[TASKS:ADD]Create new task definition`);
    notifySaved();
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while creating task', error);
    throw new error();
  }
}

export async function updateTaskDefinition(request: TickTaskDefinition): Promise<TickTaskDefinition> {
  try {
    const response = await Post<TickTaskDefinition>(URL.updateTaskDefinition, request);
    debugApi(`[TASKS:UPDATE]Update a task definition`);
    notifySaved();
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while updating task', error);
    return null;
  }
}


export async function updateTaskInstanceAssignments(request: SetTaskAssignmentsRequest): Promise<TickTaskDefinition> {
  try {
    const response = await Post<TickTaskDefinition>(URL.updateTaskAssignments, request);
    debugApi(`[TASKS:UPDATE]Update a task assignments`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while updating task assignments', error);
    return null;
  }
}