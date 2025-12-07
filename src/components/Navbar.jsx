// components/Navbar.jsx - Beautiful Ocean Themed Navbar
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Calculate scroll progress for underwater effect
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? window.scrollY / docHeight : 0;
      setScrollProgress(Math.min(1, progress));
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { to: "/", label: "Home", icon: "🏠" },
    { to: "/about", label: "About", icon: "🐚" },
    { to: "/projects", label: "Projects", icon: "🐙" },
    { to: "/contact", label: "Contact", icon: "📬" },
  ];

  // Dynamic background based on scroll
  const getNavBackground = () => {
    if (!isScrolled) return "transparent";
    
    const underwaterProgress = Math.min(1, scrollProgress * 2);
    if (underwaterProgress > 0.3) {
      return `rgba(0, ${40 + underwaterProgress * 30}, ${80 + underwaterProgress * 40}, 0.85)`;
    }
    return "rgba(15, 23, 42, 0.85)";
  };

  return (
    <>
      {/* Animated bubbles in navbar background */}
      <div 
        className={`fixed top-0 left-0 right-0 h-16 overflow-hidden pointer-events-none z-40 transition-opacity duration-500 ${
          isScrolled && scrollProgress > 0.1 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${15 + i * 20}%`,
              bottom: '-10px',
              animation: `navBubble ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? "py-2" : "py-4"
        }`}
        style={{
          background: getNavBackground(),
          backdropFilter: isScrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: isScrolled ? "blur(20px)" : "none",
          borderBottom: isScrolled 
            ? `1px solid rgba(79, 209, 197, ${0.1 + scrollProgress * 0.2})` 
            : "none",
          boxShadow: isScrolled 
            ? `0 4px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(79, 209, 197, ${scrollProgress * 0.2})` 
            : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Logo */}
            <NavLink to="/" className="relative group">
              <div
                className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-bold text-lg sm:text-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 overflow-hidden ${
                  isScrolled
                    ? "shadow-lg"
                    : "border border-white/30"
                }`}
                style={{
                  background: isScrolled 
                    ? "linear-gradient(135deg, #06b6d4, #0077be, #004466)"
                    : "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(10px)",
                  boxShadow: isScrolled ? "0 0 25px rgba(6, 182, 212, 0.4)" : "none",
                }}
              >
                {/* Wave effect inside logo */}
                <div 
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: "linear-gradient(180deg, transparent 40%, rgba(255,255,255,0.3) 100%)",
                    animation: "waveMove 3s ease-in-out infinite",
                  }}
                />
                
                <span className="relative z-10 text-white font-extrabold tracking-tight">
                  AK
                </span>
                
                {/* Bubble decoration */}
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white/50 rounded-full group-hover:animate-ping" />
                <div className="absolute bottom-2 left-2 w-1 h-1 bg-cyan-300/50 rounded-full group-hover:animate-bounce" />
              </div>
              
              {/* Glow effect */}
              <div 
                className={`absolute inset-0 rounded-2xl blur-xl transition-all duration-500 ${
                  isScrolled ? "opacity-50" : "opacity-0"
                }`}
                style={{ background: "#06b6d4" }}
              />
            </NavLink>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link, index) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `relative px-4 lg:px-5 py-2.5 rounded-xl font-medium text-sm lg:text-base transition-all duration-300 group overflow-hidden ${
                      isActive
                        ? "text-cyan-300"
                        : "text-white/80 hover:text-white"
                    }`
                  }
                  style={({ isActive }) => ({
                    background: isActive 
                      ? "rgba(6, 182, 212, 0.15)" 
                      : "transparent",
                    border: isActive 
                      ? "1px solid rgba(6, 182, 212, 0.3)" 
                      : "1px solid transparent",
                  })}
                >
                  {({ isActive }) => (
                    <>
                      {/* Hover background effect */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                        style={{
                          background: "linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(0, 119, 190, 0.1))",
                        }}
                      />
                      
                      <span className="relative z-10 flex items-center gap-2">
                        <span 
                          className={`text-lg transition-transform duration-300 ${
                            isActive ? "animate-bounce" : "group-hover:scale-110"
                          }`}
                          style={{ animationDuration: "2s" }}
                        >
                          {link.icon}
                        </span>
                        {link.label}
                      </span>
                      
                      {/* Active indicator - wave line */}
                      <span 
                        className={`absolute bottom-0 left-1/2 h-0.5 rounded-full transition-all duration-300 transform -translate-x-1/2 ${
                          isActive ? "w-3/4 opacity-100" : "w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-50"
                        }`}
                        style={{
                          background: "linear-gradient(90deg, transparent, #06b6d4, #00bfff, transparent)",
                        }}
                      />
                      
                      {/* Bubble on hover */}
                      <div 
                        className="absolute -bottom-4 left-1/2 w-1 h-1 bg-cyan-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"
                        style={{ 
                          transform: "translateX(-50%)",
                          animationDuration: "1s" 
                        }}
                      />
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* CTA Button - Desktop */}
            <div className="hidden md:block">
              <NavLink
                to="/contact"
                className="relative overflow-hidden px-6 py-3 rounded-xl font-semibold text-sm lg:text-base text-white transition-all duration-300 hover:scale-105 hover:shadow-xl group flex items-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #06b6d4, #0077be)",
                  boxShadow: "0 4px 25px rgba(6, 182, 212, 0.4)",
                }}
              >
                {/* Animated wave inside button */}
                <div 
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                    animation: "shimmer 2s ease-in-out infinite",
                  }}
                />
                
                {/* Fish swimming across on hover */}
                <span 
                  className="absolute opacity-0 group-hover:opacity-100 transition-all duration-700 text-lg"
                  style={{
                    animation: "swimAcross 2s ease-in-out infinite",
                  }}
                >
                  🐟
                </span>
                
                <span className="relative z-10">🌊</span>
                <span className="relative z-10">Hire Me</span>
                
                {/* Shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </NavLink>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
              style={{
                background: isMobileMenuOpen 
                  ? "linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(0, 119, 190, 0.3))"
                  : "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
              aria-label="Toggle mobile menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between items-center">
                <span
                  className={`w-6 h-0.5 rounded-full transition-all duration-300 ${
                    isMobileMenuOpen ? "rotate-45 translate-y-2 bg-cyan-300" : "bg-white"
                  }`}
                />
                <span
                  className={`w-4 h-0.5 rounded-full transition-all duration-300 ${
                    isMobileMenuOpen ? "opacity-0 scale-0" : "bg-white"
                  }`}
                />
                <span
                  className={`w-6 h-0.5 rounded-full transition-all duration-300 ${
                    isMobileMenuOpen ? "-rotate-45 -translate-y-2 bg-cyan-300" : "bg-white"
                  }`}
                />
              </div>
              
              {/* Ripple effect */}
              <div 
                className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                  isMobileMenuOpen ? "animate-ping opacity-30" : "opacity-0"
                }`}
                style={{ background: "#06b6d4" }}
              />
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-500 ease-out ${
              isMobileMenuOpen ? "max-h-[400px] opacity-100 mt-4" : "max-h-0 opacity-0"
            }`}
          >
            <div
              className="rounded-2xl p-4 space-y-2"
              style={{
                background: "linear-gradient(180deg, rgba(0, 60, 100, 0.95), rgba(0, 40, 70, 0.98))",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(79, 209, 197, 0.2)",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              }}
            >
              {/* Decorative bubbles */}
              <div className="absolute top-4 right-4 w-3 h-3 bg-cyan-400/20 rounded-full animate-pulse" />
              <div className="absolute top-8 right-8 w-2 h-2 bg-blue-400/30 rounded-full animate-bounce" />
              
              {navLinks.map((link, index) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 ${
                      isActive
                        ? "text-cyan-300"
                        : "text-white/80 hover:text-white"
                    }`
                  }
                  style={({ isActive }) => ({
                    background: isActive 
                      ? "linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(0, 119, 190, 0.15))"
                      : "transparent",
                    border: isActive 
                      ? "1px solid rgba(6, 182, 212, 0.3)"
                      : "1px solid transparent",
                    animationDelay: `${index * 0.1}s`,
                  })}
                >
                  <span 
                    className="text-2xl"
                    style={{
                      animation: `floatIcon 2s ease-in-out infinite`,
                      animationDelay: `${index * 0.2}s`,
                    }}
                  >
                    {link.icon}
                  </span>
                  <span className="text-base">{link.label}</span>
                  
                  {/* Arrow indicator */}
                  <span className="ml-auto text-cyan-400/50">→</span>
                </NavLink>
              ))}
              
              {/* Mobile CTA */}
              <div className="pt-2 mt-2 border-t border-white/10">
                <NavLink
                  to="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-3 w-full px-4 py-4 rounded-xl font-semibold text-white transition-all duration-300 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #06b6d4, #0077be)",
                    boxShadow: "0 4px 20px rgba(6, 182, 212, 0.4)",
                  }}
                >
                  <span className="text-xl">🌊</span>
                  <span>Hire Me</span>
                  <span className="text-xl">🐠</span>
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* CSS Animations */}
      <style>{`
        @keyframes navBubble {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-60px) scale(0.5);
            opacity: 0;
          }
        }
        
        @keyframes waveMove {
          0%, 100% {
            transform: translateX(-50%);
          }
          50% {
            transform: translateX(50%);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes swimAcross {
          0% {
            left: -20px;
            transform: scaleX(1);
          }
          45% {
            transform: scaleX(1);
          }
          50% {
            transform: scaleX(-1);
          }
          100% {
            left: calc(100% + 20px);
            transform: scaleX(-1);
          }
        }
        
        @keyframes floatIcon {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;