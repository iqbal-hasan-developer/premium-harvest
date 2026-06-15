import { analyticsConfig } from "@/lib/constants";

type MetaContent = {
  id: string;
  quantity: number;
  item_price?: number;
};

export type MetaPixelParams = {
  content_ids?: string[];
  content_name?: string;
  content_type?: "product" | "product_group" | string;
  contents?: MetaContent[];
  currency?: string;
  num_items?: number;
  order_id?: string;
  order_number?: string;
  value?: number;
};

type Fbq = {
  (command: "init", pixelId: string): void;
  (command: "track", eventName: string, params?: MetaPixelParams): void;
  callMethod?: (...args: unknown[]) => void;
  push?: Fbq;
  loaded?: boolean;
  version?: string;
  queue?: unknown[];
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

let initializedPixelId: string | null = null;
const META_PIXEL_SCRIPT_ID = "meta-pixel-sdk";

function getPixelId() {
  return analyticsConfig.metaPixelId.trim();
}

function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function ensureFbqStub() {
  if (!isBrowser()) return undefined;
  if (window.fbq) return window.fbq;

  const fbq = ((...args: unknown[]) => {
    const currentFbq = window.fbq;
    if (currentFbq?.callMethod) {
      currentFbq.callMethod(...args);
      return;
    }

    currentFbq?.queue?.push(args);
  }) as Fbq;

  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;

  if (!document.getElementById(META_PIXEL_SCRIPT_ID)) {
    const script = document.createElement("script");
    script.id = META_PIXEL_SCRIPT_ID;
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }

  return fbq;
}

export function isMetaPixelEnabled() {
  return Boolean(getPixelId());
}

export function initMetaPixel() {
  const pixelId = getPixelId();
  if (!pixelId || !isBrowser()) return false;

  const fbq = ensureFbqStub();
  if (!fbq) return false;

  if (initializedPixelId !== pixelId) {
    fbq("init", pixelId);
    initializedPixelId = pixelId;
  }

  return true;
}

function track(eventName: string, params?: MetaPixelParams) {
  if (!initMetaPixel() || !window.fbq) return;

  const payload = params ? { currency: analyticsConfig.currency, ...params } : undefined;
  window.fbq("track", eventName, payload);

  if (process.env.NODE_ENV === "development") {
    console.debug(`[Meta Pixel] ${eventName}`, payload ?? {});
  }
}

export function trackPageView() {
  track("PageView");
}

export function trackViewContent(params: MetaPixelParams) {
  track("ViewContent", params);
}

export function trackAddToCart(params: MetaPixelParams) {
  track("AddToCart", params);
}

export function trackInitiateCheckout(params: MetaPixelParams) {
  track("InitiateCheckout", params);
}

export function trackPurchase(params: MetaPixelParams) {
  track("Purchase", params);
}

export function trackLead(params: MetaPixelParams) {
  track("Lead", params);
}
