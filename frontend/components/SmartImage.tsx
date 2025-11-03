
import React from 'react';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export default function SmartImage(props: SmartImageProps) {
  return <img {...props} />;
}


