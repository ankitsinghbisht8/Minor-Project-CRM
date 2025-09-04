import React from 'react';
import Header from './Header';
import Hero from './Hero';
import TrustedBy from './TrustedBy';
import Features from './Features';
import ProductPreview from './ProductPreview';
import Testimonials from './Testimonials';
import CallToAction from './CallToAction';
import Footer from './Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <TrustedBy />
        <Features />
        <ProductPreview />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
