import css from 'dom-css';

export default function createCanvas () {
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  document.body.style.margin = '0';
  css(canvas, {
    display: 'none',
    position: 'absolute',
    'box-shadow': '3px 3px 20px 0px rgba(0, 0, 0, 0.15)',
    'box-sizing': 'border-box'
  });
  return canvas;
};