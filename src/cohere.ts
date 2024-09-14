// Import the vscode module, which provides the VS Code extensibility API
import * as vscode from 'vscode';
// Import the CohereClient from the cohere-ai package, which allows interaction with the Cohere API
import { CohereClient } from 'cohere-ai';

// Initialize a new CohereClient with an API key
// The API key is fetched from an environment variable, or defaults to an empty string if not found
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || '',
});

// Define an interface for commit templates
// This interface specifies the structure for different commit message formats
interface CommitTemplate {
  name: string;        // The name of the template (e.g., 'Conventional Commits')
  description: string; // A brief description of the template format
  pattern: RegExp;     // A regular expression to validate if a commit message follows this template
}

// Define an array of commit templates
// Each template object follows the CommitTemplate interface
const commitTemplates: CommitTemplate[] = [
  {
    name: 'Conventional Commits',
    description: 'type(scope): subject',
    // This regex ensures the commit message starts with a type, optional scope, and a subject
    pattern: /^(feat|fix|docs|style|refactor|test|chore)(\([a-z ]+\))?: .{1,50}$/
  },
  {
    name: 'Angular',
    description: 'type(scope): subject',
    // Similar to Conventional Commits, but with a different set of allowed types
    pattern: /^(build|ci|docs|feat|fix|perf|refactor|style|test)(\([a-z ]+\))?: .{1,50}$/
  }
];

// Declare a variable to store the currently selected commit template
// This will be used throughout the extension to determine which template to use for validation
let currentTemplate: CommitTemplate;

/**
 * Activates the extension
 * This function is called when your extension is activated
 * It sets up command registrations, event listeners, and initializes the extension state
 * @param context The extension context provided by VS Code
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('Commit Message Mentor extension is now active');

  // Set the default template to Conventional Commits (the first template in the array)
  currentTemplate = commitTemplates[0];

  // Register the command to analyze commit messages
  // This command can be triggered by the user to get feedback on their commit message
  const disposable = vscode.commands.registerCommand('commitMentor.analyzeCommit', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active text editor found');
      return;
    }

    // Get the entire text of the current document as the commit message
    const commitMessage = editor.document.getText();
    // Analyze the commit message using the Cohere API
    const analysis = await analyzeCommitMessage(commitMessage);
    
    // Display the analysis result to the user
    vscode.window.showInformationMessage(`Commit Analysis: ${analysis}`);
  });

  // Add the command registration to the list of disposables
  // This ensures the command is properly disposed when the extension is deactivated
  context.subscriptions.push(disposable);

  // Register a command to change the commit template
  // This allows users to switch between different commit message formats
  context.subscriptions.push(vscode.commands.registerCommand('commitMentor.changeTemplate', async () => {
    // Show a quick pick menu with all available template names
    const selected = await vscode.window.showQuickPick(
      commitTemplates.map(t => t.name),
      { placeHolder: 'Select a commit message template' }
    );
    if (selected) {
      // Update the current template based on user selection
      currentTemplate = commitTemplates.find(t => t.name === selected) || commitTemplates[0];
      vscode.window.showInformationMessage(`Commit template changed to ${currentTemplate.name}`);
    }
  }));

  // Register an event listener for text document changes
  // This allows the extension to analyze commit messages in real-time as they're being written
  context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
    // Only analyze the document if it's a git commit message file
    if (event.document.fileName.endsWith('COMMIT_EDITMSG')) {
      analyzeCommitInRealTime(event.document);
    }
  }));

  // Register a command to set custom feedback preferences
  // This allows users to specify their own criteria for commit message analysis
  context.subscriptions.push(vscode.commands.registerCommand('commitMentor.setFeedbackPreferences', async () => {
    const preferences = await vscode.window.showInputBox({
      prompt: 'Enter custom feedback preferences (comma-separated)',
      placeHolder: 'e.g., avoid jargon, no passive voice, short descriptions'
    });
    if (preferences) {
      // Store the preferences in the extension's global state
      context.globalState.update('feedbackPreferences', preferences);
      vscode.window.showInformationMessage('Feedback preferences updated');
    }
  }));
}

/**
 * Analyzes a commit message using the Cohere API
 * This function sends the commit message to Cohere's AI model for analysis
 */
async function analyzeCommitMessage(message: string): Promise<string> {
  try {
    // Retrieve custom feedback preferences from VS Code configuration
    const feedbackPreferences = vscode.workspace.getConfiguration().get('commitMentor.feedbackPreferences', '');
    
    // Send a request to the Cohere API for analysis
    // The request includes the commit message, current template, and custom preferences
    const response = await cohere.chat({
      model: "command",
      message: `Analyze the following git commit message and provide feedback on its clarity, structure, and adherence to the ${currentTemplate.name} template (${currentTemplate.description}). Consider these custom preferences: ${feedbackPreferences}. The user's git commit message is:\n\n${message}\n\nFeedback:`,
    });

    console.log(response); // debug
    return response.text.trim(); // Return the trimmed text of the response
  } catch (error) {
    console.error('Error analyzing commit message:', error);
    return 'Error analyzing commit message. Please try again.';
  }
}

/**
 * Analyzes a commit message in real-time and provides diagnostics
 * This function is called whenever the commit message document changes
 * It checks the message against the current template and provides immediate feedback
 * @param document The text document containing the commit message
 */
function analyzeCommitInRealTime(document: vscode.TextDocument) {
  const text = document.getText();
  const diagnostics: vscode.Diagnostic[] = [];

  // Check if the commit message follows the current template
  if (!currentTemplate.pattern.test(text)) {
    // If not, create a diagnostic covering the entire document
    const diagnostic = new vscode.Diagnostic(
      new vscode.Range(0, 0, document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length),
      `Commit message does not follow the ${currentTemplate.name} template: ${currentTemplate.description}`,
      vscode.DiagnosticSeverity.Warning
    );
    diagnostics.push(diagnostic);
  }

  // Check for weak verbs in the commit message
  const weakVerbs = ['use', 'utilize', 'perform', 'implement'];
  weakVerbs.forEach(verb => {
    const regex = new RegExp(`\\b${verb}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      // For each weak verb found, create a diagnostic
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(document.positionAt(match.index), document.positionAt(match.index + verb.length)),
        `Consider using a stronger verb instead of "${verb}"`,
        vscode.DiagnosticSeverity.Information
      );
      diagnostics.push(diagnostic);
    }
  });

  // Check commit message length
  // Best practices suggest keeping the first line of a commit message under 72 characters
  if (text.length > 72) {
    const diagnostic = new vscode.Diagnostic(
      new vscode.Range(0, 72, 0, text.length),
      'Commit message is too long. Consider keeping it under 72 characters.',
      vscode.DiagnosticSeverity.Information
    );
    diagnostics.push(diagnostic);
  }

  // Set the diagnostics for the document
  // This will display the issues in the VS Code UI (e.g., squiggly lines under problematic text)
  vscode.languages.createDiagnosticCollection().set(document.uri, diagnostics);
}

/**
 * Deactivates the extension
 * This function is called when your extension is deactivated
 * It's left empty as there are no cleanup tasks required for this extension
 */
export function deactivate() {}