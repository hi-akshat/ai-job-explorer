import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const [activeSection, setActiveSection] = useState('intro');
  const [scrolled, setScrolled] = useState(false);

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      // Set navbar style on scroll
      if (scrollPosition > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
      
      // Determine active section
      const sections = ['intro', 'explorer', 'domains', 'trends', 'action'];
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 70,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-white/95 shadow-md py-2" 
          : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        <h1 
          className={cn(
            "font-bold transition-all duration-300 cursor-pointer",
            scrolled ? "text-xl text-theme-primary" : "text-2xl text-theme-text"
          )}
          onClick={() => scrollToSection('intro')}
        >
          AI Job Explorer
        </h1>
        
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            {[
              { id: 'intro', label: 'Introduction' },
              { id: 'explorer', label: 'Job Explorer' },
              { id: 'domains', label: 'Domain & Skill Impact' },
              { id: 'trends', label: 'Future Trends' },
              { id: 'action', label: 'Action Steps' }
            ].map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    "px-2 py-1 rounded-md transition-all duration-200",
                    activeSection === item.id
                      ? "text-theme-primary font-medium"
                      : "text-gray-600 hover:text-theme-primary"
                  )}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <button 
          className="block md:hidden text-theme-primary"
          aria-label="Menu"
        >
          ☰
        </button>
      </div>
    </header>
  );
};

export default Navigation;
