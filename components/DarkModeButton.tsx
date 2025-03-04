import React from 'react';
import useStore from '@/store/useStore';
import Button from '@/components/Button';

const DarkModeButton = () => {
  const { toggleDarkMode, config } = useStore();

  return (
    <Button 
      icon={config.darkMode ? "moon" : "sunny"}
      // title={config.darkMode ? 'Dark Mode' : 'Light Mode'}
      onPress={toggleDarkMode}
      variant={config.darkMode ? 'dark' : 'light'}
      textStyle={{ 
        color: config.darkMode ? '#FFFFFF' : '#000000',
        marginLeft: 8 
      }}
      style={{
        borderWidth: 1,
        borderColor: config.darkMode ? '#383838' : '#E8E8E8',
        shadowColor: config.darkMode ? '#000' : '#888',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        width:30,
        margin:0,
        paddingVertical:2,
        paddingHorizontal:1,
      }}
    />
  );
};

export default DarkModeButton;