import { Hero } from "@/components/hero";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AURA AI | Home',
  description: 'Your Integrated Commerce Ecosystem',
};

export default function HomePage() {
  return <Hero />;
}
