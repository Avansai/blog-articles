import React from "react";

type ExtendedSVGProps = React.SVGProps<SVGSVGElement> & {
  [attr: string]: string;
};

type ControlRule = {
  selector: {
    attributeName: string;
    attributeValue: string;
  };
  props: React.SVGProps<SVGSVGElement>;
};

type ControlRules = ControlRule[];

/**
 * Get an object that indexes control rules.
 *
 * @param rules - The control rules.
 *
 * @returns An object that indexes control rules.
 */
const getPropsSelectorIndex = (
  rules: ControlRules
): { [key: string]: React.SVGProps<SVGSVGElement> } => {
  return rules.reduce((acc, config) => {
    const { attributeName, attributeValue } = config.selector;
    acc[attributeName + ":" + attributeValue] = config.props;
    return acc;
  }, {} as { [key: string]: React.SVGProps<SVGSVGElement> });
};

/**
 * Clone a React node and its children while trying to inject new props.
 *
 * @param node - The node to clone.
 * @param propsSelectorIndex - An object that indexes control rules.
 *
 * @returns The cloned node with new props when applicable.
 */
const cloneNode = (
  node: React.ReactElement<ExtendedSVGProps>,
  propsSelectorIndex: { [key: string]: React.SVGProps<SVGSVGElement> }
): React.ReactElement<ExtendedSVGProps> => {
  const { children, ...restProps } = node.props;
  let nodeProps: Partial<ExtendedSVGProps> & React.Attributes = {
    ...restProps,
  };

  const matchingProps =
    propsSelectorIndex[
      Object.entries(nodeProps).find(
        ([key, value]) => propsSelectorIndex[key + ":" + value]
      )?.[0] +
        ":" +
        Object.entries(nodeProps).find(
          ([key, value]) => propsSelectorIndex[key + ":" + value]
        )?.[1]
    ];

  if (matchingProps) {
    const compatibleProps = Object.entries(matchingProps).reduce(
      (acc, [propKey, propValue]) => {
        if (typeof propValue === "string") {
          acc[propKey] = propValue;
        }
        return acc;
      },
      {} as ExtendedSVGProps
    );
    nodeProps = { ...nodeProps, ...compatibleProps };
  }

  const clonedChildren = React.Children.map(children, (child) =>
    React.isValidElement<ExtendedSVGProps>(child)
      ? cloneNode(child, propsSelectorIndex)
      : child
  );

  return React.cloneElement(node, nodeProps, clonedChildren);
};

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
 * Component to control the internal nodes of an SVG image.
 */
export const SvgController: React.FC<{
  rules: ControlRules;
  children: React.ReactElement<ExtendedSVGProps>;
}> = ({ rules, children }) => {
  if (!isFunctionalComponent(children)) {
    return children;
  }

  const SvgComponent = children.type({});
  const propsSelectorIndex = getPropsSelectorIndex(rules);

  return React.isValidElement<ExtendedSVGProps>(SvgComponent)
    ? cloneNode(SvgComponent, propsSelectorIndex)
    : children;
};
