import {RenderContext} from "./RenderContext";
import * as ejs from 'ejs';
import juice from 'juice';

export type EJSTemplateOptions = {
    ejsOptions?: ejs.Options,
    juiceOptions?: juice.Options
}

export class EJSTemplate<D> {
    constructor(public name: string, public template: string) { }
    public async render(context: RenderContext<D>, opts?: EJSTemplateOptions): Promise<Buffer> {
        const rawHtml = await ejs.render(this.template, context, {
            ...(opts?.ejsOptions || {}),
            async: true
        });

        const result = juice(rawHtml, opts?.juiceOptions);

        return Buffer.from(result, 'utf8');
    }
}

export default EJSTemplate;
