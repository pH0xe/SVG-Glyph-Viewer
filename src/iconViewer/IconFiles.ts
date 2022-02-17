import { Icon } from "./Icon";
import { IconExtractor } from "./IconExtractor";

export class IconFile {
    public displayName: string;
    public icons?: Icon[];

    constructor(
        public readonly fileName: string,
        public iconExtractor: IconExtractor,
        displayName?: string,
    ) {
        if (displayName) 
            this.displayName = displayName;
        else
            this.displayName = fileName;
    }

    public async setIcons() {
        this.icons = await this.iconExtractor.getIcons();
        return;
    }
}