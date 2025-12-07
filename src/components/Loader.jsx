// components/Loader.jsx - Ocean Themed Loader
import { Html } from "@react-three/drei";

const Loader = () => {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center min-w-[200px]">
        
        {/* Main Ocean Loader */}
        <div className="relative w-28 h-28">
          
          {/* Outer rotating ring - water ripple */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              border: "3px solid transparent",
              borderTopColor: "#06b6d4",
              borderRightColor: "#0077be",
              animation: "spin 1.5s linear infinite",
            }}
          />
          
          {/* Middle ring - opposite rotation */}
          <div 
            className="absolute inset-3 rounded-full"
            style={{
              border: "2px solid transparent",
              borderBottomColor: "#00bfff",
              borderLeftColor: "#4fd1c5",
              animation: "spin 2s linear infinite reverse",
            }}
          />
          
          {/* Inner ocean circle */}
          <div 
            className="absolute inset-6 rounded-full overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #0ea5e9 0%, #0077be 40%, #004466 80%, #002244 100%)",
              boxShadow: `
                0 0 30px rgba(6, 182, 212, 0.5),
                inset 0 -10px 20px rgba(0, 0, 0, 0.3),
                inset 0 10px 20px rgba(255, 255, 255, 0.1)
              `,
            }}
          >
            {/* Water surface waves */}
            <div 
              className="absolute top-0 left-0 right-0 h-1/3"
              style={{
                background: "linear-gradient(180deg, rgba(255, 255, 255, 0.3), transparent)",
                animation: "waveTop 2s ease-in-out infinite",
              }}
            />
            
            {/* Rising bubbles */}
            <div 
              className="absolute w-2 h-2 bg-white/70 rounded-full"
              style={{
                left: "30%",
                animation: "bubbleRise 2s ease-in-out infinite",
              }}
            />
            <div 
              className="absolute w-1.5 h-1.5 bg-white/60 rounded-full"
              style={{
                left: "60%",
                animation: "bubbleRise 2.5s ease-in-out infinite 0.5s",
              }}
            />
            <div 
              className="absolute w-1 h-1 bg-white/50 rounded-full"
              style={{
                left: "45%",
                animation: "bubbleRise 1.8s ease-in-out infinite 1s",
              }}
            />
            
            {/* Small fish */}
            <div 
              className="absolute text-sm"
              style={{
                animation: "fishSwim 3s ease-in-out infinite",
              }}
            >
              🐠
            </div>
          </div>
          
          {/* Center anchor/submarine icon */}
          <div 
            className="absolute inset-0 flex items-center justify-center text-2xl"
            style={{
              animation: "float 2s ease-in-out infinite",
            }}
          >
            ⚓
          </div>
          
          {/* Sparkle effects */}
          <div 
            className="absolute top-2 right-2 w-2 h-2 bg-cyan-300 rounded-full"
            style={{ animation: "sparkle 1.5s ease-in-out infinite" }}
          />
          <div 
            className="absolute bottom-4 left-2 w-1.5 h-1.5 bg-blue-300 rounded-full"
            style={{ animation: "sparkle 2s ease-in-out infinite 0.5s" }}
          />
        </div>
        
        {/* Loading Text */}
        <div className="mt-6 text-center">
          <p 
            className="text-cyan-300 font-semibold text-lg tracking-widest"
            style={{
              textShadow: "0 0 20px rgba(6, 182, 212, 0.6)",
              animation: "textPulse 2s ease-in-out infinite",
            }}
          >
            DIVING IN
          </p>
          
          {/* Animated dots */}
          <div className="flex justify-center gap-1.5 mt-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  background: "linear-gradient(135deg, #06b6d4, #0077be)",
                  animation: `dotBounce 1.2s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                  boxShadow: "0 0 10px rgba(6, 182, 212, 0.5)",
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Wave decoration at bottom */}
        <div className="mt-4 w-32 h-6 relative overflow-hidden">
          <svg viewBox="0 0 120 20" className="absolute inset-0">
            <path
              d="M0,10 Q15,5 30,10 T60,10 T90,10 T120,10"
              fill="none"
              stroke="rgba(6, 182, 212, 0.5)"
              strokeWidth="2"
              style={{ animation: "wavePath 2s ease-in-out infinite" }}
            />
            <path
              d="M0,15 Q15,10 30,15 T60,15 T90,15 T120,15"
              fill="none"
              stroke="rgba(0, 119, 190, 0.3)"
              strokeWidth="1.5"
              style={{ animation: "wavePath 2.5s ease-in-out infinite reverse" }}
            />
          </svg>
        </div>
      </div>
      
      {/* Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes waveTop {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(2px) scaleY(0.8); }
        }
        
        @keyframes bubbleRise {
          0% {
            bottom: 10%;
            opacity: 0;
            transform: scale(0.5);
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 0.8;
          }
          100% {
            bottom: 90%;
            opacity: 0;
            transform: scale(1);
          }
        }
        
        @keyframes fishSwim {
          0% {
            left: -20%;
            top: 50%;
            transform: scaleX(1);
          }
          45% {
            transform: scaleX(1);
          }
          50% {
            left: 80%;
            transform: scaleX(-1);
          }
          95% {
            transform: scaleX(-1);
          }
          100% {
            left: -20%;
            top: 50%;
            transform: scaleX(1);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-3px) rotate(-5deg);
          }
          75% {
            transform: translateY(3px) rotate(5deg);
          }
        }
        
        @keyframes sparkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.3);
          }
        }
        
        @keyframes textPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes dotBounce {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-8px) scale(1.1);
          }
        }
        
        @keyframes wavePath {
          0% { transform: translateX(0); }
          100% { transform: translateX(-30px); }
        }
      `}</style>
    </Html>
  );
};

export default Loader;