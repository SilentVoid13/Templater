import { TFile } from 'obsidian'

export class TJDocFile extends TFile {
    public description: string

    constructor(file: TFile) {
        super(file.vault, file.path)
        Object.assign(this, file)
    }
}
