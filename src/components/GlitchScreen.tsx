import React, { useEffect } from 'react';
import { Dimensions, View } from 'react-native';
import { Canvas, Fill, Shader, Skia } from '@shopify/react-native-skia';
import { useSharedValue, useDerivedValue, SharedValue } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const glitchShaderSource = `
uniform float u_time;
uniform float u_distortion; // 0.0 to 1.0 (controlled by user press)
uniform vec2 u_resolution;

vec4 main(vec2 pos) {
  vec2 uv = pos / u_resolution;
  
  // Generate random horizontal noise strips
  float noise = fract(sin(dot(vec2(floor(uv.y * 50.0), u_time), vec2(12.9898, 78.233))) * 43758.5453);
  
  // Displace X coordinate based on noise and user pressure
  if (noise < u_distortion) {
    uv.x += (noise - 0.5) * 0.2;
  }
  
  // Return a "Terminal Green" color where glitched
  if (uv.x < 0.0 || uv.x > 1.0) {
    return vec4(0.0, 1.0, 0.2, 1.0); // Neon Green
  }
  
  return vec4(0.0, 0.0, 0.0, 1.0); // Black Background
}
`;

const runtimeEffect = Skia.RuntimeEffect.Make(glitchShaderSource);

interface GlitchScreenProps {
  distortion: SharedValue<number>;
}

export const GlitchScreen: React.FC<GlitchScreenProps> = ({ distortion }) => {
  const time = useSharedValue(0);

  useEffect(() => {
    let request: number;
    const start = Date.now();
    const animate = () => {
      time.value = (Date.now() - start) / 1000;
      request = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(request);
  }, [time]);

  const uniforms = useDerivedValue(() => {
    return {
      u_time: time.value,
      u_distortion: distortion.value,
      u_resolution: [width, height],
    };
  }); // Removed dependency array as SharedValues are reactive automatically in worklets usually, but explicit dependencies might be needed if not captured. 
  // Actually, useDerivedValue tracks dependencies accessed.

  if (!runtimeEffect) {
    return <View style={{ flex: 1, backgroundColor: 'black' }} />;
  }

  return (
    <Canvas style={{ flex: 1 }}>
      <Fill>
        <Shader source={runtimeEffect} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
};
