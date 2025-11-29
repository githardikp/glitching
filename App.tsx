// App.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  cancelAnimation,
  runOnJS,
  withRepeat,
  withSequence,
  Easing,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { useFonts, SpaceMono_400Regular } from '@expo-google-fonts/space-mono';
import * as Haptics from 'expo-haptics';

import { useEntropy } from './src/hooks/useEntropy';
import { generateHexagramLines, getHexagramReading, HexagramReading } from './src/utils/ichingLogic';
import hexagramMeanings from './src/data/tech_noir_meanings.json';
import { GlitchScreen } from './src/components/GlitchScreen';
import { Typewriter } from './src/components/Typewriter';
import { Colors, Layout } from './src/constants/theme';

function App(): React.JSX.Element {
  const [fontsLoaded] = useFonts({
    'SpaceMono-Regular': SpaceMono_400Regular,
  });

  const { seed, loading, error, getSeed } = useEntropy();
  const [hexagramReading, setHexagramReading] = useState<HexagramReading | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isDailyLocked, setIsDailyLocked] = useState(false);

  // Animation values
  const distortion = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const shakeY = useSharedValue(0);
  const lastHapticValue = useSharedValue(0);

  const runHaptic = (style: 'light' | 'medium' | 'heavy' | 'success') => {
    switch (style) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
    }
  };

  const handleGenerateHexagram = async () => {
    console.log("SNAP! Generating hexagram...");
    const newSeed = await getSeed();
    if (newSeed !== null) {
      const lines = generateHexagramLines(newSeed);
      const reading = getHexagramReading(lines);
      setHexagramReading(reading);
      setShowResults(true);
    }
  };

  const reset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // If daily locked, maybe we don't allow full reset, or we just hide results to show "Press & Hold" again
    // but the next press will result in the SAME reading.
    setShowResults(false);
    // We do NOT nullify hexagramReading if we want to be efficient, 
    // but handleGenerateHexagram logic handles the "reload".
    // But for UI consistency, we can clear it from state, 
    // but the storage remains.
    setHexagramReading(null);
  };

  const triggerSnap = useCallback(() => {
    distortion.value = 0;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    handleGenerateHexagram();
  }, [getSeed]); 

  // Glitch Haptics Reaction
  useAnimatedReaction(
    () => distortion.value,
    (currentValue, previousValue) => {
      // Trigger haptic every 0.15 increment
      if (currentValue > 0 && currentValue < 1) {
         if (currentValue - lastHapticValue.value > 0.15) {
            lastHapticValue.value = currentValue;
            runOnJS(runHaptic)('medium');
         }
      } else if (currentValue === 0) {
        lastHapticValue.value = 0;
      }
    }
  );

  const longPress = Gesture.LongPress()
    .minDuration(0)
    .onBegin(() => {
      if (showResults) return; 
      
      distortion.value = withTiming(1, { duration: 3000, easing: Easing.linear }, (finished) => {
        if (finished) {
          runOnJS(triggerSnap)();
        }
      });

      const shakeDuration = 100;
      shakeX.value = withRepeat(withSequence(
        withTiming(-10, { duration: shakeDuration }),
        withTiming(10, { duration: shakeDuration }),
        withTiming(0, { duration: shakeDuration })
      ), -1, true);
      
      shakeY.value = withRepeat(withSequence(
        withTiming(-10, { duration: shakeDuration }),
        withTiming(10, { duration: shakeDuration }),
        withTiming(0, { duration: shakeDuration })
      ), -1, true);

    })
    .onFinalize(() => {
      cancelAnimation(distortion);
      cancelAnimation(shakeX);
      cancelAnimation(shakeY);
      
      if (distortion.value < 1) {
          distortion.value = withTiming(0, { duration: 200 });
      }
      shakeX.value = withTiming(0);
      shakeY.value = withTiming(0);
    });

  const animatedStyle = useAnimatedStyle(() => {
    const currentShakeX = shakeX.value * distortion.value; 
    const currentShakeY = shakeY.value * distortion.value;
    
    return {
      transform: [
        { translateX: currentShakeX },
        { translateY: currentShakeY },
      ] as const,
    };
  });

  const getGlitchSpeak = (hexNum: number | undefined) => {
    if (!hexNum) return "NO DATA";
    const meaning = hexagramMeanings[String(hexNum) as keyof typeof hexagramMeanings];
    return meaning ? meaning.glitchSpeak : `UNKNOWN HEXAGRAM ${hexNum}`;
  };

  if (!fontsLoaded) {
    return <View style={{flex:1, backgroundColor: Colors.background}} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <StatusBar hidden />
        <GestureDetector gesture={longPress}>
          <Animated.View style={[{ flex: 1 }, animatedStyle]}>
            <GlitchScreen distortion={distortion} />
          </Animated.View>
        </GestureDetector>

        {/* Overlay UI */}
        <View style={styles.overlay} pointerEvents="box-none">
          {!showResults ? (
            <View style={styles.promptContainer}>
              <Text style={styles.promptText}>PRESS & HOLD TO GLITCH</Text>
            </View>
          ) : (
            <View style={[styles.resultContainer, Layout.sharpBorder]}>
              <Text style={styles.hexHeader}>HEXAGRAM {hexagramReading?.primaryHexagramNumber}</Text>
              
              {hexagramReading?.primaryHexagramNumber && (
                <Typewriter 
                  text={getGlitchSpeak(hexagramReading.primaryHexagramNumber)} 
                  style={styles.glitchText}
                  delay={30}
                />
              )}
              
              {hexagramReading?.changingLines.length > 0 && (
                <View style={{ marginTop: 15 }}>
                   <Text style={styles.subTextHeader}>
                     {`> CHANGING TO: ${hexagramReading.changingHexagramNumber}`}
                   </Text>
                   <Typewriter 
                      text={getGlitchSpeak(hexagramReading.changingHexagramNumber)}
                      style={styles.subText}
                      delay={20}
                   />
                </View>
              )}
              
              <View style={{ marginTop: 30 }}>
                 <Text style={styles.resetText} onPress={reset}>
                    {isDailyLocked ? "[ SYSTEM LOCKED // VIEW ONLY ]" : "[ TAP TO RESET ]"}
                 </Text>
                 {isDailyLocked && <Text style={styles.resetText} onPress={reset}>[ ACKNOWLEDGE ]</Text>}
              </View>
            </View>
          )}
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptContainer: {
    opacity: 0.8,
  },
  promptText: {
    color: Colors.primary,
    fontFamily: 'SpaceMono-Regular', 
    fontSize: 20,
    letterSpacing: 2,
    textAlign: 'center',
  },
  resultContainer: {
    backgroundColor: 'rgba(8, 8, 8, 0.95)',
    padding: 24,
    width: '90%',
    alignItems: 'flex-start', 
  },
  hexHeader: {
    color: Colors.primary,
    fontSize: 24,
    fontFamily: 'SpaceMono-Regular',
    marginBottom: 20,
    alignSelf: 'center',
    textDecorationLine: 'underline',
  },
  glitchText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'SpaceMono-Regular',
    lineHeight: 24,
  },
  subTextHeader: {
    color: Colors.secondary,
    fontSize: 14,
    fontFamily: 'SpaceMono-Regular',
    marginBottom: 5,
  },
  subText: {
    color: '#CCC',
    fontSize: 14,
    fontFamily: 'SpaceMono-Regular',
  },
  resetText: {
    color: Colors.primary,
    fontSize: 14,
    marginTop: 10,
    fontFamily: 'SpaceMono-Regular',
    alignSelf: 'center',
  }
});

export default App;