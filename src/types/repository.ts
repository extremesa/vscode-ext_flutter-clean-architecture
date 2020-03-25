import { Uri, window } from "vscode";
import { getTargetDirectory, createDirectory } from "../extension";
import * as changeCase from "change-case";
import { existsSync, writeFile } from "fs";
import * as path from 'path';
import { isNameValid, promptForName, promptForJson } from "./common";
import EntityGenerator from "./entity";


export default class RepositoryGenerator{
    name: string;
    
    constructor(name:string){
        this.name = name;
    }

    static async newCommaned(uri: Uri) {
        let name = await promptForName("Repository");
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

            await (new RepositoryGenerator(`${name}`).generate(targetDirectory));
            window.showInformationMessage(`Successfully Generated ${pascalName} UseCase`);
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
            this.createTemplate(targetDirectory)
        ]);
    }

    createTemplate(targetDirectory: string) {
        const snakeName = changeCase.snakeCase(this.name.toLowerCase());
        const targetPath = path.join(targetDirectory, `${snakeName}.dart`);
    
        if (existsSync(targetPath)) {
            throw Error(`${snakeName}.dart already exists`);
        }
        
        return new Promise(async (resolve, reject) => {
            writeFile(targetPath, this.getTemplate(), "utf8", (error: any) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }
    
    getTemplate(): string {
        const pascalName = changeCase.pascalCase(this.name.toLowerCase());
        
        return `abstract class ${pascalName}{

}`;
    }
}
