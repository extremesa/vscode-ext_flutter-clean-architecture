import * as changeCase from "change-case";

export function getUsecaseTemplate(useCaseName: string,epositoryName: string,entityName: string): string {
  const pascalCaseUseCaseName = changeCase.pascalCase(useCaseName.toLowerCase());
  const pascalCaseRepositoryName = changeCase.pascalCase(epositoryName.toLowerCase());
  const camelCaseRepositoryName = changeCase.camelCase(epositoryName.toLowerCase());
  const snakeCaseRepositoryName = changeCase.snakeCase(epositoryName.toLowerCase());
  const pascalCaseEntityName = changeCase.pascalCase(entityName.toLowerCase());
  const snakeCaseEntityName = changeCase.snakeCase(entityName.toLowerCase());
  return `import 'dart:async';
  import 'package:dartz/dartz.dart';
  import 'package:famcare/core/errors/failures.dart';
  import '../entities/${snakeCaseEntityName}.dart';
  import '../repositories/${snakeCaseRepositoryName}.dart';

class ${pascalCaseUseCaseName}{
  final ${pascalCaseRepositoryName} ${camelCaseRepositoryName};

  ${pascalCaseUseCaseName}({
    this.${camelCaseRepositoryName}
  });
  
  Future<Either<Failure, ${pascalCaseEntityName}>> execute() async {
      // todo: TBD
  }
}
`;
}
