import { Uri, InputBoxOptions, window } from "vscode";
import * as _ from "lodash";

export function promptForName (type: string): Thenable<string | undefined> {
  const blocNamePromptOptions: InputBoxOptions = {
    prompt: `${type} Name`,
    placeHolder: `Enter your ${type} name, spaces allowed`
  };
  return window.showInputBox(blocNamePromptOptions);
}

export function promptForJson (): Thenable<string | undefined> {
  const blocNamePromptOptions: InputBoxOptions = {
    prompt: `Json`,
    placeHolder: `Enter your json valid code`
  };
  return window.showInputBox(blocNamePromptOptions);
}

export function isNameValid (featureName: string | undefined): boolean {
  // Check if feature name exists
  if (!featureName) {
    return false;
  }
  // Check if feature name is null or white space
  if (_.isNil(featureName) || featureName.trim() === '') {
    return false;
  }

  // Return true if feature name is valid
  return true;
}