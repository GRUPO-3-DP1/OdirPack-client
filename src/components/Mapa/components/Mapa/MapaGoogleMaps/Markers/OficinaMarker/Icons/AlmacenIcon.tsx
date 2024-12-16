import React, { SVGProps } from "react";

type IconSize = "tiny" | "small" | "medium" | "large";

interface IconComponentProps extends SVGProps<SVGSVGElement> {
  size?: IconSize;
}

const sizeMap: Record<IconSize, { width: string; height: string; }> = {
  tiny: { width: "12px", height: "12px" },
  small: { width: "16px", height: "16px" },
  medium: { width: "24px", height: "24px" },
  large: { width: "32px", height: "32px" },
};

const AlmacenIcon: React.FC<IconComponentProps> = ({
  size = "medium",
  style,
  width,
  height,
  ...props
}) => {
  const sizeStyles = sizeMap[size];

  return (
    <svg
      fill="#FFFFFF"
      viewBox="-7.2 -7.2 38.40 38.40"
      xmlns="http://www.w3.org/2000/svg"
      width={width || sizeStyles.width}
      height={height || sizeStyles.height}
      style={style}
      {...props}
    >
      <g>
        <rect
          x="-7.2"
          y="-7.2"
          width="38.40"
          height="38.40"
          rx="19.2"
          fill="#00008B"
        />
      </g>
      <path
        d="M21.71,12.71a1,1,0,0,1-1.42,0L20,12.42V20.3A1.77,1.77,0,0,1,18.17,22H16a1,1,0,0,1-1-1V15.1a1,1,0,0,0-1-1H10a1,1,0,0,0-1,1V21a1,1,0,0,1-1,1H5.83A1.77,1.77,0,0,1,4,20.3V12.42l-.29.29a1,1,0,0,1-1.42,0,1,1,0,0,1,0-1.42l9-9a1,1,0,0,1,1.42,0l9,9A1,1,0,0,1,21.71,12.71Z"
        fill="#FFFFFF"
      />
    </svg >
  );
};

export default AlmacenIcon;