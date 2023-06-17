import Link from "next/link";
import React from "react";

export default function HomePage() {
  return (
    <>
      <h1 style={{ width: "100%" }}>
        Demo application for the blog article: Dynamic SVG images using Next.js
      </h1>
      <ul>
        <li>
          <Link href="/check-mark">Basic tests using the check-mark SVG</Link>
        </li>
        <li>
          <Link href="/circles-inline-style">Testing inline style</Link>
        </li>
        <li>
          <Link href="/circles-css-module">Testing CSS module</Link>
        </li>
        <li>
          <Link href="/circles-helper-function">
            Testing the helper function (advanced dynamic path styling)
          </Link>
        </li>
      </ul>
    </>
  );
}
