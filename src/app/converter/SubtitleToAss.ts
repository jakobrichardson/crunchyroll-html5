import { ISubtitle } from 'crunchyroll-lib/models/ISubtitle';
import { ISubtitleContentStyle } from 'crunchyroll-lib/models/ISubtitleContent';
import { SubtitleSettings } from './SubtitleSettings';

export class SubtitleToAss {
  private _subtitle: ISubtitle;

  constructor(subtitle: ISubtitle) {
    this._subtitle = subtitle;
  }

  async getContentAsAss(): Promise<string> {
    const model = await this._subtitle.getContent();
    let settings = SubtitleSettings.getInstance();
    let output = '[Script Info]\n';
    output += "Title: " + model.title + "\n";
    output += "ScriptType: v4.00+\n";
    output += "WrapStyle: " + model.wrapStyle + "\n";
    output += "PlayResX: " + model.playResX + "\n";
    output += "PlayResY: " + model.playResY + "\n";
    output += "\n";
    output += "[V4+ Styles]\n";
    output += "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n";
    const styles = model.styles;
    for (let i = 0; i < styles.length; i++) {
      if (i == 0)
        settings.storeDefaults(model.id, styles[i]);
      output += settings.applyStyleSettings(styles[i]);
    }
    output += "\n";
    output += "[Events]\n";
    output += "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n";

    const events = model.events;
    for (let i = 0; i < events.length; i++) {
      output += "Dialogue: 0";
      output += ", " + events[i].start;
      output += ", " + events[i].end;
      output += ", " + events[i].style;
      output += ", " + events[i].name;
      output += ", " + events[i].marginL;
      output += ", " + events[i].marginR;
      output += ", " + events[i].marginV;
      output += ", " + events[i].effect;
      output += ", " + events[i].text;
      output += "\n";
    }

    return output;
  }
}