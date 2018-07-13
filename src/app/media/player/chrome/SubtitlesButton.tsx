import { h, Component } from "preact";
import { IPlayerApi, PlaybackState } from "../IPlayerApi";
import { EventHandler } from "../../../libs/events/EventHandler";
import { SubtitleSettings } from '../../../converter/SubtitleSettings';

export interface ISubtitlesButtonProps {
  api: IPlayerApi;
}

export class SubtitlesButton extends Component<ISubtitlesButtonProps, {}> {
  private _handler = new EventHandler(this);
  private _subtitleSettings = SubtitleSettings.getInstance();
  constructor(props: ISubtitlesButtonProps) {
    super(props)
    this.state = { modalIsOpen: false }
  }
  private _onClick() {
    // Do the stuff
    let tracks = this.props.api.getSubtitlesTracks(),
      output = "";
    for (let i = 0; i < tracks.length; i++) {
      output += tracks[i].label + "\n";
    }
    /*
    console.log("There are " + tracks.length + " subtitle tracks:\n" + output);
    console.log("track 0 content:\n" + tracks[0].getContent());
    let newFontSizeInput = "" + prompt("Change the font size", this._subtitleSettings.getSetting("fontSize"));
    if (newFontSizeInput) {
      let newFontSizeMult = parseFloat(newFontSizeInput);
      if (newFontSizeMult) {
        this._subtitleSettings.setSetting("fontSize", newFontSizeMult);
        this.props.api.setSubtitleTracks(tracks);
        this.props.api.setSubtitleTrack(0);
      }
    }*/
    this.setState({ modalIsOpen: true });
  }

  onCloseModal() {
    this.setState({ modalIsOpen: false });
  }

  componentDidMount() {

  }

  componentWillUnmount() {
    this._handler.removeAll();
  }

  render(): JSX.Element {

    const onClick = () => this._onClick();

    const className = "chrome-button chrome-subtitles-button";

    return (
      <span>
        <button class={className} onClick={onClick}>
          Subs
      </button>
        <Modal settings={this._subtitleSettings} api={this.props.api} isOpen={this.state.modalIsOpen} onClose={() => { this.onCloseModal() }}></Modal>
      </span>
    );
  }
}

interface ModalProps {
  api: IPlayerApi;
  settings: SubtitleSettings;
  isOpen: boolean;
  onClose: any;
}

class Modal extends Component<ModalProps, {}> {
  constructor(props: ModalProps) {
    console.log(props);
    super(props);
    let settingsList = this.props.settings.getSupportedSettings(),
      settings: object = {};
    settingsList.forEach((setting: string) => {
      settings[setting + ""] = this.props.settings.getSetting(setting);
    })
    this.state = { settings: settings };
  }
  cancel(e: Event) {
    e.preventDefault();
    this.props.onClose();
    return false;
  }
  reset(e: Event) {
    e.preventDefault();
    let settings = this.state.settings,
      keys = Object.keys(settings);
    if (!keys)
      return;
    keys.forEach((prop) => {
      this.props.settings.deleteSetting(prop);
    });
    return false;
  }
  apply(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    let settings = this.state.settings,
      keys = Object.keys(settings);
    keys.forEach((prop) => {
      let stateValue = this.state.settings[prop],
        storedValue = this.props.settings.getSetting(prop);
      if (stateValue != storedValue)
        this.props.settings.setSetting(prop, stateValue);
    })
    let tracks = this.props.api.getSubtitlesTracks();
    this.props.api.setSubtitleTracks(tracks);
    this.props.api.setSubtitleTrack(0);
    this.props.onClose();
    return false;
  }
  updateState(e: Event) {
    this.setState((prevState) => {
      let settings = prevState.settings,
        key = e.target.name.substr("SubtitleSetting.".length);
      settings[key] = e.target.value + "";
      return { settings: settings };
    })
  }
  render() {
    if (this.props.isOpen === false)
      return null;
    let modalStyle = {
      'border-radius': '3px',
      padding: '20px',
      color: 'black',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -110%)',
      zIndex: '9999',
      background: '#fff'
    }
    let backdropStyle = {
      position: 'absolute',
      width: '100%',
      height: '100%',
      top: '0px',
      left: '0px',
      zIndex: '9998',
      background: 'rgba(0, 0, 0, 0.3)'
    }
    let settingsPaneStyle = {
      'max-width': '600px',
      'max-height': '400px',
      'overflow-y': 'scroll'
    }
    let inputStyle = {
      width: '100%'
    }
    let settings = this.state.settings,
      keys = Object.keys(settings);
    let propsList = keys.map((value, index) => {
      let currentValue = this.state.settings[value] || "";
      let defaultValue = "";
      if (!currentValue) {
        defaultValue = this.props.settings.getDefault(value);
      }

      return <tr>
        <td><label>{value}</label></td>
        <td><input style={inputStyle} onInput={(e) => { this.updateState(e) }} type="text" name={"SubtitleSetting." + value} value={currentValue} placeholder={defaultValue}></input></td>
      </tr>
    })
    return <span>
      <div style={modalStyle}>
        <h2>Subtitle Settings</h2>
        <form onKeyDown={(e) => { e.stopPropagation() }} onSubmit={this.apply}>
          <div style={settingsPaneStyle}>
            <table class="table">
              <thead>
                <col style="min-width:100px; padding-right:10px; text-align:right;"></col>
                <col style="min-width:200px; text-align:left;"></col>
              </thead>
              <tbody>
                {propsList}
              </tbody>
            </table>
          </div>
          <div title={JSON.stringify(this.state.settings, null, 4)}>
            Hover for Current Settings
          </div>
          <div style="text-align: center;">
            <button type="button" style="display: inline-block" class="button default-button small-button button-padding xsmall-margin-right" onClick={(e) => { this.cancel(e) }}>Cancel</button>
            <button type="button" style="display: inline-block" class="button default-button small-button button-padding xsmall-margin-right" onClick={(e) => { this.reset(e) }}>Reset All</button>
            <button type="submit" style="display: inline-block" class="button dark-button small-button button-padding" onClick={(e) => { this.apply(e) }}>Apply</button>
          </div>
        </form>
      </div>
      <div style={backdropStyle}>
      </div>
    </span>
  }
}