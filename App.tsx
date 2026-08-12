"use client";

import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/site-pages/not-found";
import HomePage from "@/site-pages/HomePage";
import VehicleLockoutPage from "@/site-pages/VehicleLockoutPage";
import CarKeysPage from "@/site-pages/CarKeysPage";
import LostCarKeysPage from "@/site-pages/LostCarKeysPage";
import ServicesPage from "@/site-pages/ServicesPage";
import SpareCarKeyPage from "@/site-pages/SpareCarKeyPage";
import AreasPage from "@/site-pages/AreasPage";
import PricingPage from "@/site-pages/PricingPage";
import ReviewsPage from "@/site-pages/ReviewsPage";
import FAQsPage from "@/site-pages/FAQsPage";
import AboutPage from "@/site-pages/AboutPage";
import ContactPage from "@/site-pages/ContactPage";
import PrivacyPage from "@/site-pages/PrivacyPage";
import CookiesPage from "@/site-pages/CookiesPage";
import CookieConsent from "@/components/CookieConsent";
import StructuredData from "@/components/StructuredData";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    const pending = sessionStorage.getItem("scrollTarget");
    if (pending) {
      sessionStorage.removeItem("scrollTarget");
      // Allow React to finish rendering the new page before scrolling.
      // 250ms is reliable on both fast and slow mobile connections.
      setTimeout(() => {
        document.getElementById(pending)?.scrollIntoView({ behavior: "smooth" });
      }, 250);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/services" component={ServicesPage} />
        <Route path="/vehicle-lockout" component={VehicleLockoutPage} />
        <Route path="/car-keys" component={CarKeysPage} />
        <Route path="/lost-car-keys" component={LostCarKeysPage} />
        <Route path="/spare-car-key" component={SpareCarKeyPage} />
        <Route path="/areas-we-cover" component={AreasPage} />
        <Route path="/pricing" component={PricingPage} />
        <Route path="/reviews" component={ReviewsPage} />
        <Route path="/faqs" component={FAQsPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/cookies" component={CookiesPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <TooltipProvider>
      <StructuredData />
      <WouterRouter ssrPath="/">
        <Router />
        <CookieConsent />
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
