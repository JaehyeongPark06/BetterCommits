// Import the vscode module, which provides the VS Code extensibility API
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Activates the extension
 * This function is called when your extension is activated
 * It sets up command registrations and initializes the extension state
 * @param context The extension context provided by VS Code
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('Commit Message Mentor extension is now active');

  // Register the command to display the message from data/user.txt
  vscode.commands.registerCommand('commitMentor.displayMessage', () => {
	try {
      // Get the path to data/user.txt
      const filePath = '/Users/shaurya/Development/HTN/BetterCommits/data/user.txt';

      // Read the contents of the file
      const message = fs.readFileSync(filePath, 'utf8');

      // Display the message to the user
      vscode.window.showInformationMessage(`Message from data/user.txt: ${message.trim()}`);
    } catch (error) {
      vscode.window.showErrorMessage(`Error reading message: ${error}`);
    }
  });

  
  

  

  // Add the command registration to the list of disposables
  // This ensures the command is properly disposed when the extension is deactivated
}

/**
 * Deactivates the extension
 * This function is called when your extension is deactivated
 * It's left empty as there are no cleanup tasks required for this extension
 */
export function deactivate() {}