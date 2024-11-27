import React, { SVGProps } from 'react';

type IconSize = 'small' | 'medium' | 'large';

interface IconComponentProps extends SVGProps<SVGSVGElement> {
  mainColor?: string;
  secondaryColor?: string;
  size?: IconSize;
}

const sizeMap: Record<IconSize, { width: string; height: string; }> = {
  small: { width: '16px', height: '16px' },
  medium: { width: '24px', height: '24px' },
  large: { width: '32px', height: '32px' }
};

const CamionIcon: React.FC<IconComponentProps> = ({
  mainColor = "#FFFFFF",
  secondaryColor = "#2D2D2D",
  size = 'medium',
  style,
  width,
  height,
  ...props
}) => {
  const sizeStyles = sizeMap[size];

  return (
    <svg
      viewBox="-51.2 -51.2 614.40 614.40"
      width={width || sizeStyles.width}
      height={height || sizeStyles.height}
      fill="#000000"
      transform="rotate(180)"
      style={style}
      {...props}
    >
      <path
        style={{ fill: secondaryColor }}
        d="M256,0C114.608,0,0,114.608,0,256c0,141.376,114.608,256,256,256s256-114.624,256-256 C512,114.608,397.392,0,256,0z"
      />
      <path
        style={{ fill: mainColor }}
        d="M119.52,147.056l136.4,87.488l136.4-87.472L255.92,431.36L119.52,147.056z"
      />
    </svg>
  );
};

export default CamionIcon;