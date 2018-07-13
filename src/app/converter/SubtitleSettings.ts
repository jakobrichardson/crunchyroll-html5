import { ISubtitleContentStyle } from 'crunchyroll-lib/models/ISubtitleContent';

export class SubtitleSettings {
    private settingsNamespace = "crunchyroll-html5.SubtitleSettings.";
    private static _instance: SubtitleSettings;
    private StyleProperties = [
        "name",
        "fontName",
        "fontSize",
        "primaryColour",
        "secondaryColour",
        "outlineColour",
        "backColour",
        "bold",
        "italic",
        "underline",
        "strikeout",
        "scaleX",
        "scaleY",
        "spacing",
        "angle",
        "borderStyle",
        "outline",
        "shadow",
        "alignment",
        "marginL",
        "marginR",
        "marginV",
        "encoding"
    ];
    private SupportedStyleProperties = [
        "fontSize",
        "primaryColour",
        "secondaryColour",
        "outlineColour",
        "backColour",
        "underline",
        "borderStyle"
    ]
    private constructor() {

    }
    deleteSetting(name: string) {
        window.localStorage.removeItem(this.settingsNamespace + name);
    }
    getSetting(name: string) {
        return window.localStorage.getItem(this.settingsNamespace + name);
    }
    setSetting(name: string, value: string | number) {
        window.localStorage.setItem(this.settingsNamespace + name, value + "");
    }
    static getInstance() {
        if (!this._instance)
            this._instance = new SubtitleSettings();
        return this._instance;
    }
    storeDefaults(id: number, style: ISubtitleContentStyle) {
        let styles = {};
        this.StyleProperties.forEach((key) => {
            styles[key] = style[key] + "";
        });
        window.localStorage.setItem(this.settingsNamespace + "defaults." + id, JSON.stringify(styles));
    }
    getDefault(name: string) {
        let style = window.localStorage.getItem(this.settingsNamespace + "defaults." + 0);
        if (style) {
            let styleData = JSON.parse(style);
            if (styleData[name])
                return styleData[name];
            else
                return;
        } else
            return;
    }
    applyStyleSettings(style: ISubtitleContentStyle): string {
        let output = "Style: ";
        for (let i = 0; i < this.StyleProperties.length; i++) {
            let propName = this.StyleProperties[i];
            if (i > 0)
                output += ", ";
            output += this._transformStyle(style[propName] + "", propName);
        }
        output += "\n";
        console.log("Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n" +
            output);
        return output;
    }
    getSupportedSettings(): string[] {
        return this.SupportedStyleProperties;
    }
    private _transformStyle(style: string, prop: string): string {
        var value;
        switch (prop) {
            case "fontSize":
                value = this.getSetting(prop);
                if (!value)
                    return style;
                return "" + Math.ceil(parseInt(style) * parseFloat(value || "1"));
            
            case "underline":
                value = this.getSetting(prop);
                if (!value)
                    return style;
                if (["0", "1", "2", "3", "4"].indexOf(value) > -1)
                    return value;
                else
                    return style;
            case "borderStyle":
                value = this.getSetting(prop);
                if (!value)
                    return style;
                if (["0", "1", "2", "3", "4"].indexOf(value) > -1)
                    return value;
                else
                    return style;
            case "primaryColour":
            case "secondaryColour":
            case "outlineColour":
            case "backColour":
                value = this.getSetting(prop);
                if (!value)
                    return style;
                if (value.match(/^[a-fA-F0-9]{2}$/))
                    return style.replace(/&H[a-fA-F0-9]{2}/, "&H" + value.toUpperCase());
                else if (value.match(/^[a-fA-F0-9]{8}$/))
                    return "&H" + value;
                else
                    return style;
            case "scaleX":
            case "scaleY":
                if (style === "0")
                    return "100";
                else
                    return style;
            default:
                return style;
        }
    }
}