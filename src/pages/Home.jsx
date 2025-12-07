// Home.jsx - Redesigned Ocean-themed Home Page with integrated components
import { Suspense, useEffect, useState, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import Loader from "../components/Loader";
import Boat from "../models/boat";
import { Sky } from "../models/sky";
import Ocean from "../models/Ocean";
import Character from "../models/character";
import Birds from "../models/birds";
import { Fish } from "../models/fish";

gsap.registerPlugin(ScrollTrigger);

// ============ 3D COMPONENTS ============

// Swimming Fish Component
const SwimmingFish = ({ initialPosition, speed = 1, bounds = { x: 10, y: 5, z: 5 }, scale = 1.2 }) => {
  const fishRef = useRef();
  const targetRef = useRef(new THREE.Vector3(...initialPosition));
  const velocityRef = useRef(new THREE.Vector3());
  const wanderAngle = useRef(Math.random() * Math.PI * 2);

  useFrame((state, delta) => {
    if (!fishRef.current) return;

    const time = state.clock.elapsedTime * speed;
    const fish = fishRef.current;

    wanderAngle.current += (Math.random() - 0.5) * 0.3;

    if (Math.random() < 0.02) {
      const wanderX = Math.cos(wanderAngle.current) * bounds.x;
      const wanderY = Math.sin(time * 0.5) * bounds.y * 0.5;
      const wanderZ = Math.sin(wanderAngle.current) * bounds.z;

      targetRef.current.set(
        THREE.MathUtils.clamp(wanderX, -bounds.x, bounds.x),
        THREE.MathUtils.clamp(initialPosition[1] + wanderY, initialPosition[1] - bounds.y, initialPosition[1] + bounds.y),
        THREE.MathUtils.clamp(initialPosition[2] + wanderZ, initialPosition[2] - bounds.z, initialPosition[2] + bounds.z)
      );
    }

    const direction = new THREE.Vector3().subVectors(targetRef.current, fish.position);
    const distance = direction.length();
    
    if (distance > 0.1) {
      direction.normalize();
      velocityRef.current.lerp(direction.multiplyScalar(speed * 0.3), 0.05);
    }

    fish.position.add(velocityRef.current.clone().multiplyScalar(delta));
    fish.position.y += Math.sin(time * 3) * 0.008;
    fish.position.x += Math.cos(time * 2) * 0.003;

    if (velocityRef.current.length() > 0.01) {
      const lookTarget = fish.position.clone().add(velocityRef.current);
      fish.lookAt(lookTarget);
      fish.rotation.y += Math.PI;
    }

    fish.rotation.z = Math.sin(time * 10) * 0.15;
  });

  return (
    <group ref={fishRef} position={initialPosition}>
      <Fish scale={0.4 * scale} />
    </group>
  );
};

// Fish School Component
const FishSchool = ({ scrollProgress = 0 }) => {
  const fishData = useMemo(() => [
    { position: [8, 2, -25], speed: 0.6, scale: 0.5, bounds: { x: 15, y: 4, z: 8 } },
    { position: [-10, 0, -30], speed: 0.5, scale: 0.4, bounds: { x: 12, y: 3, z: 6 } },
    { position: [5, -5, -15], speed: 0.7, scale: 0.8, bounds: { x: 18, y: 6, z: 10 } },
    { position: [-8, -8, -18], speed: 0.55, scale: 0.7, bounds: { x: 15, y: 5, z: 8 } },
    { position: [0, -15, -10], speed: 0.8, scale: 1.5, bounds: { x: 25, y: 10, z: 12 } },
    { position: [-12, -20, -8], speed: 0.65, scale: 1.8, bounds: { x: 30, y: 12, z: 15 } },
    { position: [15, -25, -12], speed: 0.75, scale: 1.4, bounds: { x: 22, y: 10, z: 10 } },
    { position: [8, -30, -6], speed: 0.9, scale: 2.0, bounds: { x: 35, y: 15, z: 18 } },
    { position: [-5, -35, -10], speed: 0.7, scale: 1.6, bounds: { x: 28, y: 12, z: 14 } },
    { position: [10, -45, -8], speed: 0.85, scale: 2.2, bounds: { x: 40, y: 18, z: 20 } },
    { position: [-15, -50, -5], speed: 0.6, scale: 2.5, bounds: { x: 45, y: 20, z: 22 } },
  ], []);

  return (
    <>
      {fishData.map((fish, index) => (
        <SwimmingFish
          key={index}
          initialPosition={fish.position}
          speed={fish.speed}
          bounds={fish.bounds}
          scale={fish.scale}
        />
      ))}
    </>
  );
};

// Scroll-following Camera
const ScrollCamera = ({ scrollProgress }) => {
  const { camera } = useThree();

  useFrame(() => {
    const targetY = 5 - scrollProgress * 60;
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);

    const targetZ = 15 - scrollProgress * 5;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.03);
  });

  return null;
};

// Dynamic Lighting
const DynamicLighting = ({ scrollProgress }) => {
  const ambientRef = useRef();
  const directionalRef = useRef();

  useFrame(() => {
    if (!ambientRef.current || !directionalRef.current) return;

    const underwaterProgress = Math.min(1, scrollProgress * 2);

    ambientRef.current.intensity = THREE.MathUtils.lerp(0.5, 0.25, underwaterProgress);
    ambientRef.current.color.setHex(underwaterProgress < 0.5 ? 0xffffff : 0x4fd1c5);

    directionalRef.current.intensity = THREE.MathUtils.lerp(2, 0.5, underwaterProgress);
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.5} />
      <directionalLight ref={directionalRef} position={[1, 10, 1]} intensity={2} />
      <hemisphereLight skyColor="#b1e1ff" groundColor="#006994" intensity={1} />

      {scrollProgress > 0.1 && (
        <>
          <spotLight position={[5, 30, 0]} angle={0.3} penumbra={1} intensity={0.8 * scrollProgress} color="#4fd1c5" />
          <spotLight position={[-5, 30, 5]} angle={0.25} penumbra={1} intensity={0.6 * scrollProgress} color="#00bfff" />
        </>
      )}

      {scrollProgress > 0.15 && (
        <fog attach="fog" args={['#006994', 5 + (1 - scrollProgress) * 20, 50]} />
      )}
    </>
  );
};

// ============ UI COMPONENTS ============

// Animated Bubble
const Bubble = ({ delay, duration, startX, size, variant = 'normal' }) => {
  const bubbleRef = useRef();

  useEffect(() => {
    if (!bubbleRef.current) return;

    const bubble = bubbleRef.current;

    const animateBubble = () => {
      gsap.set(bubble, { y: 0, x: 0, scale: 0, opacity: 0 });

      gsap.to(bubble, { scale: 1, opacity: 0.8, duration: 0.3, ease: "back.out(2)" });

      gsap.to(bubble, {
        y: -window.innerHeight - 300,
        duration: duration,
        ease: "none",
        onComplete: animateBubble,
      });

      gsap.to(bubble, {
        x: "random(-80, 80)",
        duration: duration / 6,
        ease: "sine.inOut",
        repeat: 5,
        yoyo: true,
      });

      gsap.to(bubble, {
        scaleX: "random(0.85, 1.15)",
        scaleY: "random(0.85, 1.15)",
        duration: 0.4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      gsap.to(bubble, {
        opacity: 0,
        scale: 1.3,
        duration: duration * 0.15,
        delay: duration * 0.85,
        ease: "power2.out",
      });
    };

    const timeout = setTimeout(animateBubble, delay * 1000);

    return () => {
      clearTimeout(timeout);
      gsap.killTweensOf(bubble);
    };
  }, [delay, duration]);

  const isBig = variant === 'big';

  return (
    <div
      ref={bubbleRef}
      className="absolute pointer-events-none"
      style={{
        left: `${startX}%`,
        bottom: '-150px',
        filter: 'drop-shadow(0 0 10px rgba(100, 200, 255, 0.5))',
      }}
    >
      <div
        className="relative rounded-full"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 25% 25%, 
            rgba(255, 255, 255, 0.95) 0%,
            rgba(255, 255, 255, 0.6) 10%,
            rgba(135, 206, 250, 0.4) 30%,
            rgba(100, 180, 255, 0.2) 50%,
            rgba(70, 150, 220, 0.1) 70%,
            transparent 80%
          )`,
          border: `${isBig ? 3 : 2}px solid rgba(255, 255, 255, 0.6)`,
          boxShadow: `
            inset 0 0 ${size * 0.3}px rgba(255, 255, 255, 0.4),
            inset -${size * 0.1}px -${size * 0.1}px ${size * 0.2}px rgba(100, 200, 255, 0.3),
            0 0 ${size * 0.2}px rgba(100, 200, 255, 0.4)
          `,
        }}
      >
        <div
          className="absolute bg-white rounded-full"
          style={{
            width: size * 0.35,
            height: size * 0.25,
            top: '12%',
            left: '15%',
            opacity: 0.95,
            transform: 'rotate(-40deg)',
            filter: 'blur(1px)',
          }}
        />
      </div>
    </div>
  );
};

// Giant Bubble
const GiantBubble = ({ delay, startX }) => {
  const bubbleRef = useRef();

  useEffect(() => {
    if (!bubbleRef.current) return;

    const bubble = bubbleRef.current;

    const animateBubble = () => {
      gsap.set(bubble, { y: 0, x: 0, scale: 0, opacity: 0, rotation: 0 });

      gsap.to(bubble, { scale: 1, opacity: 0.6, duration: 1, ease: "elastic.out(1, 0.5)" });

      gsap.to(bubble, {
        y: -window.innerHeight - 400,
        rotation: 360,
        duration: 20,
        ease: "none",
        onComplete: animateBubble,
      });

      gsap.to(bubble, {
        x: "random(-100, 100)",
        duration: 3,
        ease: "sine.inOut",
        repeat: 6,
        yoyo: true,
      });

      gsap.to(bubble, { opacity: 0, scale: 1.5, duration: 2, delay: 18, ease: "power2.out" });
    };

    const timeout = setTimeout(animateBubble, delay * 1000);

    return () => {
      clearTimeout(timeout);
      gsap.killTweensOf(bubble);
    };
  }, [delay]);

  return (
    <div
      ref={bubbleRef}
      className="absolute pointer-events-none"
      style={{ left: `${startX}%`, bottom: '-200px' }}
    >
      <div
        className="relative rounded-full"
        style={{
          width: 120,
          height: 120,
          background: `radial-gradient(circle at 30% 30%, 
            rgba(255, 255, 255, 0.9) 0%,
            rgba(255, 255, 255, 0.5) 15%,
            rgba(135, 206, 250, 0.3) 35%,
            rgba(100, 180, 255, 0.15) 55%,
            transparent 75%
          )`,
          border: '4px solid rgba(255, 255, 255, 0.5)',
          boxShadow: `
            inset 0 0 50px rgba(255, 255, 255, 0.3),
            0 0 30px rgba(100, 200, 255, 0.4)
          `,
        }}
      >
        <div
          className="absolute rounded-full"
          style={{
            width: 50,
            height: 35,
            top: '10%',
            left: '10%',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,200,200,0.3))',
            filter: 'blur(2px)',
            transform: 'rotate(-30deg)',
          }}
        />
      </div>
    </div>
  );
};

// Floating Particles
const FloatingParticles = ({ count = 50 }) => {
  const particles = useMemo(() => {
    return [...Array(count)].map(() => ({
      size: Math.random() * 6 + 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
      opacity: 0.1 + Math.random() * 0.3,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 8,
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-float-particle"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
            background: `rgba(255, 255, 255, ${p.opacity})`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

// Glass Card Component
const GlassCard = ({ children, className = "", delay = 0 }) => {
  const cardRef = useRef();

  useEffect(() => {
    if (!cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        delay: delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-2xl md:rounded-3xl p-6 md:p-8 transform hover:scale-[1.02] transition-all duration-500 ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 80px rgba(79, 209, 197, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      }}
    >
      <div
        className="absolute top-0 left-0 w-full h-1/2 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
          borderRadius: '24px 24px 0 0',
        }}
      />
      {children}
    </div>
  );
};

// Skill Bar Component
const SkillBar = ({ skill, level, color, delay = 0 }) => {
  const barRef = useRef();

  useEffect(() => {
    if (!barRef.current) return;

    gsap.fromTo(
      barRef.current,
      { width: '0%' },
      {
        width: `${level}%`,
        duration: 1.5,
        delay: delay,
        ease: "power2.out",
        scrollTrigger: {
          trigger: barRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, [level, delay]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-blue-100 text-sm md:text-base">
        <span className="font-medium">{skill}</span>
        <span className="text-cyan-300 font-semibold">{level}%</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2.5 md:h-3 overflow-hidden">
        <div
          ref={barRef}
          className="h-full rounded-full"
          style={{
            width: '0%',
            background: `linear-gradient(90deg, ${color}66, ${color})`,
            boxShadow: `0 0 15px ${color}66, 0 0 30px ${color}33`,
          }}
        />
      </div>
    </div>
  );
};

// Journey Item Component
const JourneyItem = ({ year, title, description, icon, index }) => {
  const itemRef = useRef();

  useEffect(() => {
    if (!itemRef.current) return;

    gsap.fromTo(
      itemRef.current,
      { opacity: 0, x: index % 2 === 0 ? -50 : 50 },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: itemRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, [index]);

  return (
    <div
      ref={itemRef}
      className="relative flex flex-col sm:flex-row items-start gap-4 sm:gap-6 p-4 sm:p-6 rounded-xl sm:rounded-2xl transition-all duration-300 hover:transform hover:translate-x-2"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div
        className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-2xl sm:text-3xl"
        style={{
          background: 'linear-gradient(135deg, rgba(79, 209, 197, 0.3), rgba(0, 119, 190, 0.3))',
          border: '2px solid rgba(79, 209, 197, 0.5)',
        }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <span className="text-cyan-400 font-semibold text-sm sm:text-base">{year}</span>
        <h4 className="text-lg sm:text-xl font-bold text-white mt-1">{title}</h4>
        <p className="text-blue-200 mt-2 text-sm sm:text-base">{description}</p>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ number, label, icon, delay = 0 }) => {
  const cardRef = useRef();

  useEffect(() => {
    if (!cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { opacity: 0, scale: 0.5, rotateY: 90 },
      {
        opacity: 1,
        scale: 1,
        rotateY: 0,
        duration: 0.6,
        delay: delay,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className="text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl transition-all duration-500 hover:scale-110 hover:rotate-1 group cursor-pointer"
      style={{
        background: 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
      }}
    >
      <div className="text-2xl sm:text-4xl mb-2 sm:mb-3 group-hover:animate-bounce">{icon}</div>
      <div
        className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 text-transparent bg-clip-text"
        style={{
          backgroundImage: 'linear-gradient(135deg, #4fd1c5, #63b3ed)',
          WebkitBackgroundClip: 'text',
        }}
      >
        {number}
      </div>
      <div className="text-blue-200 font-medium text-xs sm:text-sm">{label}</div>
    </div>
  );
};

// Swaying Seaweed
const SwayingSeaweed = ({ x, height, color = '#22c55e', delay = 0 }) => {
  const seaweedRef = useRef();

  useEffect(() => {
    if (!seaweedRef.current) return;

    gsap.to(seaweedRef.current, {
      rotateZ: 8,
      duration: 2 + Math.random(),
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      delay: delay,
    });
  }, [delay]);

  return (
    <div
      ref={seaweedRef}
      className="absolute bottom-0 origin-bottom"
      style={{
        left: `${x}%`,
        width: '25px',
        height: `${height}px`,
        background: `linear-gradient(to top, ${color}88, ${color}cc, ${color})`,
        borderRadius: '60% 60% 0 0',
        filter: 'blur(0.5px)',
        opacity: 0.8,
        boxShadow: `0 0 20px ${color}44`,
      }}
    >
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            width: 15,
            height: 30,
            left: i % 2 === 0 ? -10 : 15,
            top: `${20 + i * 25}%`,
            background: `linear-gradient(${i % 2 === 0 ? '45deg' : '-45deg'}, ${color}, transparent)`,
            borderRadius: '50%',
            transform: `rotate(${i % 2 === 0 ? -30 : 30}deg)`,
          }}
        />
      ))}
    </div>
  );
};

// Coral Decoration
const Coral = ({ x, type = 'branch', color = '#ff6b6b' }) => {
  const height = type === 'branch' ? 80 : 50;

  return (
    <div className="absolute bottom-0" style={{ left: `${x}%`, width: type === 'branch' ? 40 : 60, height: height, opacity: 0.9 }}>
      {type === 'branch' ? (
        <svg width="40" height={height} viewBox="0 0 40 80">
          <path
            d={`M20,80 Q15,60 20,40 Q25,20 15,5 M20,40 Q30,30 35,15 M20,55 Q10,45 5,30`}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="15" cy="5" r="5" fill={color} />
          <circle cx="35" cy="15" r="4" fill={color} />
          <circle cx="5" cy="30" r="4" fill={color} />
        </svg>
      ) : (
        <div
          style={{
            width: 60,
            height: 50,
            background: `radial-gradient(circle at 30% 30%, ${color}, ${color}88)`,
            borderRadius: '50% 50% 40% 40%',
            boxShadow: `inset 0 -10px 20px ${color}44`,
          }}
        />
      )}
    </div>
  );
};

// Project Carousel Component
const ProjectCarousel = () => {
  const [activeProject, setActiveProject] = useState(0);
  const carouselRef = useRef(null);

  const projects = [
    {
      title: "ToyStop E-commerce Web App & Nursery Garden Dashboard",
      technologies: ["React.js", "Tailwind CSS", "Chart.js"],
      description: [
        "Built a dynamic React.js toy store with product filters, cart management, and secure routing",
        "Designed an interactive plant inventory dashboard with real-time watering alerts and analytics charts",
        "Implemented responsive design ensuring seamless experience across all devices"
      ],
      features: ["E-commerce functionality", "Real-time alerts", "Data visualization", "Responsive design"],
      category: "React.js"
    },
    {
      title: "Sudha Sundar Hospital Appointment System",
      technologies: ["PHP", "MySQL", "JavaScript", "Bootstrap"],
      description: [
        "Developed a comprehensive online appointment booking system for patient-doctor consultations",
        "Created dual admin and user modules for managing appointments, schedules, and patient records",
        "Implemented automated notification system for appointment confirmations and reminders"
      ],
      features: ["Online booking", "Doctor scheduling", "Patient management", "Notifications"],
      category: "PHP / MySQL"
    },
    {
      title: "School Management Systems",
      technologies: ["PHP", "MySQL", "JavaScript", "AJAX"],
      description: [
        "Designed and implemented multi-user web applications for multiple educational institutions",
        "Features include online exams, homework assignments, mark entry, and role-based access control",
        "Created intuitive dashboards for administrators, teachers, students, and parents"
      ],
      features: ["Role-based access", "Online exams", "Grade management", "Parent portal"],
      category: "PHP, MySQL, JS"
    },
    {
      title: "Dakshin Sahodaya School Sports Competition",
      technologies: ["PHP", "MySQL", "jQuery", "PDF Generation"],
      description: [
        "Built a multi-school competition registration and result management platform covering 2 districts",
        "Enabled smooth student entry validation and automated result publishing for 30+ events",
        "Implemented real-time score updates and certificate generation system"
      ],
      features: ["Multi-school platform", "Real-time results", "Certificate generation", "Event management"],
      category: "PHP / MySQL"
    }
  ];

  const nextProject = () => {
    setActiveProject((prev) => (prev + 1) % projects.length);
  };

  const prevProject = () => {
    setActiveProject((prev) => (prev - 1 + projects.length) % projects.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextProject();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Navigation Dots */}
      <div className="flex justify-center gap-2 mb-8">
        {projects.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveProject(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              activeProject === index 
                ? 'bg-cyan-400 scale-125' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Carousel Container */}
      <div
        ref={carouselRef}
        className="relative overflow-hidden rounded-3xl"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Navigation Arrows */}
        <button
          onClick={prevProject}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-all duration-300 group"
          style={{ border: '1px solid rgba(255, 255, 255, 0.2)' }}
        >
          <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextProject}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-all duration-300 group"
          style={{ border: '1px solid rgba(255, 255, 255, 0.2)' }}
        >
          <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Project Content */}
        <div className="p-8 md:p-12">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* Left Column - Project Info */}
            <div className="lg:w-2/3 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{
                    background: 'rgba(79, 209, 197, 0.2)',
                    border: '1px solid rgba(79, 209, 197, 0.4)',
                    color: '#4fd1c5'
                  }}
                >
                  {projects[activeProject].category}
                </span>
                <span className="text-cyan-300 text-sm">Featured Project</span>
              </div>

              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                {projects[activeProject].title}
              </h3>

              {/* Technologies */}
              <div className="flex flex-wrap gap-2">
                {projects[activeProject].technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-lg text-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#bae6fd'
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
                {projects[activeProject].features.map((feature, index) => (
                  <div
                    key={index}
                    className="text-center p-3 rounded-lg"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <span className="text-cyan-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Description */}
              <ul className="space-y-3">
                {projects[activeProject].description.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-cyan-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-blue-100">{point}</span>
                  </li>
                ))}
              </ul>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #4fd1c5, #0077be)',
                    boxShadow: '0 4px 20px rgba(79, 209, 197, 0.3)',
                  }}
                >
                  <span>View Details</span>
                  <span>🔍</span>
                </button>
                <button
                  className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 flex items-center gap-2"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <span>Live Demo</span>
                  <span>🚀</span>
                </button>
              </div>
            </div>

            {/* Right Column - Visual Preview */}
            <div className="lg:w-1/3 flex justify-center">
              <div
                className="w-full max-w-md aspect-video rounded-2xl overflow-hidden relative group"
                style={{
                  background: 'linear-gradient(135deg, rgba(79, 209, 197, 0.1), rgba(0, 119, 190, 0.2))',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4 opacity-50">💻</div>
                    <p className="text-blue-200 font-medium">Project Preview</p>
                    <p className="text-blue-300 text-sm mt-2">Interactive Demo Available</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6">
                  <button
                    className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm text-white text-sm font-medium hover:bg-white/30 transition-all"
                    style={{ border: '1px solid rgba(255, 255, 255, 0.3)' }}
                  >
                    View Full Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div
            className="h-full bg-cyan-400 transition-all duration-500"
            style={{ width: `${((activeProject + 1) / projects.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Project Counter */}
      <div className="absolute -top-12 right-0 text-right">
        <div className="text-cyan-300 text-sm">
          <span className="text-2xl font-bold">{activeProject + 1}</span>
          <span className="text-white/50"> / {projects.length}</span>
        </div>
        <div className="text-white/70 text-xs">Projects</div>
      </div>
    </div>
  );
};

// Contact Form Component
const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Contact Info */}
      <div>
        <h3 className="text-3xl font-bold mb-6 text-white">Let's Connect</h3>
        <p className="text-blue-200 mb-8 text-lg">
          I'm always open to discussing new opportunities, creative projects, or potential collaborations. 
          Feel free to reach out for any web development needs or just to say hello!
        </p>
        
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(79, 209, 197, 0.15)',
                border: '1px solid rgba(79, 209, 197, 0.3)',
              }}
            >
              <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-blue-300 font-medium text-sm mb-1">Email</p>
              <p className="text-white text-lg">ajithkumar@portfolio.dev</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(79, 209, 197, 0.15)',
                border: '1px solid rgba(79, 209, 197, 0.3)',
              }}
            >
              <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-blue-300 font-medium text-sm mb-1">Location</p>
              <p className="text-white text-lg">Tamil Nadu, India</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(79, 209, 197, 0.15)',
                border: '1px solid rgba(79, 209, 197, 0.3)',
              }}
            >
              <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-blue-300 font-medium text-sm mb-1">Response Time</p>
              <p className="text-white text-lg">Within 24 hours</p>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-12">
          <p className="text-blue-300 mb-4">Connect with me on</p>
          <div className="flex gap-4">
            {['GitHub', 'LinkedIn', 'Twitter', 'Instagram'].map((platform, index) => (
              <a
                key={index}
                href="#"
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span className="text-white">{['💻', '💼', '🐦', '📸'][index]}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
      
      {/* Contact Form */}
      <div>
        <div className="relative"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '40px',
          }}
        >
          {isSubmitted ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(79, 209, 197, 0.2), rgba(0, 119, 190, 0.2))',
                  border: '2px solid rgba(79, 209, 197, 0.5)',
                }}
              >
                <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-2xl font-bold text-white mb-3">Message Sent!</h4>
              <p className="text-blue-200">
                Thank you for your message. I'll get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-blue-300 mb-3 font-medium">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 rounded-xl text-white placeholder-blue-400/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-blue-300 mb-3 font-medium">Your Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 rounded-xl text-white placeholder-blue-400/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-blue-300 mb-3 font-medium">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full px-5 py-4 rounded-xl text-white placeholder-blue-400/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                  placeholder="Enter your message"
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                style={{
                  background: 'linear-gradient(135deg, #4fd1c5, #0077be)',
                  boxShadow: '0 4px 30px rgba(79, 209, 197, 0.4)',
                }}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <span className="group-hover:translate-x-1 transition-transform">🌊</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// Skills Section Component
const SkillsSection = () => {
  const skills = [
    { name: 'React.js & Next.js', level: 90, color: '#61dafb' },
    { name: 'PHP & Laravel', level: 85, color: '#777bb3' },
    { name: 'MySQL & MongoDB', level: 80, color: '#4db33d' },
    { name: 'JavaScript & TypeScript', level: 85, color: '#f0db4f' },
    { name: 'UI/UX Design', level: 75, color: '#ff7eb6' },
    { name: 'Node.js & Express', level: 70, color: '#68a063' },
    { name: 'Tailwind CSS', level: 85, color: '#38bdf8' },
    { name: 'Git & GitHub', level: 80, color: '#f1502f' },
  ];

  const additionalSkills = [
    'HTML5', 'CSS3', 'REST APIs', 'Responsive Design', 'Problem Solving', 
    'Team Collaboration', 'Agile Methodologies', 'Figma', 'Chart.js', 'Bootstrap'
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Skills & Technologies</h3>
        <p className="text-blue-200 max-w-2xl mx-auto">
          I've worked with a wide range of technologies and tools to build modern, scalable web applications
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Left Column - Skill Bars */}
        <div className="space-y-6">
          {skills.map((skill, index) => (
            <SkillBar
              key={index}
              skill={skill.name}
              level={skill.level}
              color={skill.color}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Right Column - Additional Skills */}
        <div>
          <h4 className="text-xl font-bold text-white mb-6">Additional Skills</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {additionalSkills.map((skill, index) => (
              <div
                key={index}
                className="px-4 py-3 rounded-xl text-center transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#bae6fd',
                }}
              >
                {skill}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Education Section Component
const EducationSection = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Education</h3>
        <p className="text-blue-200">My academic background and certifications</p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 to-blue-500/30"></div>

        <div className="space-y-8">
          {/* B.Sc. Computer Science */}
          <div className="relative">
            <div className="flex">
              <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center z-10"
                style={{
                  background: 'linear-gradient(135deg, rgba(79, 209, 197, 0.3), rgba(0, 119, 190, 0.3))',
                  border: '2px solid rgba(79, 209, 197, 0.5)',
                }}
              >
                <span className="text-white font-bold">🎓</span>
              </div>
              
              <div className="ml-6 flex-1">
                <div
                  className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                    <h4 className="text-xl font-bold text-white">B.Sc. in Computer Science</h4>
                    <span className="text-cyan-400 font-medium mt-1 md:mt-0">2019 – 2022</span>
                  </div>
                  
                  <p className="text-blue-300 font-medium mb-2">First Class - 8.29/10 CGPA</p>
                  <p className="text-white mb-4">Manonmaniam Sundaranar University</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {['Data Structures', 'Algorithms', 'Web Development', 'Database Management', 'Software Engineering'].map((course, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg text-sm"
                        style={{
                          background: 'rgba(79, 209, 197, 0.1)',
                          border: '1px solid rgba(79, 209, 197, 0.3)',
                          color: '#4fd1c5'
                        }}
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="relative">
            <div className="flex">
              <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center z-10"
                style={{
                  background: 'linear-gradient(135deg, rgba(79, 209, 197, 0.3), rgba(0, 119, 190, 0.3))',
                  border: '2px solid rgba(79, 209, 197, 0.5)',
                }}
              >
                <span className="text-white font-bold">📜</span>
              </div>
              
              <div className="ml-6 flex-1">
                <div
                  className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <h4 className="text-xl font-bold text-white mb-4">Certifications</h4>
                  
                  <div className="space-y-4">
                    {[
                      { title: 'Full-Stack Web Development', issuer: 'Udemy', year: '2023' },
                      { title: 'React.js Advanced Concepts', issuer: 'Coursera', year: '2023' },
                      { title: 'PHP & MySQL Certification', issuer: 'W3Schools', year: '2022' }
                    ].map((cert, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 rounded-lg"
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <div>
                          <p className="text-white font-medium">{cert.title}</p>
                          <p className="text-blue-300 text-sm">{cert.issuer}</p>
                        </div>
                        <span className="text-cyan-400 text-sm">{cert.year}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Declaration */}
      <div className="mt-16 text-center">
        <div
          className="inline-block p-8 rounded-2xl max-w-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <h4 className="text-2xl font-bold text-white mb-6">Declaration</h4>
          <p className="text-blue-200 italic mb-6">
            "I hereby declare that the information provided above is true and accurate to the best of my knowledge."
          </p>
          <div className="mt-8">
            <p className="text-cyan-400 font-bold text-xl">AJITH KUMAR V</p>
            <p className="text-blue-300 mt-2">Full-Stack Web Developer</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ MAIN COMPONENT ============

const Home = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showHeroContent, setShowHeroContent] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const containerRef = useRef(null);
  const heroContentRef = useRef(null);

  // Model configurations
  const [modelConfig, setModelConfig] = useState({
    scale: [1, 1, 1],
    position: [5, -4.5, -13],
    rotation: [0.1, -0.5, 0],
  });

  const [characterConfig, setCharacterConfig] = useState({
    scale: [0.8, 0.8, 0.8],
    position: [0, 1.2, 0],
    rotation: [0, 0, 0],
  });

  const [birdsConfig, setBirdsConfig] = useState({ scale: 0.04 });

  // Data
  const skills = [
    { skill: "React.js & Next.js", level: 90, color: "#61dafb" },
    { skill: "PHP & Laravel", level: 85, color: "#777bb3" },
    { skill: "MySQL & MongoDB", level: 80, color: "#4db33d" },
    { skill: "UI/UX Design", level: 75, color: "#ff7eb6" },
    { skill: "Node.js & Express", level: 70, color: "#68a063" },
  ];

  const journeyData = [
    { year: "2023 - Present", title: "Full-Stack Developer Internship", description: "Building scalable applications with PHP & React.js", icon: "🚀" },
    { year: "2022 - 2023", title: "Web Developer", description: "Developed web applications using PHP & Yii Framework", icon: "💻" },
    { year: "2021 - 2022", title: "Junior Developer", description: "Started my professional web development journey", icon: "🌱" },
  ];

  const statsData = [
    { number: "2+", label: "Years Experience", icon: "⏱️" },
    { number: "10+", label: "Projects", icon: "🚀" },
    { number: "15+", label: "Technologies", icon: "💻" },
    { number: "100%", label: "Dedication", icon: "⭐" },
  ];

  // Generated data
  const bubbleData = useMemo(() => {
    return [...Array(25)].map(() => ({
      delay: Math.random() * 12,
      duration: 15 + Math.random() * 10,
      startX: Math.random() * 100,
      size: 15 + Math.random() * 35,
    }));
  }, []);

  const seaweedData = useMemo(() => {
    return [...Array(25)].map((_, i) => ({
      x: i * 4 + Math.random() * 2,
      height: 80 + Math.random() * 120,
      color: ['#22c55e', '#16a34a', '#15803d', '#14532d'][Math.floor(Math.random() * 4)],
      delay: Math.random() * 2,
    }));
  }, []);

  const coralData = useMemo(() => {
    return [...Array(12)].map((_, i) => ({
      x: 5 + i * 8 + Math.random() * 3,
      type: Math.random() > 0.5 ? 'branch' : 'brain',
      color: ['#ff6b6b', '#f472b6', '#fb923c', '#a78bfa'][Math.floor(Math.random() * 4)],
    }));
  }, []);

  // Navigation
  const sections = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'about', label: 'About', icon: '👨‍💻' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'experience', label: 'Experience', icon: '📈' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'contact', label: 'Contact', icon: '📞' },
  ];

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const scrollTop = window.scrollY;
      const docHeight = containerRef.current.scrollHeight - window.innerHeight;
      const progress = Math.min(1, Math.max(0, scrollTop / docHeight));
      setScrollProgress(progress);

      // Determine active section based on scroll position
      const sections = ['home', 'about', 'skills', 'projects', 'experience', 'education', 'contact'];
      const sectionHeight = docHeight / sections.length;
      const currentSectionIndex = Math.floor(scrollTop / sectionHeight);
      if (currentSectionIndex < sections.length) {
        setActiveSection(sections[currentSectionIndex]);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hero content animation
  useEffect(() => {
    if (showHeroContent && heroContentRef.current) {
      gsap.fromTo(
        heroContentRef.current,
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }
      );
    }
  }, [showHeroContent]);

  // Scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Responsive model adjustments
  const adjustModelsForScreenSize = () => {
    let boatScale, boatPosition, boatRotation;
    let characterScale, characterPosition, characterRotation;
    let birdScale;

    if (window.innerWidth < 768) {
      boatScale = [0.9, 0.9, 0.9];
      boatPosition = [-10, -12.5, -60];
      boatRotation = [0, 1.7, 0];
      characterScale = [0.6, 0.6, 0.6];
      characterPosition = [-1, 5, 2];
      characterRotation = [0, 6, 0];
      birdScale = 0.025;
    } else if (window.innerWidth < 1280) {
      boatScale = [1, 1, 1];
      boatPosition = [-20, -12.5, -60];
      boatRotation = [0, 1.7, 0];
      characterScale = [0.8, 0.7, 0.8];
      characterPosition = [0, 7, 2];
      characterRotation = [0, 6, 0];
      birdScale = 0.035;
    } else {
      boatScale = [1.1, 1.1, 1.1];
      boatPosition = [-40, -12.5, -50];
      boatRotation = [0, 2, 0];
      characterScale = [1, 1, 1];
      characterPosition = [0, 5, 2.5];
      characterRotation = [0, 6, 0];
      birdScale = 0.045;
    }

    setModelConfig({ scale: boatScale, position: boatPosition, rotation: boatRotation });
    setCharacterConfig({ scale: characterScale, position: characterPosition, rotation: characterRotation });
    setBirdsConfig({ scale: birdScale });
  };

  useEffect(() => {
    adjustModelsForScreenSize();
    window.addEventListener("resize", adjustModelsForScreenSize);
    return () => window.removeEventListener("resize", adjustModelsForScreenSize);
  }, []);

  return (
    <>
      {/* Global Styles */}
      <style>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.3; }
          25% { transform: translateY(-30px) translateX(15px) scale(1.1); opacity: 0.5; }
          50% { transform: translateY(-20px) translateX(-10px) scale(0.9); opacity: 0.4; }
          75% { transform: translateY(-40px) translateX(5px) scale(1.05); opacity: 0.35; }
        }
        .animate-float-particle { animation: float-particle 10s ease-in-out infinite; }
        
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.1); }
        ::-webkit-scrollbar-thumb { background: rgba(79, 209, 197, 0.5); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(79, 209, 197, 0.7); }
        
        .gradient-text {
          background: linear-gradient(135deg, #4fd1c5, #63b3ed, #4fd1c5);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Navigation */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center mt-[50px] gap-2 p-2 rounded-2xl backdrop-blur-xl"
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          }}
        >
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 ${
                activeSection === section.id 
                  ? 'text-white bg-white/10' 
                  : 'text-blue-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{section.icon}</span>
              <span className="hidden sm:inline text-sm font-medium">{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Container */}
      <div
        ref={containerRef}
        className="relative"
        style={{
          minHeight: '500vh',
          background: `linear-gradient(180deg,
            #87ceeb 0%,
            #87ceeb 15%,
            #0099cc 20%,
            #0077be 30%,
            #005a8c 45%,
            #004466 60%,
            #003355 75%,
            #002244 88%,
            #001a33 100%
          )`,
        }}
      >
        {/* 3D Canvas - Fixed */}
        <div className="w-full h-screen fixed inset-0 z-10">
          <Canvas className="w-full h-screen bg-transparent" camera={{ near: 0.1, far: 1000 }}>
            <Suspense fallback={<Loader />}>
              <ScrollCamera scrollProgress={scrollProgress} />
              <DynamicLighting scrollProgress={scrollProgress} />

              {scrollProgress < 0.3 && (
                <>
                  <Sky />
                  {[...Array(7)].map((_, i) => (
                    <Birds key={i} scale={birdsConfig.scale} />
                  ))}
                </>
              )}

              <Ocean isDayMode={scrollProgress < 0.2} position={[0, -5, 0]} />

              <Boat position={modelConfig.position} scale={modelConfig.scale} rotation={modelConfig.rotation}>
                <Character position={characterConfig.position} scale={characterConfig.scale} rotation={characterConfig.rotation} />
              </Boat>

              <FishSchool scrollProgress={scrollProgress} />
            </Suspense>
          </Canvas>
        </div>

        {/* Hero Section */}
        <section id="home" className="relative z-20 min-h-screen flex items-center justify-center px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Intro */}
            {!showHeroContent ? (
              <div className="space-y-6 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-cyan-300 text-sm mb-4">
                  <span className="animate-pulse">🌊</span>
                  <span>Welcome to my portfolio</span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                  Hi, I'm{' '}
                  <span className="gradient-text">
                    Ajith Kumar.V
                  </span>
                </h1>

                <p className="text-xl sm:text-2xl text-blue-200 max-w-2xl mx-auto">
                  Full-Stack Developer crafting beautiful, scalable web experiences
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
                  <button
                    onClick={() => setShowHeroContent(true)}
                    className="group px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 flex items-center gap-3"
                    style={{
                      background: 'linear-gradient(135deg, #4fd1c5, #0077be)',
                      boxShadow: '0 4px 30px rgba(79, 209, 197, 0.4)',
                    }}
                  >
                    <span>Discover More</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>

                  <button
                    onClick={() => scrollToSection('projects')}
                    className="px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 flex items-center gap-3"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <span>View Projects</span>
                    <span>🚀</span>
                  </button>
                </div>

                {/* Scroll hint */}
                <div className="pt-16 animate-bounce">
                  <p className="text-blue-200 text-sm mb-2">Scroll to explore the depths</p>
                  <svg className="w-6 h-6 mx-auto text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            ) : (
              /* Expanded Hero Content */
              <div ref={heroContentRef} className="space-y-8">
                <button
                  onClick={() => setShowHeroContent(false)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm hover:bg-white/20 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </button>

                <div
                  className="p-8 rounded-3xl"
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">About Me</h2>

                  <p className="text-lg text-blue-100 leading-relaxed mb-6">
                    I'm a passionate Full-Stack Web Developer with expertise in building scalable, responsive applications using modern technologies like React.js, PHP, and MySQL. I love creating clean, intuitive user experiences backed by efficient backend logic.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {['React.js', 'PHP', 'MySQL', 'Node.js'].map((tech, i) => (
                      <div
                        key={i}
                        className="px-4 py-3 rounded-xl text-center text-cyan-300 font-medium"
                        style={{
                          background: 'rgba(79, 209, 197, 0.1)',
                          border: '1px solid rgba(79, 209, 197, 0.3)',
                        }}
                      >
                        {tech}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => scrollToSection('about')}
                      className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, #4fd1c5, #0077be)',
                        boxShadow: '0 4px 20px rgba(79, 209, 197, 0.3)',
                      }}
                    >
                      Learn More About Me
                    </button>
                    <button
                      onClick={() => scrollToSection('contact')}
                      className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                      }}
                    >
                      Get In Touch
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Bubble Overlay */}
        <div
          className="fixed inset-0 pointer-events-none overflow-hidden z-15"
          style={{ opacity: Math.min(1, scrollProgress * 3), display: scrollProgress > 0.05 ? 'block' : 'none' }}
        >
          {bubbleData.map((bubble, i) => (
            <Bubble
              key={i}
              delay={bubble.delay}
              duration={bubble.duration}
              startX={bubble.startX}
              size={bubble.size}
              variant={bubble.size > 35 ? 'big' : 'normal'}
            />
          ))}
          <GiantBubble delay={3} startX={15} />
          <GiantBubble delay={10} startX={55} />
          <GiantBubble delay={18} startX={35} />
          <GiantBubble delay={25} startX={75} />
        </div>

        {/* Floating Particles */}
        <div className="fixed inset-0 pointer-events-none z-5" style={{ opacity: Math.min(1, scrollProgress * 4) }}>
          <FloatingParticles count={50} />
        </div>

        {/* Underwater Content */}
        <div className="relative z-20 pt-[100vh]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Dive Header */}
            <div className="text-center mb-16 sm:mb-24 md:mb-32 pt-16 sm:pt-24">
              <h2 className="gradient-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4">
                Dive Into My World
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-200 opacity-80 mb-8 px-4">
                Scroll down to explore the depths of my experience
              </p>
              <div className="flex flex-col items-center">
                <div className="animate-bounce">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <span className="text-cyan-300 text-xs sm:text-sm mt-2">Keep scrolling</span>
              </div>
            </div>

            {/* About Section */}
            <section id="about" className="max-w-6xl mx-auto mb-24">
              <h3 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
                About Me
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GlassCard delay={0.1}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(79, 209, 197, 0.2), rgba(0, 119, 190, 0.2))',
                        border: '1px solid rgba(79, 209, 197, 0.3)',
                      }}
                    >
                      <span className="text-2xl">👨‍💻</span>
                    </div>
                    <h4 className="text-2xl font-bold text-white">Who I Am</h4>
                  </div>
                  <p className="text-blue-100 leading-relaxed mb-4">
                    Proactive Full-Stack Web Developer with experience in building scalable, responsive applications using PHP, React.js, and MySQL. Passionate about clean UI/UX, efficient backend logic, and delivering impactful solutions through collaborative teamwork and modern development practices.
                  </p>
                  <p className="text-blue-100 leading-relaxed">
                    When I'm not coding, you'll find me exploring new technologies, contributing to open-source projects, or diving into the latest web development trends. I believe in continuous learning and staying updated with the ever-evolving tech landscape.
                  </p>
                </GlassCard>

                <GlassCard delay={0.2}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(79, 209, 197, 0.2), rgba(0, 119, 190, 0.2))',
                        border: '1px solid rgba(79, 209, 197, 0.3)',
                      }}
                    >
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h4 className="text-2xl font-bold text-white">My Approach</h4>
                  </div>
                  <ul className="space-y-3">
                    {[
                      "Focus on clean, maintainable code and best practices",
                      "User-centered design with attention to detail",
                      "Agile methodology for efficient project management",
                      "Performance optimization and security considerations",
                      "Continuous integration and deployment"
                    ].map((point, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-cyan-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-blue-100">{point}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </div>
            </section>

            {/* Skills Section */}
            <section id="skills" className="mb-24">
              <SkillsSection />
            </section>

            {/* Projects Section with Carousel */}
            <section id="projects" className="mb-24">
              <div className="text-center mb-12">
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">My Projects</h3>
                <p className="text-blue-200 max-w-2xl mx-auto">
                  Showcasing my best work in web development. Each project represents unique challenges and creative solutions.
                </p>
              </div>
              <ProjectCarousel />
            </section>

            {/* Experience Section */}
            <section id="experience" className="mb-24">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
                  Professional Journey
                </h3>
                <div className="space-y-6">
                  {journeyData.map((item, index) => (
                    <JourneyItem 
                      key={index} 
                      year={item.year} 
                      title={item.title} 
                      description={item.description} 
                      icon={item.icon} 
                      index={index} 
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Education Section */}
            <section id="education" className="mb-24">
              <EducationSection />
            </section>

            {/* Contact Section */}
            <section id="contact" className="mb-32">
              <div className="text-center mb-12">
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Get In Touch</h3>
                <p className="text-blue-200 max-w-2xl mx-auto">
                  Have a project in mind or want to discuss opportunities? Feel free to reach out!
                </p>
              </div>
              <ContactForm />
            </section>

            {/* Final CTA */}
            <div className="text-center pb-24">
              <div
                className="inline-block p-8 md:p-12 rounded-3xl mx-4"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(25px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 0 60px rgba(79, 209, 197, 0.15)',
                }}
              >
                <div className="text-5xl md:text-6xl mb-4">🎯</div>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">Ready to Collaborate?</h3>
                <p className="text-blue-200 mb-8 text-lg">Let's create something amazing together</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => scrollToSection('projects')}
                    className="px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #4fd1c5, #0077be)',
                      boxShadow: '0 4px 30px rgba(79, 209, 197, 0.4)',
                    }}
                  >
                    🚀 View All Projects
                  </button>
                  <button
                    onClick={() => scrollToSection('contact')}
                    className="px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    📬 Contact Me
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Seaweed & Coral */}
          <div className="absolute bottom-0 left-0 w-full h-64 sm:h-80 md:h-96 pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
            {seaweedData.map((seaweed, index) => (
              <SwayingSeaweed key={index} x={seaweed.x} height={seaweed.height} color={seaweed.color} delay={seaweed.delay} />
            ))}
            {coralData.map((coral, index) => (
              <Coral key={`coral-${index}`} x={coral.x} type={coral.type} color={coral.color} />
            ))}
          </div>

          {/* Ocean Floor Gradient */}
          <div
            className="absolute bottom-0 left-0 w-full h-32 sm:h-40 md:h-48 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, transparent, rgba(0, 17, 34, 0.8), #001122)',
              zIndex: 4,
            }}
          />
        </div>
      </div>
    </>
  );
};

export default Home;