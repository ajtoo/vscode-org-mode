import { window, workspace } from 'vscode';
import { getKeywords, getUniq } from './utils';

export default function (checkbox: string, action: string) {
    if (checkbox.length != 3) {
        window.showErrorMessage(`Text '${checkbox}' is not a checkbox`);
    }
    if (checkbox.charAt(1) === " ") {
        return "[X]"
    }
    return "[ ]"
}