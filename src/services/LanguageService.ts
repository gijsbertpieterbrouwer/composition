import * as LOG from "@/log";
import { debugApi } from "@/log";
import { Get } from "@/services/Server";
import URL from "@/services/urls";
import { LanguagePack, LanguageType } from "@/TickApi";


export async function getLanguagePack(language: LanguageType) {
    try {
        const response = await Get<LanguagePack>(URL.getLanguageItems + `/${language}`);
        debugApi(`[Language:Fetch]Get language pack}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching language-pack', { error });
        throw new Error(`Error while fetching language-pack`);
    }
}
