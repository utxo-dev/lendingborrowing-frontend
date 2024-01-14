import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import ms from "ms";

import { env } from "@/env.mjs"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(input) {
  const date = new Date(input)
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function absoluteUrl(path) {
  return `${env.NEXT_PUBLIC_APP_URL}${path}`
}


// Utils from precedent.dev

export const timeAgo = (timestamp, timeOnly) => {
  if (!timestamp) return "never";
  return `${ms(Date.now() - new Date(timestamp).getTime())}${
    timeOnly ? "" : " ago"
  }`;
};

export async function fetcher(
  input,
  init,
){
  const res = await fetch(input, init);

  if (!res.ok) {
    const json = await res.json();
    if (json.error) {
      const error = new Error(json.error);
      error.status = res.status;
      throw error;
    } else {
      throw new Error("An unexpected error occurred");
    }
  }

  return res.json();
}

export function nFormatter(num, digits) {
  if (!num) return "0";
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "K" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item
    ? (num / item.value).toFixed(digits || 1).replace(rx, "$1") + item.symbol
    : "0";
}

export function capitalize(str) {
  if (!str || typeof str !== "string") return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const truncate = (str, length) => {
  if (!str || str.length <= length) return str;
  return `${str.slice(0, length)}...`;
};

export const isEmpty =  (value) => {
  return (
    // null or undefined
    (value == null) ||

    // has length and it's zero
    (value.hasOwnProperty('length') && value.length === 0) ||

    // is an Object and has no keys
    (value.constructor === Object && Object.keys(value).length === 0)
  )
}
