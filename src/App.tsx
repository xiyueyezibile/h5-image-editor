import React, { useEffect, useState } from 'react';
import {ImageEditor} from './components/ImageEditor';
import styles from './App.module.css';
import { debounce } from './utils/debounce';

const App: React.FC = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    

    const updateDimensions = () => {
      
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    const debouncedUpdateDimensions = debounce(updateDimensions, 200);

    updateDimensions();
    window.addEventListener('resize', debouncedUpdateDimensions);

    return () => {
      window.removeEventListener('resize', debouncedUpdateDimensions);
    };
  }, []);

  return (
    <div className={styles.app}>
      <ImageEditor width={dimensions.width} height={dimensions.height} />
    </div>
  );
};

export default App;
