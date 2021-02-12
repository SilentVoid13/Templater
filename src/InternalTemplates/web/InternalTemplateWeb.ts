import { App } from "obsidian";
import { InternalTemplate } from "../InternalTemplate";
import axios from 'axios';

export abstract class InternalTemplateWeb extends InternalTemplate {
    url: string;
    size: string;
    query: string;
    
    constructor(app: App, args: {[key: string]: string}) {
        super(app, args);
        this.url = this.get_argument("url") ?? "";
        this.size = this.get_argument("size") ?? "1600x900";
        this.query = this.get_argument("query") ?? "";
    }

    async getRequest(url: string) {
        return await axios.get(url);
    }
}