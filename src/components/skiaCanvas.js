import React from 'react';
import {
  Canvas,
  Fill,
  ImageShader,
  Shader,
  Skia,
  useImage,
} from '@shopify/react-native-skia';
import {Dimensions, StyleSheet} from 'react-native';
import {useDerivedValue, useSharedValue} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {clamp} from 'react-native-redash';

const source = Skia.RuntimeEffect.Make(`
uniform shader image1;
uniform shader image2;

uniform float progress;
uniform float2 resolution;

vec4 getFromColor(vec2 p) {
    return image1.eval(p * resolution);
}

vec4 getToColor(vec2 p) {
    return image2.eval(p * resolution);
}

float scale = 4.0;
float smoothness = 0.01;

float seed = 12.9898;

// http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
float random(vec2 co)
{
    highp float a = seed;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(co.xy ,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners porcentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

vec4 transition (vec2 uv) {
  vec4 from = getFromColor(uv);
  vec4 to = getToColor(uv);
  float n = noise(uv * scale);
  
  float p = mix(-smoothness, 1.0 + smoothness, progress);
  float lower = p - smoothness;
  float higher = p + smoothness;
  
  float q = smoothstep(lower, higher, n);
  
  return mix(
    from,
    to,
    1.0 - q
  );
}
 
half4 main(float2 xy) {  
  vec2 uv = xy / resolution; 
  return transition(uv);
}`);

const {width, height} = Dimensions.get('window');

const IMAGE_WIDTH = width * 0.8;
const IMAGE_HEIGHT = 250;

export const SkiaCanvas = () => {
  const progress = useSharedValue(0);
  const image1 = useImage(
    'https://plus.unsplash.com/premium_photo-1676654935906-570ac2f94180?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwzM3x8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
  );
  const image2 = useImage(
    'https://images.unsplash.com/photo-1687482976391-8de6c1122c7f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwzNXx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
  );

  const panGesture = Gesture.Pan().onChange(pos => {
    progress.value = clamp(progress.value - pos.changeX / width, 0, 1);
    console.log(progress.value);
  });

  const uniforms = useDerivedValue(() => ({
    progress: progress.value,
    resolution: [width, height],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Canvas style={styles.container}>
        <Fill>
          <Shader source={source} uniforms={uniforms}>
            <ImageShader
              image={image1}
              fit="cover"
              width={IMAGE_WIDTH}
              height={IMAGE_HEIGHT}
              x={(width - IMAGE_WIDTH) / 2}
              y={(height - IMAGE_HEIGHT) / 2}
            />
            <ImageShader
              image={image2}
              fit="cover"
              width={IMAGE_WIDTH}
              height={IMAGE_HEIGHT}
              x={(width - IMAGE_WIDTH) / 2}
              y={(height - IMAGE_HEIGHT) / 2}
            />
          </Shader>
        </Fill>
      </Canvas>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
