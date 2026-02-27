import { Leaf, Sun, Lightbulb, Bot, ShieldCheck } from 'lucide-react';

export const PlantIcon = ({ className }: { className?: string }) => <Leaf className={className} />;
export const ClimateIcon = () => <Sun className="w-6 h-6 mr-3 text-[#5A5A40]" />;
export const TipsIcon = () => <Lightbulb className="w-6 h-6 mr-3 text-[#5A5A40]" />;
export const BotIcon = () => <Bot className="w-6 h-6 mr-3 text-[#5A5A40]" />;
export const OrganicIcon = ({ className }: { className?: string }) => <ShieldCheck className={className} />;