
function jsonParseUntilUnescaped(escapedJson: string): string {
    if (!escapedJson || escapedJson == "null") { escapedJson = "{}" }
    let parsedJson: string;
    try {
        parsedJson = JSON.parse(escapedJson)
    } catch (error) {
        return escapedJson;
    }

    const stringifiedParsedJson = parsedJson.toString();

    // eslint-disable-next-line no-useless-escape
    if (stringifiedParsedJson.includes('\"')) {
        return jsonParseUntilUnescaped(stringifiedParsedJson)
    }

    return parsedJson;
}

function normalizedJson(input: string): string | null {
    let r = input as string;
    if (!r) { return null; }
    r = jsonParseUntilUnescaped(r);
    return r;
}



export function asJsonObject(input: string | object): object | null {
    if (!input || !input) { return null; }
    if (typeof (input) == 'object') {
        return input;
    }

    try {
        const r = normalizedJson(input as string);

        if (typeof (r) == 'object') {
            return r;
        }

        if (typeof (r) == 'object') {
            return r;
        }


        const jsonObj = JSON.parse(r as string);
        return jsonObj;
    } catch (error) {
        return null;
    }

}
