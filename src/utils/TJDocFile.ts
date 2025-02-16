import { TFile } from 'obsidian'

export class TJDocFile extends TFile {
    public description: string
    public returns: string
    public arguments: TJDocFileArgument[]

    constructor(file: TFile) {
        super(file.vault, file.path)
        Object.assign(this, file)
    }
}

export class TJDocFileArgument {
    public name: string
    public description: string
    constructor(name: string, desc: string) {
        this.name = name;
        this.description = desc;
    }
}
