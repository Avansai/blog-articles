import React from "react";

/**
 * Type guard to check if a React node is a functional component.
 *
 * @param node - A React node to check.
 *
 * @returns True if it's a functional component, otherwise false.
 */
const isFunctionalComponent = (
  node: React.ReactNode
): node is React.FunctionComponentElement<React.SVGProps<SVGSVGElement>> => {
  return (
    node !== null &&
    typeof node === "object" &&
    "type" in node &&
    typeof node.type === "function"
  );
};

/**
 * Get the name of a component.
 *
 * @param component - A component.
 *
 * @returns The component name.
 */
const getComponentName = (component: React.ReactElement) =>
  typeof component.type === "string"
    ? component.type
    : (component?.type as React.FunctionComponent)?.displayName ||
      component?.type?.name ||
      "Unknown";

/**
 * Component to add margin around an SVG image.
 */
export const SvgMargin: React.FC<{
  children: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  /** The size of the margin to apply to the SVG image (e.g., 5 will be 5% of the image height/width). */
  size: number;
}> = ({ children, size: marginRatio }) => {
  if (!isFunctionalComponent(children)) {
    return children;
  }

  const SvgComponent = children.type({});

  if (!React.isValidElement<React.SVGProps<SVGSVGElement>>(SvgComponent)) {
    return children;
  }

  const viewBox =
    children?.props?.viewBox ?? SvgComponent?.props?.viewBox ?? "";

  const [x, y, width, height] = viewBox
    .split(" ")
    .map((value) => parseFloat(value));

  if ([x, y, width, height].some((val) => val == null || isNaN(val))) {
    console.error(
      `missing viewBox property for svg ${getComponentName(SvgComponent)}`
    );
    return children;
  }

  const margin = marginRatio / 100;

  // Calculate new x and width values.
  const widthMargin = width * margin;
  const newX = x - widthMargin;
  const newWidth = width + 2 * widthMargin;

  // Calculate new y and height values.
  const heightMargin = height * margin;
  const newY = y - heightMargin;
  const newHeight = height + 2 * heightMargin;

  return React.cloneElement(
    SvgComponent,
    {
      ...children.props,
      viewBox: `${newX} ${newY} ${newWidth} ${newHeight}`,
    },
    SvgComponent.props.children
  );
};
