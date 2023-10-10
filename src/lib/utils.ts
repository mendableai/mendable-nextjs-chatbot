import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 *  Check if the current environment is an Apple device or Safari browser
 * @returns true if the current environment is an Apple device or Safari browser
 */
export function isAppleEnvironment() {
  const userAgent = navigator.userAgent;
  //if ios mobile device
  const isMobileIos = /iPhone|iPad|iPod/i.test(userAgent);
  // if safari browser and not chrome, firefox, edge, ie or opera
  const isSafariBrowser =
    userAgent.indexOf("Safari") !== -1 &&
    userAgent.indexOf("Chrome") === -1 &&
    userAgent.indexOf("Firefox") === -1 &&
    userAgent.indexOf("Edge") === -1 &&
    userAgent.indexOf("MSIE") === -1 &&
    userAgent.indexOf("Opera") === -1;

  return isMobileIos || isSafariBrowser;
}
