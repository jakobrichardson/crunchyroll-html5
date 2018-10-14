import { Component, h } from 'preact';
import { EventHandler } from '../../../libs/events/EventHandler';
import { IPlayerApi, IVideoDetail } from '../IPlayerApi';

export interface INextVideoButtonProps {
  api: IPlayerApi;
  onHover?: (detail: IVideoDetail) => void;
  onEndHover?: () => void;
}

export class NextVideoButton extends Component<INextVideoButtonProps, {}> {
  private _handler = new EventHandler(this);

  public componentDidMount() {
    if (!this.base) throw new Error('Base is undefined');
    this._handler
      .listen(this.base, 'mouseover', this._onMouseOver, { passive: true })
      .listen(this.base, 'mouseout', this._onMouseOut, { passive: true })
      .listen(
        this.props.api,
        'nextvideochange',
        this._onNextVideoChange,
        false
      );
    this._onNextVideoChange();
  }

  public componentWillUnmount() {
    this._handler.removeAll();
  }

  public render(): JSX.Element {
    const detail = this._getNextVideoDetail();

    const href = detail ? detail.url : '';
    const style = detail ? '' : 'display: none;';

    const onClick = (e: Event) => {
      this.props.api.playNextVideo();
      e.preventDefault();
    };

    return (
      <a
        class="chrome-button chrome-next-button"
        onClick={onClick}
        href={href}
        style={style}>
        <svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%">
          <path
            fill="#ffffff"
            d="M 12,24 20.5,18 12,12 V 24 z M 22,12 v 12 h 2 V 12 h -2 z"
          />
        </svg>
      </a>
    );
  }

  private _onNextVideoChange() {
    if (!this.base) throw new Error('Base is undefined');
    const nextVideo = this._getNextVideoDetail();
    if (nextVideo) {
      this.base.style.display = '';
      this.base.setAttribute('href', nextVideo.url);
    } else {
      this.base.style.display = 'none';
      this.base.setAttribute('href', '');
    }
  }

  private _getNextVideoDetail(): IVideoDetail | undefined {
    return this.props.api.getNextVideoDetail();
  }

  private _onMouseOver() {
    if (typeof this.props.onHover === 'function') {
      const nextVideo = this._getNextVideoDetail();
      if (nextVideo) {
        this.props.onHover(nextVideo);
      }
    }
  }

  private _onMouseOut() {
    if (typeof this.props.onEndHover === 'function') {
      this.props.onEndHover();
    }
  }
}
