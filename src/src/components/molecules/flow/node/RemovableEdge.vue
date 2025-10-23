<script setup>
import TickButton from "@/components/atoms/TickButton.vue";
import { BaseEdge, getBezierPath, useVueFlow } from '@vue-flow/core';
import { computed } from 'vue';

// eslint-disable-next-line no-undef
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  sourceX: {
    type: Number,
    required: true,
  },
  sourceY: {
    type: Number,
    required: true,
  },
  targetX: {
    type: Number,
    required: true,
  },
  targetY: {
    type: Number,
    required: true,
  },
  sourcePosition: {
    type: String,
    required: true,
  },
  targetPosition: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    required: false,
  },
  markerEnd: {
    type: String,
    required: false,
  },
  markerStart: {
    type: String,
    required: false,
  },

  style: {
    type: Object,
    required: false,
  },
  disabled: {
    type: Boolean,
    required: false,
  },
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { removeEdges } = useVueFlow()

const path = computed(() => getBezierPath(props))
//getSmoothStepPath 
const foreignObjectSize = 30;
const interactionWidth = 40;
const center = computed(() =>
  [
    (Math.min(props.sourceX, props.targetX) + ((Math.max(props.sourceX, props.targetX) - Math.min(props.sourceX, props.targetX)) / 2)),
    (Math.min(props.sourceY, props.targetY) + ((Math.max(props.sourceY, props.targetY) - Math.min(props.sourceY, props.targetY)) / 2)),
  ]
)

const disabled = computed(() =>
  props.disabled
)

// const tooltip = computed(() =>
//   `X => ${props.sourceX}:${props.sourceY}\n
//  Y => ${props.sourceY}:${props.sourceY}`
// )

</script>

<script>
export default {
  inheritAttrs: false,
}
</script>

<template>
  <!-- You can use the `BaseEdge` component to create your own custom edge more easily -->
  <BaseEdge :interactionWidth="interactionWidth" :id="id" :style="style" :path="path[0]" :marker-end="markerEnd" :marker-start="markerStart" />

  <!-- Use the `EdgeLabelRenderer` to escape the SVG world of edges and render your own custom label in a `<div>` ctx -->
  <!-- <EdgeLabelRenderer>
    <div :style="{
      pointerEvents: 'all',
      position: 'absolute',
      transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
    }" class="nodrag nopan">
      <button class="edgebutton" @click="removeEdges(id)">×</button>
    </div>
  </EdgeLabelRenderer> -->

  <foreignObject :width="foreignObjectSize" :height="foreignObjectSize" :x="center[0] - foreignObjectSize / 2" :y="center[1] - foreignObjectSize / 2" class="edgebutton-foreignobject"
    requiredExtensions="http://www.w3.org/1999/xhtml">

    <div class="edge-button-body" style="display: flex; align-items: center; justify-content: center">
      <div>
        <TickButton class="edgebutton" icon="delete" v-if="!disabled" @click="$emit('removeConnection', id)" appearance="secondary" color="contrast" :round="true" />
      </div>
    </div>
  </foreignObject>
</template>
