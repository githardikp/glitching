import React, { useState, useEffect, useRef } from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';

interface TypewriterProps extends TextProps {
  text: string;
  delay?: number;
  onComplete?: () => void;
}

export const Typewriter: React.FC<TypewriterProps> = ({ 
  text, 
  delay = 50, 
  onComplete,
  style, 
  ...props 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  // In a real app, you'd load a sound file here.
  // Since we don't have one, we'll simulate the intent or skip sound if file missing.
  // For now, we'll implement the sound logic structure but comment it out or use a dummy catch
  // to prevent crashes if the asset isn't there.
  
  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(async () => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);

        // Play sound logic
        try {
            // Example:
            // const { sound } = await Audio.Sound.createAsync(require('../assets/click.mp3'));
            // await sound.playAsync();
            // sound.unloadAsync(); // Clean up immediately for rapid fire
        } catch (e) {
            // console.log("Sound error or missing asset", e);
        }

      }, delay);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, delay, text, onComplete]);

  return (
    <Text style={[styles.text, style]} {...props}>
      {displayedText}
      <Text style={styles.cursor}>_</Text>
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    // Inherits font style from parent or props
  },
  cursor: {
    opacity: 0.8, // Blinking effect could be added with reanimated
    color: '#39FF14',
  }
});
