
export interface RenderContextOptions {
    libs?: ([string,string]|string)[];
}

export const DEFAULT_RENDER_CONTEXT_OPTIONS: RenderContextOptions = {
    libs: [
        [ 'lodash', '_' ]
    ]
};

export class RenderContext<D> {
    constructor(
        public data: D,
        public libs: Map<string, unknown> = new Map<string, unknown>()
    ) {}

    public static  createLibsFromArray(arr: ([ string, string ]|string)[]) {
        const libs: Map<string, unknown> = new Map<string, unknown>();
        for (let libEntry of  (arr || [])) {
            const libName = Array.isArray(libEntry) ? libEntry[0] : libEntry;
            const libMapping = Array.isArray(libEntry) ? libEntry[1] : libName;

            libs.set(libMapping, require(libName));
        }
        return libs;
    }

    public static async createRenderContext<D>(data: D, opts: RenderContextOptions = DEFAULT_RENDER_CONTEXT_OPTIONS) {
        return new RenderContext(data, RenderContext.createLibsFromArray(opts.libs));
    }
}