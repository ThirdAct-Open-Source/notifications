import {RenderContext} from "./RenderContext";

export abstract class Transport {
    abstract get name(): string;
    abstract send(
        address: { to: unknown, from: unknown },
        payload: Buffer
    ): Promise<void>;
}

export default Transport;