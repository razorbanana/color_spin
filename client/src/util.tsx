import React from 'react';
import { RouletteColor } from 'shared';

export const RouletteColorBackgroundStyle = {
  [RouletteColor.red]: 'bg-red-600',
  [RouletteColor.black]: 'bg-black',
  [RouletteColor.green]: 'bg-green-600',
  [RouletteColor.none]: 'bg-gray-600',
};

export const RouletteColorTextStyle = {
  [RouletteColor.red]: 'text-red-600',
  [RouletteColor.black]: 'text-black',
  [RouletteColor.green]: 'text-green-600',
  [RouletteColor.none]: 'text-gray-600',
};

export const rouletteColor = (num: number): RouletteColor => {
  if (num === 0) return RouletteColor.green;
  if ((num >= 1 && num <= 10) || (num >= 19 && num <= 28))
    return num % 2 === 0 ? RouletteColor.black : RouletteColor.red;
  if ((num >= 11 && num <= 18) || (num >= 29 && num <= 36))
    return num % 2 === 0 ? RouletteColor.red : RouletteColor.black;
  throw new Error('Invalid number');
};

export const colorizeText = (text: string): JSX.Element[] =>
  text.split('').map((val, index) => {
    return val.charCodeAt(0) >= 48 && val.charCodeAt(0) <= 57 ? (
      <span key={index} className="text-orange-600">
        {val}
      </span>
    ) : (
      <span key={index} className="text-indigo-600">
        {val}
      </span>
    );
  });

type TokenPayload = {
  iat: number;
  exp: number;
  sub: string;
  name: string;
  tableID: string;
};

export const getTokenPayload = (accessToken: string): TokenPayload =>
  JSON.parse(atob(accessToken.split('.')[1]));
