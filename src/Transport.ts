import {RenderContext} from "./RenderContext";

export type TransportPayload = {
    content: Buffer,
    meta?: { [name: string]: unknown }
}

export abstract class Transport {
    abstract get name(): string;
    abstract send(
        address: { to: unknown, from: unknown },
        payload: TransportPayload
    ): Promise<void>;
}

export default Transport;