import * as LOG from '@/log';
import { debugApi } from '@/log';
import { notifySaved } from '@/notify';
import { Delete, Get, Post } from "@/services/Server";
import URL from "@/services/urls";

import { AddKnowledgeBaseArticleRequest, AddKnowledgeBaseRequest, ObjectRemovalProgress, TickKnowledgeBase, TickKnowledgeBaseArticle, TickKnowledgeBaseArticleSummary, TickKnowledgeBaseSummary } from "@/TickApi";

export async function getAllKnowledgeBaseSummaries(workspaceId: string): Promise<TickKnowledgeBaseSummary[]> {
  try {
    const response = await Get<TickKnowledgeBaseSummary[]>(URL.getKnowledgebases + `/${workspaceId}`);
    debugApi(`[Knowledge_bases:FETCH]get all`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while retrieving Knowledge_bases', error);
    throw new error();
  }
}

export async function getKnowledgeBase(id: string): Promise<TickKnowledgeBase> {
  try {
    const response = await Get<TickKnowledgeBase>(URL.getKnowledgebase + `/${id}`);
    debugApi(`[Knowledge_base:FETCH]get definition`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while retrieving Knowledge_base', error);
    throw new error();
  }
}



export async function addEmptyKnowledgeBase(req: AddKnowledgeBaseRequest): Promise<TickKnowledgeBaseSummary> {
  try {
    const response = await Post<TickKnowledgeBaseSummary>(URL.addKnowledgebase, req);
    debugApi(`[Knowledge_base:ADD]Create task definition`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while creating definition', error);
    throw new error();
  }
}

export async function updateKnowledgeBase(request: TickKnowledgeBase): Promise<TickKnowledgeBase> {
  try {
    const response = await Post<TickKnowledgeBase>(URL.updateKnowledgebase, request);
    notifySaved();
    debugApi(`[Knowledge_base:UPDATE]Update a definition`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while updating definition', error);
    return null;
  }
}

export async function deleteKnowledgeBase(id: string): Promise<ObjectRemovalProgress> {
  try {
    const response = await Delete<ObjectRemovalProgress>(URL.deleteKnowledgeBase + `/${id}`);
    debugApi(`[Knowledge_base:Delete]Delete a definition`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while deleting definition', error);
    return null;
  }
}

export async function getKnowledgeBaseArticles(id: string): Promise<TickKnowledgeBaseArticleSummary[]> {
  try {
    const response = await Get<TickKnowledgeBaseArticleSummary[]>(URL.getKnowledgebaseArticles + `/${id}/articles`);
    debugApi(`[Knowledge_base_articles:FETCH]get definition`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while retrieving Knowledge_base_articles', error);
    throw new error();
  }
}



export async function addEmptyKnowledgeBaseArticle(req: AddKnowledgeBaseArticleRequest): Promise<TickKnowledgeBaseArticleSummary> {
  try {
    const response = await Post<TickKnowledgeBaseArticleSummary>(URL.addKnowledgebaseArticle, req);
    debugApi(`[Knowledge_base:ADD Article]Create task definition`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while creating definition', error);
    throw new error();
  }
}

export async function getKnowledgeBaseArticle(id: string): Promise<TickKnowledgeBaseArticle> {
  try {
    const response = await Get<TickKnowledgeBaseArticle>(URL.getKnowledgebaseArticle + `/${id}`);
    debugApi(`[Knowledge_base:FETCH]get definition`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while retrieving Knowledge_base', error);
    throw new error();
  }
}

export async function updateKnowledgeBaseArticle(request: TickKnowledgeBaseArticle): Promise<TickKnowledgeBaseArticle> {
  try {
    const response = await Post<TickKnowledgeBaseArticle>(URL.updateKnowledgebaseArticle, request);
    notifySaved();
    debugApi(`[Knowledge_base:UPDATE Article]Update a definition`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while updating definition', error);
    return null;
  }
}

export async function deleteKnowledgeBaseArticle(id: string): Promise<unknown> {
  try {
    const response = await Delete<unknown>(URL.deleteKnowledgeBaseArticle + `/${id}`);
    debugApi(`[Knowledge_base:Delete article]Delete a article`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while deleting definition', error);
    return null;
  }
}
