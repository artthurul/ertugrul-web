import React from 'react';
import './SplashPage.css';
import ProfileCard from './ProfileCard';
import DecryptedText from './DecryptedText';
import MagicBento from './MagicBento';
import GradientBlinds from './GradientBlinds';

const SplashPage = ({ onComplete }) => {
  // Background configuration — edit these values here to tune the background
  const bgConfig = {
    gradientColors: ['#5227FF', '#ff9ffc'],
    angle: 20, // blinds angle in degrees
    noise: 0,
    blindCount: 14,
    blindMinWidth: 60,
    spotlightRadius: 0.4,
    spotlightSoftness: 1,
    spotlightOpacity: 1,
    mouseDampening: 0.2,
    distortAmount: 0,
    shineDirection: 'left',
    mixBlendMode: 'screen',
    // cardColor controls the inner card background color in MagicBento
    cardColor: 'var(--background-dark)',
    opacity: 0.42
  };

  return (
    <div className="splash-container">
      <GradientBlinds {...bgConfig} className="splash-bg-blinds" />
      <div className="splash-card-wrap" style={{ '--pc-card-scale': '0.80' }}>
        <ProfileCard
        name="Ertuğrul Eren Durak"
        title="Computer Engineer"
        handle="ertugrulerendurak"
        status="Online"
        contactText="Contact Me"
        avatarUrl="/images/avatar.png"
        miniAvatarUrl="/images/mini-avatar.png"
        iconUrl="/images/icon.png"
        grainUrl="/images/grain.png"
        showUserInfo
        enableTilt
        enableMobileTilt
        onContactClick={() =>
          window.open('https://www.linkedin.com/in/ertugrul-eren-durak/', '_blank', 'noopener,noreferrer')
        }
        behindGlowEnabled={false}
        behindGlowColor="hsla(337, 100%, 70%, 0.6)"
        innerGradient="linear-gradient(145deg,hsla(337, 40%, 45%, 0.55) 0%,hsla(337, 60%, 70%, 0.27) 100%)"
        />
      </div>
      
      <div className="splash-magicbento-wrap">
        <MagicBento cardColor={bgConfig.cardColor} onComplete={onComplete} />
      </div>
    </div>
  );
};

export default SplashPage;
