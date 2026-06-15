"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { initMetaPixel, isMetaPixelEnabled, trackPageView } from "@/lib/analytics/meta-pixel";

const metaPixelBaseScript = `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
`;

function MetaPixelEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const enabled = isMetaPixelEnabled();
  const currentUrl = useMemo(() => {
    const queryString = searchParams.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!enabled) return;
    setReady(initMetaPixel());
  }, [enabled]);

  useEffect(() => {
    if (!ready) return;
    trackPageView();
  }, [currentUrl, ready]);

  if (!enabled) return null;

  return (
    <Script
      id="meta-pixel-base"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: metaPixelBaseScript }}
      onReady={() => {
        setReady(initMetaPixel());
      }}
    />
  );
}

export function MetaPixel() {
  return (
    <Suspense fallback={null}>
      <MetaPixelEvents />
    </Suspense>
  );
}
