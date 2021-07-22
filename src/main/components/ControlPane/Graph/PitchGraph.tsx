import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import { ISize } from "../../../../common/geometry"
import { createPitchBend } from "../../../actions"
import { useStores } from "../../../hooks/useStores"
import LineGraphControl from "./LineGraphControl"

export type PitchGraphProps = ISize

const PitchGraph: FC<PitchGraphProps> = observer(({ width, height }) => {
  const rootStore = useStores()
  const createEvent = createPitchBend(rootStore)
  const events = rootStore.pianoRollStore.pitchBendEvents

  return (
    <LineGraphControl
      width={width}
      height={height}
      maxValue={0x4000}
      events={events}
      axis={[-0x2000, -0x1000, 0, 0x1000, 0x2000 - 1]}
      createEvent={(obj) => createEvent(obj.value, obj.tick)}
      onClickAxis={(value) => createEvent(value + 0x2000)}
    />
  )
})

export default React.memo(PitchGraph)
