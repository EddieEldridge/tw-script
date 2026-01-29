import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const provider = new RecruitPoolInlayHintsProvider();
    
    const disposable = vscode.languages.registerInlayHintsProvider(
        { language: 'tw-script' },
        provider
    );
    
    context.subscriptions.push(disposable);
}

export function deactivate() {}

class RecruitPoolInlayHintsProvider implements vscode.InlayHintsProvider {
    
    provideInlayHints(
        document: vscode.TextDocument,
        range: vscode.Range,
        token: vscode.CancellationToken
    ): vscode.InlayHint[] {
        const hints: vscode.InlayHint[] = [];
        
        // Pattern to match recruit_pool lines and capture the replenishment rate
        // Format: recruit_pool "Unit Name"  <initial>  <rate>  <max>  <exp>
        const recruitPoolPattern = /recruit_pool\s+"[^"]+"\s+\d+\s+(0\.\d+)/g;
        
        for (let lineNum = range.start.line; lineNum <= range.end.line; lineNum++) {
            if (token.isCancellationRequested) {
                break;
            }
            
            const line = document.lineAt(lineNum);
            const text = line.text;
            
            let match;
            while ((match = recruitPoolPattern.exec(text)) !== null) {
                const rateStr = match[1];
                const rate = parseFloat(rateStr);
                
                if (rate > 0) {
                    const turns = 1 / rate;
                    const turnsDisplay = turns % 1 === 0 
                        ? turns.toString() 
                        : turns.toFixed(1);
                    
                    // Position hint right after the rate number
                    const rateStartIndex = match.index + match[0].length - rateStr.length;
                    const rateEndIndex = rateStartIndex + rateStr.length;
                    
                    const position = new vscode.Position(lineNum, rateEndIndex);
                    
                    const hint = new vscode.InlayHint(
                        position,
                        `(${turnsDisplay} turns)`,
                        vscode.InlayHintKind.Parameter
                    );
                    
                    hint.paddingLeft = true;
                    hint.tooltip = new vscode.MarkdownString(
                        `**Replenishment Rate:** ${rateStr}\n\n` +
                        `**Turns to Replenish:** ${turnsDisplay}\n\n` +
                        `Formula: 1 ÷ ${rateStr} = ${turnsDisplay}`
                    );
                    
                    hints.push(hint);
                }
            }
            
            // Reset regex lastIndex for next line
            recruitPoolPattern.lastIndex = 0;
        }
        
        return hints;
    }
}
