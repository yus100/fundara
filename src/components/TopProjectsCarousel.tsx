import React, { useState, useEffect } from 'react';

interface Project {
  _id: string;
  title: string;
  description: string;
  image: string;
  donated: number;
  goal: number;
}

interface TopProjectsCarouselProps {
  projects: Project[];
}

const TopProjectsCarousel: React.FC<TopProjectsCarouselProps> = ({ projects }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const sortedProjects = [...projects]
    .sort((a, b) => b.donated - a.donated)
    .slice(0, 5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((current) => 
        current === sortedProjects.length - 1 ? 0 : current + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [sortedProjects.length]);

  const nextSlide = (): void => {
    setCurrentIndex((current) => 
      current === sortedProjects.length - 1 ? 0 : current + 1
    );
  };

  const prevSlide = (): void => {
    setCurrentIndex((current) => 
      current === 0 ? sortedProjects.length - 1 : current - 1
    );
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto overflow-hidden rounded-2xl shadow-xl mb-12">
      <div className="relative aspect-[21/9]">
        {/* Current Slide */}
        <div className="absolute inset-0 transition-opacity duration-500">
          <div className="relative h-full">
            <img
              src={sortedProjects[currentIndex].image}
              alt={sortedProjects[currentIndex].title}
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
              <div className="max-w-3xl">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                  {sortedProjects[currentIndex].title}
                </h2>
                <p className="text-sm sm:text-base mb-4 line-clamp-2 text-gray-200">
                  {sortedProjects[currentIndex].description}
                </p>
                
                {/* Progress Bar */}
                <div className="space-y-2 mb-4">
                  <div className="w-full bg-gray-200/30 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((sortedProjects[currentIndex].donated / sortedProjects[currentIndex].goal) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      ${sortedProjects[currentIndex].donated.toLocaleString()} raised
                    </span>
                    <span>
                      of ${sortedProjects[currentIndex].goal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {sortedProjects.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopProjectsCarousel;