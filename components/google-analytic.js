'use client'

import { GoogleAnalytics } from "nextjs-google-analytics";

const GoogleAnalyticsInit = () => {

    return <GoogleAnalytics trackPageViews strategy="lazyOnload" />

}
export default GoogleAnalyticsInit