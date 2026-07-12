import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BackgroundScene } from '../components/layout/BackgroundScene';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../features/hero/Hero';
import { FeaturesSection } from '../features/features-section/FeaturesSection';
import { AboutSection } from '../features/about/AboutSection';

export function LandingPage() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background text-on-surface flex flex-col justify-between">
      <BackgroundScene />
      
      <Navbar active={activeTab} setActive={setActiveTab} />
      
      <main className="relative flex-1 flex items-center justify-center px-4 md:px-8 pt-24 pb-6 overflow-hidden">
        <div className="w-full max-w-6xl h-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="w-full flex justify-center items-center"
              >
                <Hero onNavigate={setActiveTab} />
              </motion.div>
            )}
            {activeTab === 'features' && (
              <motion.div
                key="features"
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="w-full flex justify-center items-center"
              >
                <FeaturesSection />
              </motion.div>
            )}
            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="w-full flex justify-center items-center"
              >
                <AboutSection />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
