import {
    Transport, TransportPayload
} from '../../Transport';
import {
    Template
} from '../../Template';
import {RenderContext} from "../../RenderContext";
import EJSTemplate from "../../EJSTemplate";

export type TemplateData = { userId: string };
export type TransportData =  { address: { to: unknown; from: unknown }, payload: TransportPayload };
export class DummyTransport extends Transport {
    constructor(public cb: (d: TransportData) => void) {
        super();
    }

    get name() { return 'DummyTransport'; }

    public async send(address: { to: unknown; from: unknown }, payload: TransportPayload): Promise<void> {
        this.cb({ address, payload });
    }
}
