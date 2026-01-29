import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const provider = new TWScriptInlayHintsProvider();

    const disposable = vscode.languages.registerInlayHintsProvider(
        { language: 'tw-script' },
        provider
    );

    context.subscriptions.push(disposable);
}

export function deactivate() { }

// Effect definitions from the game's Lua code
interface EffectDef {
    description: string;
    negativeDescription?: string;
    valueMultiplier: number;
    isPercentage: boolean;
    useNegativeDescr: boolean;
    isReduction: boolean;
    isHidden: boolean;
}

const EFFECT_DEFINITIONS: Record<string, EffectDef> = {
    // Core attributes
    'Command': { description: 'Command', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Influence': { description: 'Influence', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Subterfuge': { description: 'Subterfuge', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Loyalty': { description: 'Ambition', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Charm': { description: 'Charm', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Finance': { description: 'Finance', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Piety': { description: 'Acumen', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Magic': { description: 'Magic', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Authority': { description: 'Authority', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Level': { description: 'Level', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: true },
    'Unorthodoxy': { description: 'Unorthodoxy', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'HeresyImmunity': { description: 'Heresy Immunity', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Assassination': { description: 'Assassination', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Sabotage': { description: 'Sabotage', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Eligibility': { description: 'Eligibility', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Purity': { description: 'Purity', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Violence': { description: 'Violence', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Disposition': { description: 'Disposition', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Boldness': { description: 'Boldness', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Generosity': { description: 'Generosity', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Management': { description: 'Management', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },

    // Chivalry - special case with negative description
    'Chivalry': { description: 'Renown', negativeDescription: 'Dread', valueMultiplier: 1, isPercentage: false, useNegativeDescr: true, isReduction: false, isHidden: false },

    // Military
    'BodyguardSize': { description: 'Bodyguard Size', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'TroopMorale': { description: 'Troop Morale', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'MovementPoints': { description: 'Movement Points', valueMultiplier: 5, isPercentage: true, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Attack': { description: 'Command (Attacking)', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Defence': { description: 'Command (Defending)', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'SiegeAttack': { description: 'Command (Siege Assault)', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'SiegeDefence': { description: 'Command (Siege Defence)', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Ambush': { description: 'Command (Ambushing)', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'NavalCommand': { description: 'Command (Naval)', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'SiegeEngineering': { description: 'Siege construction points', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'NightBattle': { description: 'Command (At night)', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'CavalryCommand': { description: 'Command (Cavalry)', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'InfantryCommand': { description: 'Command (Infantry)', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'GunpowderCommand': { description: 'Command (Gunpowder)', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'ArtilleryCommand': { description: 'Command (Artillery)', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'BodyguardValour': { description: 'Bodyguard Experience', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'HitPoints': { description: 'Hit Points', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },

    // Security
    'PersonalSecurity': { description: 'Personal Security', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'PublicSecurity': { description: 'Public Security', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Bribery': { description: 'Bribery', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'BriberyResistance': { description: 'Bribery Resistance', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Electability': { description: 'Electability', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'LineOfSight': { description: 'Line of Sight', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },

    // Economy - with multipliers and percentages
    'TrainingUnits': { description: 'Recruitment cost', valueMultiplier: 5, isPercentage: true, useNegativeDescr: false, isReduction: true, isHidden: false },
    'TrainingAgents': { description: 'Agent recruitment cost', valueMultiplier: 5, isPercentage: true, useNegativeDescr: false, isReduction: true, isHidden: false },
    'TrainingAnimalUnits': { description: 'Animal recruitment cost', valueMultiplier: 5, isPercentage: true, useNegativeDescr: false, isReduction: true, isHidden: false },
    'Construction': { description: 'Construction cost', valueMultiplier: 1, isPercentage: true, useNegativeDescr: false, isReduction: true, isHidden: false },
    'Trading': { description: 'Trading income', valueMultiplier: 1, isPercentage: true, useNegativeDescr: false, isReduction: false, isHidden: false },
    'LocalPopularity': { description: 'Public order', valueMultiplier: 5, isPercentage: true, useNegativeDescr: false, isReduction: false, isHidden: false },
    'FootInTheDoor': { description: 'Foot in the Door', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Farming': { description: 'Farming', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Mining': { description: 'Mining', valueMultiplier: 1, isPercentage: true, useNegativeDescr: false, isReduction: false, isHidden: false },
    'TaxCollection': { description: 'Taxes', valueMultiplier: 1, isPercentage: true, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Fertility': { description: 'Fertility', valueMultiplier: 1, isPercentage: false, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Looting': { description: 'Looting Gain', valueMultiplier: 1, isPercentage: true, useNegativeDescr: false, isReduction: false, isHidden: false },

    // Settlement effects with 5x multiplier
    'Health': { description: 'Health', valueMultiplier: 5, isPercentage: true, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Squalor': { description: 'Squalor', valueMultiplier: 5, isPercentage: true, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Unrest': { description: 'Unrest', valueMultiplier: 5, isPercentage: true, useNegativeDescr: false, isReduction: false, isHidden: false },
    'Law': { description: 'Law', valueMultiplier: 5, isPercentage: true, useNegativeDescr: false, isReduction: false, isHidden: false },

    // Battle surgery with 3x multiplier
    'BattleSurgery': { description: 'Casualties recovering', valueMultiplier: 3, isPercentage: true, useNegativeDescr: false, isReduction: false, isHidden: false },
};

function formatEffectValue(effectName: string, rawValue: number): string {
    const def = EFFECT_DEFINITIONS[effectName];
    if (!def || def.isHidden) {
        return '';
    }

    const adjustedValue = rawValue * def.valueMultiplier;
    let sign: string;
    let displayValue = Math.abs(adjustedValue);

    if (def.useNegativeDescr) {
        sign = '+';
    } else if (def.isReduction) {
        sign = rawValue > 0 ? '-' : '+';
    } else {
        sign = rawValue > 0 ? '+' : '-';
    }

    let description: string;
    if (def.useNegativeDescr && rawValue < 0) {
        description = def.negativeDescription || def.description;
    } else {
        description = def.description;
    }

    const percentSign = def.isPercentage ? '%' : '';
    return `${sign}${displayValue}${percentSign} ${description}`;
}

function formatNumber(num: number): string {
    return num.toLocaleString('en-US');
}

class TWScriptInlayHintsProvider implements vscode.InlayHintsProvider {

    provideInlayHints(
        document: vscode.TextDocument,
        range: vscode.Range,
        token: vscode.CancellationToken
    ): vscode.InlayHint[] {
        const hints: vscode.InlayHint[] = [];

        for (let lineNum = range.start.line; lineNum <= range.end.line; lineNum++) {
            if (token.isCancellationRequested) {
                break;
            }

            const line = document.lineAt(lineNum);
            const text = line.text;

            // Skip comment lines
            if (text.trim().startsWith(';') || text.trim().startsWith('¬')) {
                continue;
            }

            // 1. recruit_pool replenishment rate → turns
            this.addRecruitPoolHints(text, lineNum, hints);

            // 2. Effect lines in trait files → actual game effect
            this.addEffectHints(text, lineNum, hints);

            // 3. timescale → turns per year
            this.addTimescaleHints(text, lineNum, hints);
        }

        return hints;
    }

    private addRecruitPoolHints(text: string, lineNum: number, hints: vscode.InlayHint[]): void {
        // Format: recruit_pool "Unit Name"  <initial>  <rate>  <max>  <exp>
        const pattern = /recruit_pool\s+"[^"]+"\s+\d+\s+(0\.\d+)/g;
        let match;

        while ((match = pattern.exec(text)) !== null) {
            const rateStr = match[1];
            const rate = parseFloat(rateStr);

            if (rate > 0) {
                const turns = 1 / rate;
                const turnsDisplay = turns % 1 === 0 ? turns.toString() : turns.toFixed(1);

                const rateEndIndex = match.index + match[0].length;
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
    }

    private addEffectHints(text: string, lineNum: number, hints: vscode.InlayHint[]): void {
        // Format: Effect <EffectName> <value>
        const pattern = /^\s*Effect\s+(\w+)\s+(-?\d+)\s*$/;
        const match = text.match(pattern);

        if (match) {
            const effectName = match[1];
            const rawValue = parseInt(match[2], 10);
            const formatted = formatEffectValue(effectName, rawValue);

            if (formatted) {
                const endIndex = text.length;
                const position = new vscode.Position(lineNum, endIndex);

                const hint = new vscode.InlayHint(
                    position,
                    `-> ${formatted}`,
                    vscode.InlayHintKind.Type
                );
                hint.paddingLeft = true;

                const def = EFFECT_DEFINITIONS[effectName];
                if (def && def.valueMultiplier !== 1) {
                    hint.tooltip = new vscode.MarkdownString(
                        `**Raw Value:** ${rawValue}\n\n` +
                        `**Multiplier:** ×${def.valueMultiplier}\n\n` +
                        `**In-Game:** ${formatted}`
                    );
                }

                hints.push(hint);
            }
        }
    }

    private addTimescaleHints(text: string, lineNum: number, hints: vscode.InlayHint[]): void {
        // Format: timescale  <value>
        const pattern = /^\s*timescale\s+([\d.]+)\s*$/;
        const match = text.match(pattern);

        if (match) {
            const scale = parseFloat(match[1]);
            if (scale > 0) {
                const turnsPerYear = 1 / scale;
                const display = turnsPerYear % 1 === 0
                    ? turnsPerYear.toString()
                    : turnsPerYear.toFixed(1);

                const endIndex = text.indexOf(match[1]) + match[1].length;
                const position = new vscode.Position(lineNum, endIndex);

                const hint = new vscode.InlayHint(
                    position,
                    `(${display} turns/year)`,
                    vscode.InlayHintKind.Parameter
                );
                hint.paddingLeft = true;
                hint.tooltip = new vscode.MarkdownString(
                    `**Timescale:** ${scale}\n\n` +
                    `**Turns per Year:** ${display}\n\n` +
                    `Formula: 1 ÷ ${scale} = ${display}`
                );
                hints.push(hint);
            }
        }
    }
}
