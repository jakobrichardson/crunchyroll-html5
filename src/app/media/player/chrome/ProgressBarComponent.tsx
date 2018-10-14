import { Component, h } from 'preact';
import { BrowserEvent } from '../../../libs/events/BrowserEvent';
import { EventHandler } from '../../../libs/events/EventHandler';
import { vendorPrefix } from '../../../utils/style';
import { parseAndFormatTime } from '../../../utils/time';
import { DurationChangeEvent } from '../DurationChangeEvent';
import { IPlayerApi } from '../IPlayerApi';
import { TimeUpdateEvent } from '../TimeUpdateEvent';

export interface IChromeProgressBarProps {
  api: IPlayerApi;
  onHover: (time: number, percentage: number) => void;
  onEndHover: () => void;
}

export class ChromeProgressBarComponent extends Component<
  IChromeProgressBarProps,
  {}
> {
  private _containerElement?: Element;
  private _progressBarElement?: Element;
  private _scrubberElement?: Element;
  private _playElement?: Element;
  private _loadElement?: Element;
  private _hoverElement?: Element;

  private _width: number = 0;
  private _left: number = 0;
  private _handler = new EventHandler(this);

  private _dragging: boolean = false;

  private _duration: number = 0;
  private _playTime: number = 0;
  private _loadTime: number = 0;
  private _hoverTime: number = 0;

  private _visibility: boolean = false;

  public setInternalVisibility(visibility: boolean) {
    this._visibility = visibility;
    if (this._visibility) {
      this._updateState();
    }
  }

  public componentDidMount() {
    if (!this._containerElement) return;
    const rect = this._containerElement.getBoundingClientRect();
    this._width = rect.width;
    this._left = rect.left;

    this._handler
      .listen(this._containerElement, 'mousedown', this._onMouseDown, false)
      .listen(document, 'mousemove', this._onMouseMove, { passive: true })
      .listen(document, 'mouseup', this._onMouseUp, false)
      .listen(this._containerElement, 'mouseenter', this._onMouseEnter, {
        passive: true
      })
      .listen(this._containerElement, 'mouseleave', this._onMouseLeave, {
        passive: true
      })
      .listen(this.props.api, 'durationchange', this._onDurationChange, false)
      .listen(this.props.api, 'timeupdate', this._onTimeUpdate, false)
      .listen(this.props.api, 'progress', this._onProgress, false)
      .listen(this.props.api, 'resize', this._onResize, false);
    this._updateState();
  }

  public componentWillUnmount() {
    this._handler.removeAll();
  }

  public render(): JSX.Element {
    const containerRef = (el?: Element) => (this._containerElement = el);
    const progressBarRef = (el?: Element) => (this._progressBarElement = el);
    const scrubberRef = (el?: Element) => (this._scrubberElement = el);
    const playRef = (el?: Element) => (this._playElement = el);
    const loadRef = (el?: Element) => (this._loadElement = el);
    const hoverRef = (el?: Element) => (this._hoverElement = el);

    return (
      <div class="chrome-progress-bar-container" ref={containerRef}>
        <div
          ref={progressBarRef}
          class="chrome-progress-bar"
          role="slider"
          aria-label="Seek slider"
          aria-valuemin={0}
          aria-valuemax={this._duration}
          aria-valuenow={this._playTime}
          aria-valuetext={
            parseAndFormatTime(this._playTime) +
            ' of ' +
            parseAndFormatTime(this._duration)
          }
          draggable={true}>
          <div class="chrome-progress-bar-padding" />
          <div class="chrome-progress-list">
            <div
              class="chrome-play-progress chrome-swatch-background-color"
              ref={playRef}
            />
            <div class="chrome-load-progress" ref={loadRef} />
            <div
              class="chrome-hover-progress chrome-hover-progress--light"
              ref={hoverRef}
            />
          </div>
          <div class="chrome-scrubber-container" ref={scrubberRef}>
            <div class="chrome-scrubber-button chrome-swatch-background-color">
              <div class="chrome-scrubber-pull-indicator" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  private _onDurationChange(e: DurationChangeEvent) {
    this._duration = e.duration;
    this._updateState();
  }

  private _onTimeUpdate(e: TimeUpdateEvent) {
    this._playTime = e.time;
    this._updateState();
  }

  private _onResize() {
    if (this._containerElement) {
      const rect = this._containerElement.getBoundingClientRect();
      this._width = rect.width;
      this._left = rect.left;
    }
  }

  private _onMouseDown(e: BrowserEvent) {
    if (e.button !== 0 || this._dragging) return;
    e.preventDefault();
    this._dragging = true;

    this._onMouseMove(e);
  }

  private _onMouseMove(e: BrowserEvent) {
    if (
      !this._containerElement ||
      (!this._dragging &&
        e.target !== this._containerElement &&
        !this._containerElement.contains(e.target as Node))
    )
      return;

    const left = Math.max(Math.min(e.clientX - this._left, this._width), 0);

    const percentage = left / this._width;

    const time = percentage * this._duration;

    this.props.onHover(time, percentage);

    this._hoverTime = time;

    if (this._dragging) {
      this._playTime = time;
      this.props.api.setForcePaused(true);
      this.props.api.seekTo(time);
    }
    this._updateState();
  }

  private _onMouseUp(e: BrowserEvent) {
    if (e.button !== 0 || !this._dragging) return;
    this._dragging = false;

    this.props.api.setForcePaused(false);

    if (
      !this._containerElement ||
      (e.target !== this._containerElement &&
        !this._containerElement.contains(e.target as Node))
    ) {
      this.props.onEndHover();
    }
  }

  private _onMouseEnter(e: BrowserEvent) {
    const left = Math.max(Math.min(e.clientX - this._left, this._width), 0);
    const percentage = left / this._width;
    const time = percentage * this._duration;

    this.props.onHover(time, left);
  }

  private _onMouseLeave(e: BrowserEvent) {
    this._hoverTime = 0;
    this._updateState();
    this.props.onEndHover();
  }

  private _onProgress() {
    this._loadTime = this.props.api.getBufferedTime();
    this._updateState();
  }

  private _updateState() {
    if (!this._visibility) return;
    const playPercentage =
      this._duration === 0 ? 0 : this._playTime / this._duration;
    const loadPercentage =
      this._duration === 0 ? 0 : this._loadTime / this._duration;
    const hoverPercentage =
      this._duration === 0 ? 0 : this._hoverTime / this._duration;

    const scrubberStyle = vendorPrefix(
      'transform',
      'translateX(' + this._width * playPercentage + 'px)'
    );
    const playStyle =
      'left: 0;' + vendorPrefix('transform', 'scaleX(' + playPercentage + ')');
    const loadStyle =
      'left: 0;' + vendorPrefix('transform', 'scaleX(' + loadPercentage + ')');
    const hoverStyle =
      'left: ' +
      this._width * playPercentage +
      'px;' +
      vendorPrefix(
        'transform',
        'scaleX(' + Math.max(hoverPercentage - playPercentage, 0) + ')'
      );

    if (this._scrubberElement) {
      this._scrubberElement.setAttribute('style', scrubberStyle);
    }
    if (this._playElement) {
      this._playElement.setAttribute('style', playStyle);
    }
    if (this._loadElement) {
      this._loadElement.setAttribute('style', loadStyle);
    }
    if (this._hoverElement) {
      this._hoverElement.setAttribute('style', hoverStyle);
    }

    if (this._progressBarElement) {
      this._progressBarElement.setAttribute('aria-valuemin', '0');
      this._progressBarElement.setAttribute(
        'aria-valuemax',
        this._duration + ''
      );
      this._progressBarElement.setAttribute(
        'aria-valuenow',
        this._playTime + ''
      );
      this._progressBarElement.setAttribute(
        'aria-valuetext',
        parseAndFormatTime(this._playTime) +
          ' of ' +
          parseAndFormatTime(this._duration)
      );
    }
  }
}
