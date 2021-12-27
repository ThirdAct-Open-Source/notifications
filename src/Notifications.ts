import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import {RenderContext, RenderContextOptions} from "./RenderContext";
import Template from "./Template";
import Transport from "./Transport";

export type AddressList = ({
    to: unknown,
    from?: unknown,
    transportName: string
})[];

export class TemplateDoesNotExistError extends Error {
  constructor(public trans: string, public tmpl: string) { super(`Template ${trans}.${tmpl} does not exist`) }
}

export class Notifications<R extends RenderContextOptions> extends EventEmitter {
    protected links: Map<string, unknown> = new Map<string, unknown>();
    constructor(
        public templates: Map<string, Template<unknown>> = new Map<string, Template<unknown>>(),
        public transports: Map<string, Transport> = new Map<string, Transport>(),
        public renderOptions?: R
    ) {
        super({ wildcard: true, delimiter: '.' });
    }


    public registerTemplate(template: Template<unknown>, transportNames: string[]|string) {
        for (const transportName of ([].concat(transportNames) as string[])) {
            this.templates.set(`${template.name}.${transportName}`, template);

            const transport = this.transports.get(transportName) as Transport;
            const link = `notify.${template.name}.${transport.name}`;
            const fn = transport.send.bind(transport);
            this.links.set(link, fn);
            this.on(link, fn);
        }
    }

    public registerTransport(transport: Transport) {
        this.transports.set(transport.name, transport);
    }

    public unregisterTemplate(templateName: string, transportName: string) {
        const regExp = new RegExp(`^notify\\.${templateName}\\.`);
        for (const [name, fn] of Array.from(this.links.entries())) {
            if (name.match(regExp))
                this.off(name, fn as any);
        }

        this.templates.delete(`${templateName}.${transportName}`);
    }

    public unregisterTransport(transportName: string) {
        const regExp = new RegExp(`^notify\\.(.*)\\.${transportName}$`);
        for (const [name, fn] of Array.from(this.links.entries())) {
            if (name.match(regExp))
                this.off(name, fn as any);
        }

        this.transports.delete(transportName);
    }

    public async createRenderContext<D>(data: D, opts?: RenderContextOptions): Promise<RenderContext<D>> {
        return RenderContext.createRenderContext(data, opts);
    }


    protected async notifyInner<D>(
        ctx: RenderContext<any>,
        who: AddressList,
      what: { data?: D, templateName: string, meta?: { [name: string]: unknown } },
      opts?: Partial<R>
    ): Promise<void> {
        for (const { to, from, transportName } of who) {
            const tmpl = this.templates.get(`${what.templateName}.${transportName}`);
             if (!tmpl) throw  new TemplateDoesNotExistError(transportName,what.templateName);
            const content = await tmpl.render(ctx);
            await this.emitAsync(`notify.${what.templateName}.${transportName}`, { to, from }, {
                content,
                meta: typeof(what) !== 'string' ? what?.meta : void(0)
            });
        }
    }

    public async notify<D>(
        who: AddressList,
        what: { data?: D, templateName: string, meta?: { [name: string]: unknown } },
        opts?: Partial<R>
    ): Promise<void>;
    public async notify<D>(
        who: AddressList,
        what: { data?: D, templateName: string, meta?: { [name: string]: unknown } },
        opts?: Partial<R>
    ): Promise<void>;
    public async notify(
        who: AddressList,
        templateName: string,
        opts?: Partial<R>
    ): Promise<void>;
    public async notify<D>(
        who: AddressList,
        what: { data?: D, templateName: string, meta?: { [name: string]: unknown } }|string,
        opts?: Partial<R>
    ): Promise<void> {
        const $what = typeof(what) === 'string' ? { templateName: what } : what;
        const ctx = await this.createRenderContext($what.data, {
            ...this.renderOptions,
            ...(opts || {})
        });

        return this.notifyInner(ctx, who, $what, opts);
    }
}

export default Notifications;
