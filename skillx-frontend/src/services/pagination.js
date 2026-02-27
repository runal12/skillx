// Pagination utilities for large datasets

// Infinite scroll configuration
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  SCROLL_THRESHOLD: 100, // Distance from bottom to trigger next page
  DEBOUNCE_DELAY: 300, // Delay between scroll events
  PREFETCH_DISTANCE: 200 // Distance to prefetch next page
};

// Calculate pagination metadata
export const calculatePagination = (items, page = 1, pageSize = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const totalPages = Math.ceil(items.length / pageSize);
  
  return {
    currentPage: page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    startIndex,
    endIndex,
    currentPageItems: items.slice(startIndex, endIndex),
    remainingItems: items.slice(endIndex),
    totalItems: items.length
  };
};

// Virtual scrolling for performance
export const useVirtualScroll = (items, itemHeight = 80, containerHeight = 400) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState(null);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(visibleStart, visibleEnd);
  
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
  }, []);
  
  return {
    containerRef,
    visibleItems,
    handleScroll,
    scrollTop,
    visibleStart,
    visibleEnd
  };
};

// Lazy loading for images and content
export const useLazyLoad = (threshold = 0.1) => {
  const [elements, setElements] = useState([]);
  const observerRef = useRef(null);
  
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            element.src = element.dataset.src;
            
            setElements(prev => {
              if (!prev.includes(element)) {
                return [...prev, element];
              }
              return prev;
            });
          }
        });
      },
      {
        threshold,
        rootMargin: '50px'
      }
    );
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold]);
  
  const observe = (element) => {
    if (observerRef.current && element) {
      observerRef.current.observe(element);
    }
  };
  
  return { elements, observe };
};

// Optimistic updates
export const useOptimisticUpdates = () => {
  const [pendingUpdates, setPendingUpdates] = useState({});
  
  const addOptimisticUpdate = (type, id, data) => {
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    setPendingUpdates(prev => ({
      ...prev,
      [tempId]: { type, data, status: 'pending' }
    }));
    
    return tempId;
  };
  
  const confirmUpdate = (tempId, realData) => {
    setPendingUpdates(prev => {
      const { [tempId], ...rest } = prev;
      return rest;
    });
  };
  
  const getPendingUpdate = (tempId) => {
    return pendingUpdates[tempId];
  };
  
  return { addOptimisticUpdate, confirmUpdate, getPendingUpdate };
};
