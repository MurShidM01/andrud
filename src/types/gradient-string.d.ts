declare module 'gradient-string' {
  interface Gradient {
    (text: string): string;
    rainbow(text: string): string;
    pastel(text: string): string;
    ice(text: string): string;
  }

  interface GradientStatic {
    (color1: string, color2: string): Gradient;
    rainbow: Gradient;
    pastel: Gradient;
    teen: Gradient;
    mind: Gradient;
    summer: Gradient;
    winter: Gradient;
    autumn: Gradient;
    spring: Gradient;
    forest: Gradient;
  }

  const gradient: GradientStatic;
  export default gradient;
  export { Gradient, GradientStatic };
}