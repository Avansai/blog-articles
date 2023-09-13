import CheckMark from './CheckMark.svg'
import { SvgMargin } from '@/src/SvgMargin'

export default function CheckMarkPage() {
  return <NormalCheckMark />
}

const NormalCheckMark: React.FC = () => <CheckMark />

const BrokenCheckMark: React.FC = () => (
  <CheckMark strokeWidth={'5px'} color={'blue'} />
)

const FixedCheckMark: React.FC = () => (
  <SvgMargin size={10}>
    <CheckMark strokeWidth={'5px'} color={'blue'} />
  </SvgMargin>
)
