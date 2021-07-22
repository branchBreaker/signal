import { partition } from "lodash"
import { ControllerEvent, PitchBendEvent } from "midifile-ts"
import { observer } from "mobx-react-lite"
import React, { useCallback, useEffect, useState } from "react"
import { IPoint } from "../../../../common/geometry"
import { TrackEvent, TrackEventOf } from "../../../../common/track"
import { useStores } from "../../../hooks/useStores"
import { useTheme } from "../../../hooks/useTheme"
import { GLCanvas } from "../../GLCanvas/GLCanvas"
import { GraphAxis } from "./GraphAxis"
import { LineGraphRenderer } from "./LineGraphRenderer"

interface ItemValue {
  tick: number
  value: number
}

export interface LineGraphControlProps<T extends TrackEvent> {
  width: number
  height: number
  maxValue: number
  events: T[]
  createEvent: (value: ItemValue) => void
  onClickAxis: (value: number) => void
  lineWidth?: number
  axis: number[]
}

const LineGraphControl = observer(
  <T extends TrackEventOf<ControllerEvent | PitchBendEvent>>({
    maxValue,
    events,
    createEvent,
    width,
    height,
    lineWidth = 2,
    axis,
    onClickAxis,
  }: LineGraphControlProps<T>) => {
    const theme = useTheme()
    const rootStore = useStores()
    const { mappedBeats, cursorX, scrollLeft, transform } =
      rootStore.pianoRollStore

    function transformToPosition(tick: number, value: number) {
      return {
        x: Math.round(transform.getX(tick)),
        y:
          Math.round((1 - value / maxValue) * (height - lineWidth * 2)) +
          lineWidth,
      }
    }

    function transformFromPosition(position: IPoint): ItemValue {
      return {
        tick: transform.getTicks(position.x),
        value:
          (1 - (position.y - lineWidth) / (height - lineWidth * 2)) * maxValue,
      }
    }

    const onMouseDown = (ev: React.MouseEvent) => {
      const e = ev.nativeEvent
      const local = {
        x: e.offsetX + scrollLeft,
        y: e.offsetY,
      }
      createEvent(transformFromPosition(local))
    }

    const items = events.map((e) => {
      return {
        id: e.id,
        ...transformToPosition(e.tick, e.value),
      }
    })

    const [renderer, setRenderer] = useState<LineGraphRenderer | null>(null)

    useEffect(() => {
      if (renderer === null) {
        return
      }

      const [highlightedBeats, nonHighlightedBeats] = partition(
        mappedBeats,
        (b) => b.beat === 0
      )

      renderer.theme = theme
      renderer.render(
        lineWidth,
        items,
        nonHighlightedBeats.map((b) => b.x),
        highlightedBeats.map((b) => b.x),
        [],
        cursorX,
        scrollLeft
      )
    }, [renderer, scrollLeft, mappedBeats, cursorX, items])

    return (
      <div
        style={{
          display: "flex",
        }}
      >
        <GraphAxis axis={axis} onClick={onClickAxis} />
        <GLCanvas
          onMouseDown={onMouseDown}
          onCreateContext={useCallback(
            (gl) => setRenderer(new LineGraphRenderer(gl)),
            []
          )}
          width={width}
          height={height}
        />
      </div>
    )
  }
)

export default React.memo(LineGraphControl)
