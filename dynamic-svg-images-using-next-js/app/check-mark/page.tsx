import CheckMark from "./CheckMark.svg";
import { SvgMargin } from "@/src/SvgMargin";

export default function CheckMarkPage() {
  return (
    <SvgMargin size={10}>
      <CheckMark strokeWidth={"5px"} color={"blue"} />
    </SvgMargin>
  );
}
