import React, { useState, useRef, useEffect, useMemo } from 'react';
import './SplashPage.css';
import ProfileCard from './ProfileCard';
import MagicBento from './MagicBento';
import GradientBlinds from './GradientBlinds';
import TrueFocus from './TrueFocus';
import { useCallback } from 'react';

const SplashPage = ({ onComplete }) => {
  // Background configuration — edit these values here to tune the background
  const bgConfig = useMemo(() => ({
    gradientColors: ['#5227FF', '#ff9ffc'],
    angle: 20, // blinds angle in degrees
    noise: 0,
    blindCount: 14,
    blindMinWidth: 60,
    spotlightRadius: 0.6,
    spotlightSoftness: 0.5,
    spotlightOpacity: 1,
    mouseDampening: 0.2,
    distortAmount: 0,
    shineDirection: 'left',
    mixBlendMode: 'screen',
    // cardColor controls the inner card background color in MagicBento
    cardColor: 'var(--background-dark)',
    opacity: 1
  }), []);

  const [bgOpacity, setBgOpacity] = useState(bgConfig.opacity);
  const [isHovering, setIsHovering] = useState(false);
  const splashRef = useRef(null);
  const profileWrapRef = useRef(null);
  const magicWrapRef = useRef(null);
  const [tfPos, setTfPos] = useState({ left: 24, bottom: 24 });

  const updateTrueFocusPosition = useCallback(() => {
    const container = splashRef.current;
    const magicWrap = magicWrapRef.current;
    const profileWrap = profileWrapRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    // find leftmost magic bento card inside magicWrap
    let left = 24;
    if (magicWrap) {
      const leftmost = magicWrap.querySelector('.magic-bento-card');
      if (leftmost) {
        const lrect = leftmost.getBoundingClientRect();
        left = Math.max(8, lrect.left - containerRect.left);
      }
    }

    // align bottom with profile card bottom
    let bottom = 24;
    if (profileWrap) {
      const prect = profileWrap.getBoundingClientRect();
      bottom = Math.max(8, containerRect.bottom - prect.bottom);
    }

    setTfPos({ left, bottom });
  }, []);

  const handleHoverChange = isHover => {
    setIsHovering(isHover);
    if (isHover) {
      // immediately lower opacity when hovering the profile
      setBgOpacity(0.12);
    } else {
      // immediately restore target opacity; CSS will animate the change smoothly
      setBgOpacity(bgConfig.opacity);
    }
  };

  useEffect(() => {
    updateTrueFocusPosition();
    window.addEventListener('resize', updateTrueFocusPosition);
    const ro = new MutationObserver(updateTrueFocusPosition);
    const magicWrap = magicWrapRef.current;
    if (magicWrap) ro.observe(magicWrap, { childList: true, subtree: true });
    return () => {
      window.removeEventListener('resize', updateTrueFocusPosition);
      ro.disconnect();
    };
  }, [updateTrueFocusPosition]);

  return (
    <div className="splash-container" ref={splashRef}>
      <GradientBlinds {...bgConfig} className="splash-bg-blinds" opacity={bgOpacity} />
      <div className="splash-card-wrap" style={{ '--pc-card-scale': '0.80' }}>
        <div ref={profileWrapRef}>
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
        onHoverChange={handleHoverChange}
        />
        </div>
      </div>
      
      <div className="splash-magicbento-wrap" ref={magicWrapRef}>
        {/* Only dim cards when background is actually dimmed; keep them fully opaque by default */}
        <MagicBento
          cardColor={bgConfig.cardColor}
          onComplete={onComplete}
          cardsOpacity={isHovering ? bgOpacity : 1}
        />
      </div>
      {/* TrueFocus animated text positioned relative to leftmost card and profile bottom */}
      <TrueFocus
        sentence="Launching Soon"
        manualMode={false}
        blurAmount={3}
        borderColor="#5227FF"
        pauseBetweenAnimations={1.5}
        size="2.35rem"
        style={{ left: `${tfPos.left}px`, bottom: `${tfPos.bottom}px` }}
        hoverOpacity={isHovering ? bgOpacity : 1}
      />
    </div>
  );
};

export default SplashPage;
