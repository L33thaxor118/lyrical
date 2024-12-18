export interface TerminalUI {
    printLine(message: string): void
    printSuccessLine(message: string): void
    printErrorLine(message: string): void
    printLoading(message: string): Promise<void>
    printYesNoQuestion(question: string): Promise<boolean>
    printOptions(title: string, options: Array<string>): Promise<number>
    printTextInput(title: string): Promise<string>
    printBanner(): void
    printNewLine(): void
    printProgress(title: string): (progress: number)=>void
    clear(): void
}