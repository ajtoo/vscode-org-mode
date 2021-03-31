import * as vscode from 'vscode';
import {
    Position,
    Range,
    TextEditor,
    TextEditorEdit,
    workspace
} from "vscode";
import * as Datetime from './simple-datetime';
import * as Util from './utils';

// Any potential data labels should go here
export const DATE = "DATE";
export const TODO = "TODO";
export const CHECKBOX = "CHECKBOX";

interface IContextData {
    dataLabel: string,
    data: string,
    line: number,
    range: Range
}

export default function getCursorContext(textEditor: TextEditor, edit: TextEditorEdit): IContextData {
    const document = Util.getActiveTextEditorEdit();
    const cursorPos = Util.getCursorPosition();
    const curLine = Util.getLine(document, cursorPos);

    // Match for timestamp
    const timestampRegexp = /\[\d{4}-\d{1,2}-\d{1,2}(?: \w{3})?\]/g;
    let match;

    while ((match = timestampRegexp.exec(curLine)) != null) {
        const timestampContext = getTimestampContext(match, cursorPos);
        if (timestampContext) {
            return timestampContext;
        }
    }

    // Match for TODO (or absence)
    const todoKeywords = Util.getKeywords().join("|");
    // const todoWords = "TODO|DONE";
    const todoHeaderRegexp = new RegExp(`^(\\s*\\*+\\s+)(${todoKeywords})(?:\\b|\\[|$)`);
    match = todoHeaderRegexp.exec(curLine);
    if (match) {
        // We've found our match
        return getTodoContext(match, cursorPos);
    }

    // Match for checkboxes (or absence)
    // const todoWords = "TODO|DONE";
    const checkboxHeaderRegexp = /^(\s*-\s+)(\[.\])/g;
    match = checkboxHeaderRegexp.exec(curLine);
    if (match) {
        // We've found our match
        return getCheckboxContext(match, cursorPos);
    }

    return undefined;
}

function getTimestampContext(match: RegExpExecArray, cursorPos: Position): IContextData {
    const line = cursorPos.line;

    const startPos = new Position(line, match.index);
    const endPos = new Position(line, match.index + match[0].length);
    const range = new Range(startPos, endPos);
    if (range.contains(cursorPos)) {
        // We've found our match
        return {
            data: match[0],
            dataLabel: DATE,
            line,
            range
        }
    }

    // Should return undefined if no match contains the cursor
}

function getTodoContext(match: RegExpExecArray, cursorPos: Position): IContextData {
    const line = cursorPos.line;

    const prefix = match[1];
    const todoWord = match[2];

    const start = match.index + match[1].length;
    const startPos = new Position(line, start);
    const end = start + todoWord.length;
    const endPos = new Position(line, end);
    const range = new Range(startPos, endPos);

    return {
        data: todoWord,
        dataLabel: TODO,
        line,
        range
    }
}

function getCheckboxContext(match: RegExpExecArray, cursorPos: Position): IContextData {
    const line = cursorPos.line;

    const prefix = match[1];
    const checkbox = match[2];

    const start = match.index + match[1].length;
    const startPos = new Position(line, start);
    const end = start + checkbox.length;
    const endPos = new Position(line, end);
    const range = new Range(startPos, endPos);

    return {
        data: checkbox,
        dataLabel: CHECKBOX,
        line,
        range
    }
}