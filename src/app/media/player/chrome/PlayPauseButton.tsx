import { Component, h } from 'preact';
import { SvgPathMorphAnimation } from '../../../libs/animation/SvgPathMorphAnimation';
import { EventHandler } from '../../../libs/events/EventHandler';
import { IPlayerApi, PlaybackState } from '../IPlayerApi';

const PLAY_PATH =
  'M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z';
const PAUSE_PATH = 'M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z';

export interface IPlayPauseButtonProps {
  api: IPlayerApi;
}

export class PlayPauseButton extends Component<IPlayPauseButtonProps, {}> {
  private _animation: SvgPathMorphAnimation | undefined;
  private _pathElement?: SVGPathElement;

  private _handler = new EventHandler(this);

  public componentDidMount() {
    if (this._pathElement) {
      this._animation = new SvgPathMorphAnimation(this._pathElement, 200);
    }

    this._handler.listen(
      this.props.api,
      'playbackstatechange',
      this._onPlaybackStateChange,
      false
    );
  }

  public componentWillUnmount() {
    if (this._animation) {
      this._animation.dispose();
      this._animation = undefined;
    }

    this._handler.removeAll();
  }

  public render(props: IPlayPauseButtonProps): JSX.Element {
    const d: string = this._isPlaying() ? PAUSE_PATH : PLAY_PATH;

    const onClick = () => this._onClick();
    const pathRef = (element?: Element) =>
      (this._pathElement = element as SVGPathElement);

    return (
      <button class="chrome-button chrome-play-button" onClick={onClick}>
        <svg width="100%" height="100%" version="1.1" viewBox="0 0 36 36">
          <path d={d} fill="#ffffff" ref={pathRef} />
        </svg>
      </button>
    );
  }

  private _isPlaying() {
    return this.props.api.getPreferredPlaybackState() === PlaybackState.PLAYING;
  }

  private _onClick() {
    if (this._isPlaying()) {
      this.props.api.pauseVideo();
    } else {
      this.props.api.playVideo();
    }
  }

  private _onPlaybackStateChange() {
    if (this._isPlaying()) {
      this._animate(PAUSE_PATH);
    } else {
      this._animate(PLAY_PATH);
    }
  }

  private _animate(path: string) {
    if (!this._animation || !this._pathElement) return;
    this._animation.stop();

    const currentPath = this._pathElement.getAttribute('d');
    if (currentPath && currentPath !== path) {
      this._animation.setFromPath(currentPath);
      this._animation.setToPath(path);

      this._animation.start();
    } else {
      this._pathElement.setAttribute('d', path);
    }
  }
}
