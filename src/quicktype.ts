"use strict";

import * as vscode from "vscode";
import {
    quicktype,
    languageNamed,
    SerializedRenderResult,
    InputData,
    jsonInputForTargetLanguage,
    RendererOptions,
    Options,
    inferenceFlagNames
} from "quicktype-core";

const configurationSection = "quicktype";

function jsonIsValid(json: string) {
    try {
        JSON.parse(json);
    } catch (e) {
        return false;
    }
    return true;
}

export async function runEntityQuicktype(
    content: string,
    topLevelName: string,
    indentation: string | undefined,
    additionalLeadingComments: string[]
): Promise<SerializedRenderResult> {
    const configuration = vscode.workspace.getConfiguration(configurationSection);
    const rendererOptions: RendererOptions = {};
    const lang = languageNamed("dart")!;

    rendererOptions["just-types"] = "true";

    const inputData = new InputData();
    await inputData.addSource("json", { name: topLevelName, samples: [content] }, () =>
        jsonInputForTargetLanguage(lang)
    );

    const options: Partial<Options> = {
        lang: lang,
        inputData,
        leadingComments: additionalLeadingComments,
        rendererOptions,
        indentation,
        inferMaps: configuration.inferMaps,
        inferEnums: configuration.inferEnums,
        inferDateTimes: configuration.inferDateTimes,
        inferIntegerStrings: configuration.inferIntegerStrings
    };
    
    for (const flag of inferenceFlagNames) {
        if (typeof configuration[flag] === "boolean") {
            options[flag] = configuration[flag];
        }
    }

    return await quicktype(options);
}

export async function runModelQuicktype(
    content: string,
    topLevelName: string,
    indentation: string | undefined,
    additionalLeadingComments: string[]
): Promise<SerializedRenderResult> {
    const configuration = vscode.workspace.getConfiguration(configurationSection);
    const rendererOptions: RendererOptions = {};
    const lang = languageNamed("dart")!;

    const inputData = new InputData();
    await inputData.addSource("json", { name: topLevelName, samples: [content] }, () =>
        jsonInputForTargetLanguage(lang)
    );

    const options: Partial<Options> = {
        lang: lang,
        inputData,
        leadingComments: additionalLeadingComments,
        rendererOptions,
        indentation,
        inferMaps: configuration.inferMaps,
        inferEnums: configuration.inferEnums,
        inferDateTimes: configuration.inferDateTimes,
        inferIntegerStrings: configuration.inferIntegerStrings
    };
    
    for (const flag of inferenceFlagNames) {
        if (typeof configuration[flag] === "boolean") {
            options[flag] = configuration[flag];
        }
    }

    return await quicktype(options);
}