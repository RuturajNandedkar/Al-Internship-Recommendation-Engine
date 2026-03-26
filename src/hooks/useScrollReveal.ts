import { useEffect } from 'react';

export const useScrollReveal = () => {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    const observeAll = () => {
      document.querySelectorAll('.reveal:not(.visible)').forEach((el) => {
        observer.observe(el);
      });
    };

    // Initial observation
    observeAll();

    // Observe for new elements being added to the DOM
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          observeAll();
        }
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
};
