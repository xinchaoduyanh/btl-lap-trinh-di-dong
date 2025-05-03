import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

const Fireworks = () => {
  const particles = useRef(
    Array(20).fill(0).map(() => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    particles.forEach((particle, index) => {
      const angle = (index / particles.length) * Math.PI * 2;
      const radius = 100;

      Animated.sequence([
        Animated.delay(index * 50),
        Animated.parallel([
          Animated.timing(particle.x, {
            toValue: Math.cos(angle) * radius,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: Math.sin(angle) * radius,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(particle.scale, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  return (
    <View style={styles.container}>
      {particles.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { scale: particle.scale },
              ],
              opacity: particle.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
    position: 'absolute',
  },
});

export default Fireworks;
