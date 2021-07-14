/**
 * Readwise internal module for Templater.
 *
 * @see https://readwise.io
 * @see https://readwise.io/api_deets
 *
 * @author Joern Meyer<mail@joern.art>
 */
import {InternalModule} from "../InternalModule";

export interface IBook {
    title: string;
    author: string;
    highlights_url: string;
}

export interface IHighlight {
    text: string;
    book_id: number;
    book?: IBook;
}

export interface IReadwiseParams {
    page_size: number;
    book_id?: number;
}

export class InternalModuleReadwise extends InternalModule {
    protected name: string = 'readwise';
    readonly error_message: string = 'Error fetching response from readwise.io Did you pass your [access token](http://readwise.io/access_token) in the Templater call?';

    async createStaticTemplates(): Promise<void> {
        this.static_templates.set('random', this.generate_random());
        this.static_templates.set('latest', this.generate_latest());
    }

    async updateTemplates(): Promise<void> {
    }

    async getHighlights(access_token: string, amount: number, book_id?: number): Promise<IHighlight[]> {
        let url = new URL('https://readwise.io/api/v2/highlights/');
        const params: IReadwiseParams = {
            page_size: amount,
        };
        if (book_id) {
            params.book_id = book_id;
        }

        // @ts-ignore
        Object.keys(params).forEach(key => url.searchParams.append(key as string, params[key]))

        const response = await fetch(url.toString(), {
            headers: new Headers({
                "Content-Type": "application/json",
                Authorization: `Token ${access_token}`
            }),
        });
        if (!response.ok) {
            throw new Error();
        }
        const content = await response.json();
        return content.results as IHighlight[];
    }

    async getBook(access_token: string, book_id: number): Promise<IBook> {
        let url = 'https://readwise.io/api/v2/books/' + String(book_id);

        const response = await fetch(url, {
            headers: new Headers({
                "Content-Type": "application/json",
                Authorization: `Token ${access_token}`
            })
        });

        const content = await response.json();

        return content as IBook;
    }

    private render(highlight: IHighlight): string {
        return highlight.text
            + "\r\n\r\n"
            + ' — ['
            + highlight.book.author
            + ' ('
            + highlight.book.title
            + ')]'
            + '('
            + highlight.book.highlights_url
            + ')'
            ;
    }

    generate_random(): Function {
        return async (access_token: string, book_id?: number) => {
            try {
                const highlights = await this.getHighlights(access_token, 1000, book_id);
                const chosen = highlights[Math.floor(Math.random() * highlights.length)];
                chosen.book = await this.getBook(access_token, chosen.book_id);

                return this.render(chosen);
            } catch (e) {
                return this.error_message;
            }
        }
    }

    generate_latest(): Function {
        return async (access_token: string, book_id?: number) => {
            try {
                const highlights = await this.getHighlights(access_token, 1, book_id);
                const highlight = highlights[0]
                highlight.book = await this.getBook(access_token, highlight.book_id);

                return this.render(highlight);
            } catch (e) {
                return this.error_message;
            }
        }
    }
}
