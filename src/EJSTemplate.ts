import {RenderContext} from "./RenderContext";
import * as ejs from 'ejs';

export class EJSTemplate<D> {
    constructor(public name: string, public template: string) { }
    public async render(context: RenderContext<D>): Promise<Buffer> {
        const result = await ejs.render(this.template, context, { async: true });

        return Buffer.from(result, 'utf8');
    }
}

export default EJSTemplate;
