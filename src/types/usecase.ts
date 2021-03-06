import { Uri, window } from "vscode";
import { getTargetDirectory, createDirectory } from "../extension";
import * as changeCase from "change-case";
import { existsSync, writeFile } from "fs";
import * as path from 'path';
import { isNameValid, promptForName, promptForJson } from "./common";
import EntityGenerator from "./entity";
import RepositoryGenerator from "./repository";


export default class UseCaseGenerator{
    useCaseName: string;
    repositoryName: string;
    entityName: string;

    constructor(useCaseName: string,repositoryName: string,entityName: string){
        this.useCaseName = useCaseName;
        this.repositoryName = repositoryName;
        this.entityName = entityName;
    }

    static async newCommaned(uri: Uri) {
        let usecaseName = await promptForName("UseCase");
        let repositoryName = await promptForName("Repository");
        let entityName = await promptForName("Entity");
        let targetDirectory = '';
    
        if (!isNameValid(usecaseName)
        || !isNameValid(repositoryName)
        || !isNameValid(entityName)) {
            window.showErrorMessage('The name must not be empty');
            return;
        }
    
        try {
            targetDirectory = await getTargetDirectory(uri);
        } catch (error) {
            window.showErrorMessage(error.message);
        }
    
        const pascalName = changeCase.pascalCase(`${usecaseName}`.toLowerCase());
        try {

            await (new UseCaseGenerator(`${usecaseName}`,`${repositoryName}`,`${entityName}`)).generate(targetDirectory);
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

        const tasks = [this.createTemplate(targetDirectory)];

        const entityPath = this.getEntitiesPath(targetDirectory);
        if(!this.isEntityExists(entityPath)){
            let json = await promptForJson();
            tasks.push((new EntityGenerator(this.entityName, `${json}`)).generate(entityPath));
        }

        const repositoryPath = this.getRepositoriesPath(targetDirectory);
        if(!this.isRepositoryExists(entityPath)){
            tasks.push((new RepositoryGenerator(this.repositoryName)).generate(repositoryPath));
        }

        await Promise.all(tasks);
    }

    isEntityExists(targetDirectory: string): boolean {
        const snakeName = changeCase.snakeCase(this.entityName.toLowerCase());
        return existsSync(path.join(this.getEntitiesPath(targetDirectory), `${snakeName}.dart`));
    }

    getEntitiesPath(targetDirectory: string): string {
        return targetDirectory.replace("usecases","entities");
    }

    isRepositoryExists(targetDirectory: string): boolean {
        const snakeName = changeCase.snakeCase(this.entityName.toLowerCase());
        return existsSync(path.join(this.getRepositoriesPath(targetDirectory), `${snakeName}.dart`));
    }

    getRepositoriesPath(targetDirectory: string): string {
        return targetDirectory.replace("usecases","repositories");
    }
    
    createTemplate(targetDirectory: string) {
        const snakeName = changeCase.snakeCase(this.useCaseName.toLowerCase());
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
        const pascalUseCaseName = changeCase.pascalCase(this.useCaseName.toLowerCase());
        
        const pascalRepositoryName = changeCase.pascalCase(this.repositoryName.toLowerCase());
        const camelRepositoryName = changeCase.camelCase(this.repositoryName.toLowerCase());
        const snakeRepositoryName = changeCase.snakeCase(this.repositoryName.toLowerCase());
        
        const pascalEntityName = changeCase.pascalCase(this.entityName.toLowerCase());
        const snakeEntityName = changeCase.snakeCase(this.entityName.toLowerCase());

        return `import 'dart:async';
import 'package:dartz/dartz.dart';
import 'package:famcare/core/errors/failures.dart';
import '../entities/${snakeEntityName}.dart';
import '../repositories/${snakeRepositoryName}.dart';

class ${pascalUseCaseName}{
    final ${pascalRepositoryName} ${camelRepositoryName};

    ${pascalUseCaseName}({
        this.${camelRepositoryName}
    });

    Future<Either<Failure, ${pascalEntityName}>> execute() async {
        // todo: TBD
    }
}`;
    }
}
