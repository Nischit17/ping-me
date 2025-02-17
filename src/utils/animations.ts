import {
  withSpring,
  withSequence,
  withTiming,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";

export const shakeAnimation = () => {
  "worklet";
  return withSequence(
    withTiming(-10, { duration: 50 }),
    withTiming(10, { duration: 50 }),
    withTiming(-10, { duration: 50 }),
    withTiming(10, { duration: 50 }),
    withTiming(0, { duration: 50 })
  );
};

export const successAnimation = () => {
  "worklet";
  return withSpring(1, {
    damping: 8,
    mass: 0.5,
    stiffness: 100,
  });
};

export const pressAnimation = () => {
  "worklet";
  return withSpring(0.95);
};

export const pressOutAnimation = () => {
  "worklet";
  return withSpring(1);
};

export const screenTransition = {
  entering: SlideInRight,
  exiting: SlideOutLeft,
};
