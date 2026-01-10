/*
 * This file is part of the NovaGlider project.
 *
 * Copyright (C) 2025 NovaGlider, Wannes Ghysels
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { cardsData } from '@/data/cards';

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  const initializeParticles = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).particlesJS) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).particlesJS('particles-js', {
        particles: {
          number: { value: 100, density: { enable: true, value_area: 800 } },
          color: { value: '#a78bfa' },
          shape: { type: 'circle' },
          opacity: { value: 1, random: true },
          size: { value: 4, random: true },
          line_linked: { enable: false, distance: 150, color: '#a78bfa', opacity: 0.2, width: 1 },
          move: { enable: true, speed: 1.5, direction: 'none', random: false, straight: false, out_mode: 'out' },
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
            onhover: { enable: false, mode: 'repulse' },
            onclick: { enable: false, mode: 'push' },
          },
          modes: {
            repulse: { distance: 100, duration: 0.4 },
            push: { particles_nb: 4 },
          },
        },
        retina_detect: true,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).particlesJS('particles-js-cards', {
        particles: {
          number: { value: 100, density: { enable: true, value_area: 800 } },
          color: { value: '#a78bfa' },
          shape: { type: 'circle' },
          opacity: { value: 0.7, random: true },
          size: { value: 4, random: true },
          line_linked: { enable: false, distance: 150, color: '#a78bfa', opacity: 0.2, width: 1 },
          move: { enable: true, speed: 1.5, direction: 'none', random: false, straight: false, out_mode: 'out' },
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
            onhover: { enable: false, mode: 'repulse' },
            onclick: { enable: false, mode: 'push' },
          },
          modes: {
            repulse: { distance: 100, duration: 0.4 },
            push: { particles_nb: 4 },
          },
        },
        retina_detect: true,
      });
    }
  };

  useEffect(() => {
    setIsClient(true);
    
    // Load particles.js script only on this page
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js';
    script.async = true;
    
    // Initialize particles after script loads
    script.onload = () => {
      initializeParticles();
    };
    
    script.onerror = () => {
      console.error('Failed to load particles.js');
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup: remove particles.js script when component unmounts
      if (script.parentElement) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Handle card tilt and glow effects
    const cardsDataArray = cardsData.cards;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eventListeners: Map<string, any> = new Map();

    function enableCardTiltGlow() {
      cardsDataArray.forEach((_, i) => {
        const card = document.getElementById(`tilt-card-${i}`);
        const glowOverlay = document.getElementById(`glow-overlay-${i}`);

        if (!card) return;

        if (window.innerWidth >= 768) {
          const tiltHandler = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
            const posX = (x / rect.width) * 100;
            const posY = (y / rect.height) * 100;

            if (glowOverlay) {
              glowOverlay.style.background = `
              radial-gradient(circle at ${posX}% ${posY}%,
              rgba(139, 92, 246, 0.5) 0%,
              rgba(139, 92, 246, 0.15) 40%,
              rgba(139, 92, 246, 0) 80%)
            `;
              glowOverlay.style.opacity = '1';
            }
          };

          const tiltLeaveHandler = () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
            if (glowOverlay) {
              glowOverlay.style.opacity = '0';
            }
          };

          card.addEventListener('mousemove', tiltHandler);
          card.addEventListener('mouseleave', tiltLeaveHandler);
          eventListeners.set(`tilt-${i}`, tiltHandler);
          eventListeners.set(`leave-${i}`, tiltLeaveHandler);
        }
      });
    }

    function disableCardTiltGlow() {
      cardsDataArray.forEach((_, i) => {
        const card = document.getElementById(`tilt-card-${i}`);
        if (card) {
          const tiltHandler = eventListeners.get(`tilt-${i}`);
          const tiltLeaveHandler = eventListeners.get(`leave-${i}`);
          if (tiltHandler) {
            card.removeEventListener('mousemove', tiltHandler);
          }
          if (tiltLeaveHandler) {
            card.removeEventListener('mouseleave', tiltLeaveHandler);
          }
          card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
          const glowOverlay = document.getElementById(`glow-overlay-${i}`);
          if (glowOverlay) {
            glowOverlay.style.opacity = '0';
          }
        }
      });
      eventListeners.clear();
    }

    function handleCardTiltGlow() {
      if (window.innerWidth >= 768) {
        enableCardTiltGlow();
      } else {
        disableCardTiltGlow();
      }
    }

    window.addEventListener('resize', handleCardTiltGlow);
    handleCardTiltGlow();

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (this: HTMLAnchorElement, e: Event) {
        const href = this.getAttribute('href');
        if (href) {
          const targetId = href.slice(1);
          const target = document.getElementById(targetId);
          if (target) {
            (e as MouseEvent).preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    return () => {
      window.removeEventListener('resize', handleCardTiltGlow);
      disableCardTiltGlow();
    };
  }, [isClient]);

  // Modal functions
  const [modal, setModal] = useState<{ visible: boolean; content: string; isHtml: boolean }>({
    visible: false,
    content: '',
    isHtml: false,
  });

  function showAlert(message: string) {
    setModal({ visible: true, content: message, isHtml: false });
  }

  function showAlertHTML(message: string) {
    setModal({ visible: true, content: message, isHtml: true });
  }

  function closeModal() {
    setModal({ visible: false, content: '', isHtml: false });
  }

  function contactModal(name: string, email: string, phone: string, url: string = '') {
    let msg = 'You can contact ' + name + ' at ';
    const hasEmail = email && email !== 'undefined' && email !== '';
    const hasPhone = phone && phone !== 'undefined' && phone !== '';
    const hasUrl = url && url !== 'undefined' && url !== '';
    
    const contacts = [];
    
    if (hasEmail) {
      contacts.push(`<a href='mailto:${email}' class='text-blue-400 underline hover:text-blue-300 transition-colors cursor-pointer'>${email}</a>`);
    }
    if (hasPhone) {
      contacts.push(`<a href='tel:${phone}' class='text-blue-400 underline hover:text-blue-300 transition-colors cursor-pointer'>${phone}</a>`);
    }
    if (hasUrl) {
      contacts.push(`<a href='${url}' target='_blank' rel='noopener noreferrer' class='text-blue-400 underline hover:text-blue-300 transition-colors cursor-pointer'>${url.replace(/^https?:\/\//, '')}</a>`);
    }
    
    if (contacts.length === 0) {
      noContact(name);
      return;
    }
    
    msg += '<br/> ' + contacts.join(' <br/> or <br/> ');
    showAlertHTML(msg);
  }

  function noContact(name: string) {
    const msg = `Sorry, ${name} doesnt have any contact info (yet).`;
    showAlert(msg);
  }

  return (
    <>
      {/* Section 1: Hero */}
      <section
        id="hero"
        className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative bg-gradient-to-b from-gray-950 to-black"
      >
        {/* Particles.js container */}
        <div id="particles-js" className="absolute inset-0 w-full h-full z-0"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05),transparent)] pointer-events-none z-10"></div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-4 drop-shadow-xl tracking-tight z-20">
          NovaGlider
        </h1>
        <p className="text-base sm:text-2xl sm:max-w-xl text-gray-300 backdrop-blur-md bg-white/5 px-4 py-3 rounded-xl border border-white/10 z-20">
          The first CanSat ever to deploy other flying objects mid air.
        </p>
        <a
          href="#intro"
          className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-transform duration-300 z-20"
        >
          Learn More
        </a>
      </section>

      {/* Section 2: Introduction */}
      <section
        id="intro"
        className="min-h-screen py-24 px-4 sm:px-6 flex flex-col items-center justify-center text-center bg-gradient-to-b from-black via-gray-900 to-gray-950"
      >
        <div className="w-full max-w-3xl backdrop-blur-md bg-white/5 p-6 sm:p-10 rounded-2xl border border-white/10 shadow-lg">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 tracking-tight">About Our Mission</h2>
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
            We are a team of creative and innovative students who are trying to build a CanSat that will deploy not one,
            but two gliders mid-air. Both gliders will be equipped with a GPS module to navigate autonomously to a designated
            landing zone. We will also build a live statistics dashboard to monitor the CanSat and gliders during the mission.
          </p>
        </div>
        <a
          href="#cards"
          className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-transform duration-300 z-20"
        >
          Meet our team
        </a>
      </section>

      {/* Section 3: Team Cards */}
      <section id="cards" className="flex items-center justify-center p-10 bg-black relative overflow-hidden select-none">
        {/* Particles.js container */}
        <div id="particles-js-cards" className="absolute inset-0 w-full h-full z-0"></div>

        {/* Flex container for title + cards */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-10 z-10 w-full max-w-7xl h-full">
          <div id="cards-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 w-full">
            {/* Title Box */}
            <div className="w-full max-w-sm mx-auto">
              <div className="relative bg-black/90 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-black/20 flex flex-col items-center justify-center text-center h-full">
                {cardsData.cards && cardsData.cards.length ? (
                  <>
                    <h1 className="text-4xl font-bold text-white mb-1 text-center">Meet the team.</h1>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto mt-4 text-center">
                      The people behind NovaGlider.
                    </p>
                  </>
                ) : (
                  <h1 className="text-4xl font-bold text-white mb-2 text-center">Failed to load information.</h1>
                )}
              </div>
            </div>

            {/* Cards */}
            {cardsData.cards.map((card, i) => (
              <div key={i} className="w-full max-w-sm mx-auto">
                <div
                  id={`tilt-card-${i}`}
                  className="relative bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 transition-transform duration-100 will-change-transform"
                >
                  <div id={`glow-overlay-${i}`} className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-100"></div>
                  <Image
                    src={card.img}
                    alt="Profile pic"
                    width={96}
                    height={96}
                    className="rounded-full mx-auto mb-4 shadow-lg relative z-20"
                  />
                  <h2 className="text-xl font-bold text-center text-white relative z-20">{card.name}</h2>
                  <p className="text-center text-blue-300 text-sm relative z-20">{card.role}</p>
                  <button
                    onClick={() => {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const cardAny = card as any;
                      if (card.email || card.phone || cardAny.url) {
                        contactModal(card.name, card.email || '', card.phone || '', cardAny.url || '');
                      } else {
                        noContact(card.name);
                      }
                    }}
                    className="mt-6 block mx-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2 rounded-full shadow-lg hover:scale-105 transition-transform duration-300 relative z-20 cursor-pointer"
                  >
                    Contact
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Modal Popup */}
          {modal.visible && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-opacity duration-300 opacity-100">
              <div className="bg-white/20 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-6 sm:p-8 max-w-xs w-[90%] relative flex flex-col items-center">
                {modal.isHtml ? (
                  <div
                    className="text-white text-center text-lg font-semibold mb-6"
                    dangerouslySetInnerHTML={{ __html: modal.content }}
                  />
                ) : (
                  <span className="text-white text-center text-lg font-semibold mb-6">{modal.content}</span>
                )}
                <button
                  onClick={closeModal}
                  className="mt-6 block mx-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2 rounded-full shadow-lg hover:scale-105 transition-transform duration-300 relative z-20 cursor-pointer"
                >
                  Close
                </button>
                <span
                  className="absolute top-2 right-4 text-white text-2xl cursor-pointer hover:scale-125 transition-transform duration-150"
                  onClick={closeModal}
                >
                  &times;
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-t from-black via-gray-950 to-gray-950 text-gray-500 py-6 text-center border-t border-white/10 px-4">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-2">
          <p className="text-sm sm:text-base font-medium tracking-wide">© 2025 NovaGlider. All rights reserved.</p>
          <p className="text-xs mt-1 text-gray-600">
            Made with <span className="text-pink-400">❤️</span> by the NovaGlider team.
          </p>
          {/* Green hosting badge temporarily commented out */}
          {/* <img src="https://app.greenweb.org/api/v3/greencheckimage/novaglider.mooo.com?nocache=true" alt="This website runs on green hosting - verified by thegreenwebfoundation.org" width="100px" /> */}
        </div>
      </footer>
    </>
  );
}
