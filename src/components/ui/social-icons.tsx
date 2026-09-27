import Svg, { Circle, Path, Rect } from "react-native-svg";

/** Brand marks, hand-rolled at 24×24 to match the lucide set — as on the site. */

type Props = { size?: number; color: string };

export function InstagramIcon({ size = 16, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round">
      <Rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <Circle cx="12" cy="12" r="4" />
      <Circle cx="17.5" cy="6.5" r="0.9" fill={color} stroke="none" />
    </Svg>
  );
}

export function FacebookIcon({ size = 16, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round">
      <Path d="M14.5 8.5h2.5M14.5 8.5V6.8c0-1 .8-1.8 1.8-1.8H17M14.5 8.5V19M11 12h6.5" />
      <Path d="M14.5 19v-6.5" />
    </Svg>
  );
}

export function YoutubeIcon({ size = 16, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round">
      <Rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <Path d="M10.5 9.5l4.5 2.5-4.5 2.5z" />
    </Svg>
  );
}

export function WhatsappIcon({ size = 16, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.4-4.4A8.5 8.5 0 1 1 20.5 11.7Z" />
      <Path d="M9 9.5c0 3 2.5 5.5 5.5 5.5 .6 0 1.2-.5 1.2-1.1l-1.6-.8-.9.9c-1.1-.5-2-1.4-2.5-2.5l.9-.9-.8-1.6c-.6 0-1.1.6-1.1 1.2Z" />
    </Svg>
  );
}

export function GoogleMark({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.8 6.1C12.3 13.6 17.7 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
      <Path fill="#FBBC05" d="M10.4 28.6A14.4 14.4 0 0 1 9.5 24c0-1.6.3-3.1.8-4.6l-7.8-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.8-6.1z" />
      <Path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.7-4.1-13.6-9.9l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
    </Svg>
  );
}
