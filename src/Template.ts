import {RenderContext} from "./RenderContext";

export abstract class Template<D> {
    abstract get name(): string;
    abstract render(context: RenderContext<D>): Promise<Buffer>;
}

export default Template;