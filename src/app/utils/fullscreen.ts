declare interface IVendorFullscreenElement extends Element {
  mozRequestFullScreen(): void;
  msRequestFullscreen(): void;
}

declare interface IVendorDocument extends Document {
  mozFullScreenElement: Element;
  msFullscreenElement: Element;

  mozFullScreenEnabled: boolean;
  webkitFullscreenEnabled: boolean;
  msFullscreenEnabled: boolean;
  mozCancelFullScreen(): void;
  msExitFullscreen(): void;
}

export function isFullscreenEnabled() {
  const doc = document as IVendorDocument;

  if (typeof doc.mozFullScreenEnabled === 'boolean') {
    return doc.mozFullScreenEnabled;
  } else if (typeof doc.fullscreenEnabled === 'boolean') {
    return doc.fullscreenEnabled;
  } else if (typeof doc.webkitFullscreenEnabled === 'boolean') {
    return doc.webkitFullscreenEnabled;
  } else if (typeof doc.msFullscreenEnabled === 'boolean') {
    return doc.msFullscreenEnabled;
  }

  return true;
}

export function requestFullscreen(element: Element) {
  const el = element as IVendorFullscreenElement;
  if (typeof el.requestFullscreen === 'function') {
    el.requestFullscreen();
  } else if (typeof el.mozRequestFullScreen === 'function') {
    el.mozRequestFullScreen();
  } else if (typeof el.webkitRequestFullScreen === 'function') {
    el.webkitRequestFullScreen();
  } else if (typeof el.msRequestFullscreen === 'function') {
    el.msRequestFullscreen();
  }
}

export function exitFullscreen() {
  const doc = document as IVendorDocument;
  if (typeof doc.exitFullscreen === 'function') {
    doc.exitFullscreen();
  } else if (typeof doc.webkitExitFullscreen === 'function') {
    doc.webkitExitFullscreen();
  } else if (typeof doc.mozCancelFullScreen === 'function') {
    doc.mozCancelFullScreen();
  } else if (typeof doc.msExitFullscreen === 'function') {
    doc.msExitFullscreen();
  }
}

export function getFullscreenElement(): Element | undefined {
  const doc = document as IVendorDocument;
  if (doc.fullscreenElement) {
    return doc.fullscreenElement;
  } else if (doc.webkitFullscreenElement) {
    return doc.webkitFullscreenElement;
  } else if (doc.mozFullScreenElement) {
    return doc.mozFullScreenElement;
  } else if (doc.msFullscreenElement) {
    return doc.msFullscreenElement;
  }
  return undefined;
}
