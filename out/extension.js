"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// Import the vscode module, which provides the VS Code extensibility API
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
/**
 * Activates the extension
 * This function is called when your extension is activated
 * It sets up command registrations and initializes the extension state
 * @param context The extension context provided by VS Code
 */
function activate(context) {
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
        }
        catch (error) {
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
function deactivate() { }
//# sourceMappingURL=extension.js.map