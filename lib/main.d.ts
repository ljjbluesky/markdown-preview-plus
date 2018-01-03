import { MarkdownPreviewView, MPVParams } from './markdown-preview-view';
import { TextEditor, CommandEvent } from 'atom';
export { config } from './config';
export declare function activate(): void;
export declare function createMarkdownPreviewView(state: MPVParams): MarkdownPreviewView | undefined;
export declare function toggle(): void;
export declare function uriForEditor(editor: TextEditor): string;
export declare function removePreviewForEditor(editor: TextEditor): boolean;
export declare function addPreviewForEditor(editor: TextEditor): void;
export declare function previewFile({currentTarget}: CommandEvent): void;
export declare function copyHtml(callback?: (text: string) => any, scaleMath?: number): Promise<void>;
