import React, { useEffect, useState } from 'react';
import AssistantPrompt from './AssistantPrompt';
import AssistantPrompt from './AssistantPrompt';

const CountdownTimer = ({ initialCount = 3, onCountdownEnd }) => {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    if (count === 0) {
      const timer = setTimeout(() => {
        onCountdownEnd();
      }, 1000); // Give a small delay for the "0" to show before disappearing
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setCount((prevCount) => prevCount - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onCountdownEnd]);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-white text-9xl font-bold animate-pulse">
          {count > 0 ? count : 'Go!'}
        </div>
          {count > 0 ? count : 'Go!'}
        </div>
      </div>
      <AssistantPrompt message={count > 0 ? 'Get ready!' : 'Smile!'} />
    </>
    </>
  );
};

export default CountdownTimer;