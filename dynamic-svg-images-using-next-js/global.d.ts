// Allow TypeScript to import SVG files using Webpack's `svgr` loader.
declare module "*.svg" {
  import React from "react";
  const content: React.FC<React.SVGProps<SVGSVGElement>>;
  export default content;
}
