import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BackgroundScene } from '../components/layout/BackgroundScene';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../features/hero/Hero';
import { FeaturesSection } from '../features/features-section/FeaturesSection';
import { AboutSection } from '../features/about/AboutSection';
// @ts-ignore
import { LoginPage } from './LoginPage';
// @ts-ignore
import { Dashboard } from './Dashboard';

export function LandingPage() {
  const [activeTab, setActiveTab] = useState('home');
  const isDashboard = activeTab === 'dashboard';

  return (
    <div className="relative h-screen w-screen overflow-hidden text-on-surface flex flex-col justify-between">
      {!isDashboard && activeTab !== 'home' && <BackgroundScene />}
      
      {!isDashboard && <Navbar active={activeTab} setActive={setActiveTab} />}
      
      <main className={`relative flex-1 flex items-center justify-center overflow-hidden ${isDashboard ? 'p-0 pt-0 pb-0' : 'px-4 md:px-8 pt-24 pb-6'}`}>
        <div className={`h-full flex items-center justify-center ${isDashboard ? 'w-full max-w-full' : 'w-full max-w-6xl'}`}>
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
            {activeTab === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="w-full flex justify-center items-center"
              >
                <LoginPage onNavigate={setActiveTab} />
              </motion.div>
            )}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="w-full h-full"
              >
                <Dashboard onNavigate={setActiveTab} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      {!isDashboard && <Footer />}
    </div>
  );
}
