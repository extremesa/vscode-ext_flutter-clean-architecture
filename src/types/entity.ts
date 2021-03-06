import { Uri, window } from "vscode";
import { getTargetDirectory, createDirectory } from "../extension";
import * as changeCase from "change-case";
import { existsSync, writeFile } from "fs";
import * as path from 'path';
import { isNameValid, promptForName, promptForJson } from "./common";
import { runEntityQuicktype } from "../quicktype";
import ModelGenerator from "./model";


export default class EntityGenerator{
    name: string;
    json: string;
    
    constructor(name: string, json: string){
        this.name = name;
        this.json = json;
    }

    static async newCommaned(uri: Uri) {
        let name = await promptForName("Entity")!;
        let json = await promptForJson();

        let targetDirectory = '';
    
        if (!isNameValid(name)) {
            window.showErrorMessage('The name must not be empty');
            return;
        }
    
        try {
            targetDirectory = await getTargetDirectory(uri);
        } catch (error) {
            window.showErrorMessage(error.message);
        }
    
        const pascalName = changeCase.pascalCase(`${name}`.toLowerCase());
        try {
            await (new EntityGenerator(`${name}`,`${json}`)).generate(targetDirectory);
            window.showInformationMessage(`Successfully Generated ${pascalName} Entity`);
        } catch (error) {
            window.showErrorMessage(`Error: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        }
    }
    
    async generate(targetDirectory: string) {
        const directoryPath = path.join(targetDirectory, '');
        if (!existsSync(directoryPath)) {
            await createDirectory(directoryPath);
        }
    
        await Promise.all([
            (new ModelGenerator(`${this.name} model`, this.json)).generate(this.getModelsPath(targetDirectory)),
            this.createTemplate(targetDirectory),
        ]);
    }

    getModelsPath(targetDirectory: string): string {
        return targetDirectory.replace("entity","entities").replace("domain","data");
    }
    
    createTemplate(targetDirectory: string) {
        const snakeName = changeCase.snakeCase(this.name.toLowerCase());
        const targetPath = path.join(targetDirectory, `${snakeName}.dart`);
    
        if (existsSync(targetPath)) {
            throw Error(`${snakeName}.dart already exists`);
        }
        
        return new Promise(async (resolve, reject) => {
            writeFile(targetPath, await this.getTemplate(), "utf8", (error: any) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }
    
    
    async getTemplate(): Promise<string> {
        const pascalName = changeCase.pascalCase(this.name.toLowerCase());
        var result = await runEntityQuicktype(this.json,this.name,"  ",[]);
        const text = [
            "import 'package:equatable/equatable.dart';",
            "",
            ...result.lines
        ].join("\n");

        return text.replace(`${pascalName} {`,`${pascalName} extends Equatable {
  @override
  List<Object> get props => [];`);
        
        return `import 'package:equatable/equatable.dart';
      
        class ${pascalName} extends Equatable {
      
          ${pascalName}({
      
          });
      
          @override
          List<Object> get props => [];
        }`;
    }
}
