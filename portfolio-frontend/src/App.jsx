import React from 'react';
import Portfolio from './components/Portfolio';
import MobileWarning from './components/MobileWarning';

const App = () => {
  return (  
    <>
      <MobileWarning />
      <Portfolio />
    </>
  );
};

export default App;