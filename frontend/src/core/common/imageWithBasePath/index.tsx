import React from 'react';
import { img_path } from '../../../environment';

interface Image {
  className?: string;
  src: string;
  alt?: string;
  height?: number;
  width?: number;
  id?: string;
  style?: React.CSSProperties;
}

const ImageWithBasePath = (props: Image) => {
  const rawSrc = (props.src || '').trim();
  const base = (img_path || '/').replace(/\/+$/, '');
  const fullSrc =
    rawSrc.startsWith('http://') ||
    rawSrc.startsWith('https://') ||
    rawSrc.startsWith('data:') ||
    rawSrc.startsWith('blob:')
      ? rawSrc
      : `${base}/${rawSrc.replace(/^(\.\/|\/)+/, '')}`;

  return (
    <img
      className={props.className}
      src={fullSrc}
      height={props.height}
      alt={props.alt || ''}
      width={props.width}
      id={props.id}
      style={props.style}
    />
  );
};

export default ImageWithBasePath;
