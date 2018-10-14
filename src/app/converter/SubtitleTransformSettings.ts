import { ISubtitleContentStyle } from 'crunchyroll-lib/models/ISubtitleContent';

export class SubtitleTransformSettings {
    private settingsNamespace = "crunchyroll-html5.SubtitleSettings.";
    private static _instance: SubtitleTransformSettings;
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
        "Fontsize",
        "PrimaryColour",
        "SecondaryColour",
        "OutlineColour",
        "BackColour",
        "Underline",
        "BorderStyle"
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
            this._instance = new SubtitleTransformSettings();
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

    /*

[Script Info]
Title: English (US)
Original Script: Funimation  [http://www.crunchyroll.com/user/Funimation]
Original Translation: 
Original Editing: 
Original Timing: 
Synch Point: 
Script Updated By: 
Update Details: 
ScriptType: v4.00+
Collisions: Normal
PlayResX: 640
PlayResY: 360
Timer: 0.0000
WrapStyle: 0

[V4+ Styles]
Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,Strikeout,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding
Style: Default,Arial,20,&H00FFFFFF,&H0000FFFF,&H00000000,&H7F404040,-1,0,0,0,100,100,0,0,1,2,1,2,0020,0020,0022,0
Style: OS,Arial,18,&H00FFFFFF,&H0000FFFF,&H00000000,&H7F404040,-1,0,0,0,100,100,0,0,1,2,1,8,0001,0001,0015,0
Style: Italics,Arial,20,&H00FFFFFF,&H0000FFFF,&H00000000,&H7F404040,-1,-1,0,0,100,100,0,0,1,2,1,2,0020,0020,0022,0
Style: On Top,Arial,20,&H00FFFFFF,&H0000FFFF,&H00000000,&H7F404040,-1,0,0,0,100,100,0,0,1,2,1,8,0020,0020,0022,0
Style: DefaultLow,Arial,20,&H00FFFFFF,&H0000FFFF,&H00000000,&H7F404040,-1,0,0,0,100,100,0,0,1,2,1,2,0020,0020,0010,0

[Events]

    */
    applyStyleSettingsToFile(file: string): string {
        let output = file.substr(0, file.indexOf('[Events]')),
            styleNames = output.match(/^(?:Format: )([\w,]+)$/gm),
            styles = output.match(/^(?:Style: )(.+)$/gm),
            self = this;
        output = file + '';
        if (styleNames && styleNames[0]) {
            console.warn('styleNames found');
            let styleNameList = styleNames[0].replace('Format: ', '').split(',');
            if (styles && styles.length > 0) {
                console.warn('styles found');
                styles.forEach(function (styleString) {
                    let styleValues = styleString.replace('Style: ', '').split(','),
                        transformedValues: string[] = [],
                        transformedStyle = '';
                    styleNameList.forEach(function (styleName, index) {
                        let transformedValue = self._transformStyle(styleValues[index], styleName);
                        transformedValues.push(transformedValue);
                    });
                    console.warn('styleString prcessed: ' + styleString);
                    if (transformedValues.length == styleValues.length) {
                        transformedStyle = 'Style: ' + transformedValues.join(',');
                        console.warn('style transformed: ' + styleString + ' => ' + transformedStyle);
                        output = output.replace(styleString, transformedStyle);
                    }
                });
            }
        }
        console.warn(file);
        console.warn(output);
        return output;
    }
    getSupportedSettings(): string[] {
        return this.SupportedStyleProperties;
    }
    private _transformStyle(style: string, prop: string): string {
        console.warn('transforming ' + prop + ': ' + style);
        var value;
        switch (prop) {
            case "Fontsize":
                value = this.getSetting(prop);
                console.warn("Fontsize mult = " + value);
                if (!value)
                    return style;
                return "" + Math.ceil(parseInt(style) * parseFloat(value || "1"));

            case "Underline":
                value = this.getSetting(prop);
                if (!value)
                    return style;
                if (["0", "1", "2", "3", "4"].indexOf(value) > -1)
                    return value;
                else
                    return style;
            case "BorderStyle":
                value = this.getSetting(prop);
                if (!value)
                    return style;
                if (["0", "1", "2", "3", "4"].indexOf(value) > -1)
                    return value;
                else
                    return style;
            case "PrimaryColour":
            case "SecondaryColour":
            case "OutlineColour":
            case "BackColour":
                value = this.getSetting(prop);
                if (!value)
                    return style;
                if (value.match(/^[a-fA-F0-9]{2}$/))
                    return style.replace(/&H[a-fA-F0-9]{2}/, "&H" + value.toUpperCase());
                else if (value.match(/^[a-fA-F0-9]{8}$/))
                    return "&H" + value;
                else
                    return style;
            case "ScaleX":
            case "ScaleY":
                if (style === "0")
                    return "100";
                else
                    return style;
            default:
                return style;
        }
    }
}