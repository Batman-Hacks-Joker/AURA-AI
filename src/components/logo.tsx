import { cn } from "@/lib/utils";

const AuraLogoSvg = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
    width="90" 
    height="36" 
    viewBox="0 0 130 46" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={props.className}
    >
        <g clipPath="url(#clip0_1_2)">
        <path d="M26.2,42.2c-10.9,0-19.8-8.9-19.8-19.8S15.3,2.6,26.2,2.6s19.8,8.9,19.8,19.8S37.1,42.2,26.2,42.2z M26.2,6.6C17.5,6.6,10.4,13.7,10.4,22.4s7.1,15.8,15.8,15.8s15.8-7.1,15.8-15.8S34.9,6.6,26.2,6.6z" fill="currentColor"/>
        <path d="M48.1,22.4c0-2.2,1.8-4,4-4h1v-4h-1c-4.4,0-8,3.6-8,8v15.8h4V26.4h4v-4H48.1z M54.1,26.4V38.2h4V26.4H54.1z M76.1,22.4c0-4.4-3.6-8-8-8h-1v4h1c2.2,0,4,1.8,4,4v15.8h4V22.4z" fill="currentColor"/>
        <path d="M102.3,42.2c-10.9,0-19.8-8.9-19.8-19.8S91.4,2.6,102.3,2.6s19.8,8.9,19.8,19.8S113.2,42.2,102.3,42.2z M102.3,6.6c-8.7,0-15.8,7.1-15.8,15.8s7.1,15.8,15.8,15.8s15.8-7.1,15.8-15.8S111,6.6,102.3,6.6z" fill="currentColor"/>
        <path d="M56.1,18.4v4h4v-4H56.1z M76.1,18.4v4h-4v-4H76.1z" fill="currentColor"/>
        <path d="M68.1,26.4c-2.2,0-4,1.8-4,4s1.8,4,4,4s4-1.8,4-4S70.3,26.4,68.1,26.4z" fill="currentColor"/>
        <path d="M68.1,22.4c-4.4,0-8,3.6-8,8s3.6,8,8,8s8-3.6,8-8S72.5,22.4,68.1,22.4z M68.1,34.4c-2.2,0-4-1.8-4-4s1.8-4,4-4s4,1.8,4,4S70.3,34.4,68.1,34.4z" fill="currentColor"/>
        <path d="M117.6,12.5l-2.9,5.8l-5.8-2.9l5.8-2.9l2.9,5.8z M117.6,1.4l2.9,5.8l-11.7,5.8l-2.9-5.8L117.6,1.4z" fill="currentColor"/>
        <path d="M117.6,12.5l2.9-5.8l-2.9-5.8l-5.8,2.9L117.6,12.5z" fill="currentColor"/>
        <path d="M123,28.6c-3.1,0-5.6,2.5-5.6,5.6s2.5,5.6,5.6,5.6s5.6-2.5,5.6-5.6S126.1,28.6,123,28.6z M123,35.8c-0.9,0-1.6-0.7-1.6-1.6s0.7-1.6,1.6-1.6s1.6,0.7,1.6,1.6S123.9,35.8,123,35.8z" fill="currentColor"/>
        <path d="M123,24.6c-5.3,0-9.6,4.3-9.6,9.6s4.3,9.6,9.6,9.6s9.6-4.3,9.6-9.6S128.3,24.6,123,24.6z M123,39.8c-3.1,0-5.6-2.5-5.6-5.6s2.5-5.6,5.6-5.6s5.6,2.5,5.6,5.6S126.1,39.8,123,39.8z" fill="currentColor"/>
        <path d="M123,28.6h-2v11.2h2V28.6z" fill="currentColor"/>
        </g>
        <defs>
        <clipPath id="clip0_1_2">
        <rect width="130" height="46" fill="white"/>
        </clipPath>
        </defs>
    </svg>
  );

export function Logo({
  className,
  collapsed = false,
}: {
  className?: string;
  collapsed?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <AuraLogoSvg className="h-7 w-auto text-primary" />
      {!collapsed && (
        <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">
          AURA AI
        </h1>
      )}
    </div>
  );
}
