import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const StyledWrapper = styled.div`
  font-family: 'Monorama', monospace;

  .matrix-loader {
    display: inline-flex;
    border: 2px solid #ffffff;
    --c: no-repeat linear-gradient(#ffffff 0 0) 50%;
    background: var(--c) calc(50% - 5px)/5px 5px,
      var(--c) calc(50% + 5px)/5px 5px;
  }

  .matrix-loader::before,
  .matrix-loader::after {
    content: "12 00 23 40 31 45 60 17 45 32 29 42 50 08 14 07 46 11 03 55";
    font-size: 30px;
    font-family: 'Monorama', monospace;
    font-weight: bold;
    line-height: 1em;
    height: 1em;
    width: 2ch;
    color: transparent;
    text-shadow: 0 0 0 #ffffff;
    overflow: hidden;
    margin: 5px 10px;
    animation: matrix 1s steps(20) infinite;
  }

  .matrix-loader::before {
    animation-duration: 1.5s;
  }

  @keyframes matrix {
    100% {
      text-shadow: 0 -20em 0 #ffffff
    }
  }

  .animate-message-fade {
    animation: messageFade 0.5s ease-in-out;
  }

  .logo {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes messageFade {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

export const LoadingScreen = () => {
  const [loadingMessage, setLoadingMessage] = useState('');

  const loadingMessages = [
    // System Status Messages
    "Initializing EDEN system...",
    "Powering up the engines...",
    "Connecting to the mainframe...",
    "Establishing secure connection...",
    
    // Tech Jokes
    "Convincing AI not to take over...",
    "Teaching robots to dance...",
    "Downloading more RAM...",
    "Dividing by zero...",
    "Converting caffeine to code...",
    "Generating random numbers by dice rolls...",
    "Spinning up the hamster wheels...",
    "Proving P=NP...",
    "Solving quantum equations...",
    "Debugging the debugger...",
    
    // Pop Culture References
    "Taking the red pill...",
    "Assembling the Avengers...",
    "Using the Force...",
    "Charging flux capacitor...",
    "Warming up the TARDIS...",
    "Activating ludicrous speed...",
    
    // Office Humor
    "Brewing your virtual coffee...",
    "Finding missing semicolons...",
    "Replacing coffee with RedBull...",
    "Updating update updater...",
    "Questioning existence of bugs...",
    "Blaming the intern...",
    "Looking busy...",
    
    // Internet Memes
    "Much loading, very wait...",
    "All your base are belong to us...",
    "Loading cat videos...",
    "Generating infinite memes...",
    "Doge is helping...",
    
    // Absurd Tech
    "Reticulating splines...",
    "Calibrating quantum flux...",
    "Reversing the polarity...",
    "Charging wireless cables...",
    "Installing common sense...",
    "Downloading more cloud...",
    
    // Task Manager Specific
    "Organizing your chaos...",
    "Making excuses for deadlines...",
    "Finding lost tasks under the couch...",
    "Teaching tasks to organize themselves...",
    "Negotiating with your calendar...",
    "Convincing tasks to complete themselves...",
    
    // Random Silliness
    "Counting backwards from infinity...",
    "Waiting for compiler to get coffee...",
    "Entertaining electrons...",
    "Charging spirit crystals...",
    "Consulting the magic 8-ball...",
    "Summoning the coding wizards...",
    "Generating witty loading messages...",
    "Pretending to do important things...",
    "Calculating meaning of life...",
    "Searching for missing socks...",
    
    // Tech Support Classics
    "Have you tried turning it off and on again?",
    "Cleaning up the coffee spills...",
    "Untangling the cables...",
    "Reading the manual (just kidding)...",
    
    // Motivational Jokes
    "Believing in yourself (and cookies)...",
    "Achieving digital enlightenment...",
    "Finding inner peace in binary...",
    "Meditating with motherboards..."
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return "Good Morning, Master Bell";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon, Master Bell";
    } else if (hour >= 17 && hour < 22) {
      return "Good Evening, Master Bell";
    } else {
      return "Good Night, Master Bell";
    }
  };

  useEffect(() => {
    const getRandomMessage = () => {
      const randomIndex = Math.floor(Math.random() * loadingMessages.length);
      return loadingMessages[randomIndex];
    };
    
    setLoadingMessage(getRandomMessage());
    
    const intervalId = setInterval(() => {
      setLoadingMessage(getRandomMessage());
    }, 4000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <StyledWrapper className="fixed inset-0 bg-[#1e293b] flex items-center justify-center z-50">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 space-y-8 text-center">
        <div className="space-y-4">
          <div className="logo w-24 h-24 mx-auto mb-8">
            <img 
              src="/eden-logo.svg" 
              alt="EDEN Logo" 
              className="w-full h-full"
            />
          </div>
          
          <h2 className="text-2xl font-bold text-[#f1f5f9] font-['Monorama']">
            {getGreeting()}
          </h2>
          
          <div className="matrix-loader" />
          
          <div className="h-6 min-w-[300px]">
            <p className="text-sm text-[#cbd5e1] animate-message-fade font-['Monorama']">
              {loadingMessage}
            </p>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

export default LoadingScreen; 