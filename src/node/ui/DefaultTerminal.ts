import { TerminalUI } from "./TerminalUI.js"
import tkit from 'terminal-kit'
                 

export class DefaultTerminalUI implements TerminalUI {

    private term = tkit.realTerminal

    clear(): void {
        this.term.clear()
    }
    printProgress(title: string): (progress: number) => void {
        const progressBar = this.term.progressBar(
            {
                width: 80 ,
                title: title ,
                eta: true ,
                percent: true
            }
        )
        return (progress: number) => {
            progressBar.update(progress)
        }
    }

    async printTextInput(title: string): Promise<string> {
        this.term.yellow(title)
        const input = await this.term.inputField({}).promise
        if (input != null) {
            return input
        } else {
            throw Error("Failed to get user input")
        }
    }

    async printOptions(title: string, options: string[]): Promise<number> {
        this.term.yellow(`${title}`)
        const selection = await this.term.singleColumnMenu(options).promise
        return selection.selectedIndex
    }

    printSuccessLine(message: string): void {
        this.term.green(`${message}\n`)
    }

    async printLoading(message: string): Promise<void> {
        this.term.cyan(`${message} `)
        await this.term.spinner( 'impulse' )
        this.term('\n')
    }

    printErrorLine(message: string): void {
        this.term.red(`${message}\n`)
    }

    async printYesNoQuestion(question: string): Promise<boolean> {
        this.term.yellow(`${question} [Y|n]\n`)
        return new Promise((resolve, _)=>{
            this.term.yesOrNo( { yes: [ 'y' , 'ENTER' ] , no: [ 'n' ] } , function( error , result ) {
                if ( result ) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            } )
        })
    }

    printBanner(): void {
        this.term.green(" ▗▖   ▄   ▄  ▄▄▄ ▄ ▗▞▀▘▗▞▀▜▌█ \n")
        this.term.green(" ▐▌   █   █ █    ▄ ▝▚▄▖▝▚▄▟▌█ \n")
        this.term.green(" ▐▌    ▀▀▀█ █    █          █ \n")
        this.term.green(" ▐▙▄▄▖▄   █      █          █ \n")
        this.term.green("       ▀▀▀                    \n\n")
    }

    printLine(message: string): void {
        this.term(`${message}\n`)
    }

    printNewLine(): void {
        this.term('\n')
    }
}