import React from 'react'

const FastLoader: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
    if (isLoading) {
      return (
        <div id='fastLoader'>
          
        </div>
      );
    }
    
    return null; // Devuelve null cuando isLoading es false
  };
  
  export default FastLoader;