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
// @ts-ignore
import { SignupRolePage } from './SignupRolePage';
// @ts-ignore
import { CompanySignupPage } from './CompanySignupPage';
// @ts-ignore
import { EmployeeSignupPage } from './EmployeeSignupPage';

export function LandingPage() {
  const [activeTab, setActiveTab] = useState('home');
  const isDashboard = activeTab === 'dashboard';
  const isHome = activeTab === 'home';

  return (
    <div className={isDashboard ? 'relative h-screen w-screen overflow-hidden text-on-surface' : 'relative min-h-screen w-screen overflow-x-hidden bg-background text-on-surface flex flex-col'}>
      {!isDashboard && activeTab !== 'home' && <BackgroundScene />}

      {!isDashboard && <Navbar active={activeTab} setActive={setActiveTab} />}

      <main
        className={
          isDashboard
            ? 'relative h-screen w-screen overflow-hidden p-0'
            : isHome
              ? 'relative flex-1 px-4 pb-12 pt-24 md:px-8'
              : 'relative flex-1 flex items-center justify-center px-4 md:px-8 pt-24 pb-8 overflow-hidden'
        }
      >
        <div
          className={
            isDashboard
              ? 'h-full w-full'
              : isHome
                ? 'mx-auto flex w-full max-w-6xl flex-col items-center gap-16'
                : 'w-full max-w-6xl flex items-center justify-center'
          }
        >
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="w-full flex flex-col items-center gap-16"
              >
                <Hero onNavigate={setActiveTab} />
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
            {activeTab === 'signup' && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="w-full flex justify-center items-center"
              >
                <SignupRolePage onNavigate={setActiveTab} />
              </motion.div>
            )}
            {activeTab === 'signupCompany' && (
              <motion.div
                key="signupCompany"
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="w-full flex justify-center items-center"
              >
                <CompanySignupPage onNavigate={setActiveTab} />
              </motion.div>
            )}
            {activeTab === 'signupEmployee' && (
              <motion.div
                key="signupEmployee"
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="w-full flex justify-center items-center"
              >
                <EmployeeSignupPage onNavigate={setActiveTab} />
              </motion.div>
            )}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="h-full w-full"
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