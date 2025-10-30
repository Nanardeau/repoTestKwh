<template>
  <div class="flex flex-col items-center justify-around h-screen">
    <div class="flex items-center gap-5">
      <UBadge color="primary" variant="soft">
        <h1 class="text-lg">Surface : {{ surface.toFixed(2) }} m²</h1>
      </UBadge>
      <USelect v-model="spaceId" :options="idList" option-attribute="name" placeholder="Chargement ..." />
      <UButton :color="isPickingActivated ? 'red' : 'green'" :disabled="space === null && queryClient === null" @click="togglePicking">
        {{ isPickingActivated ? "Désactiver le picking mode" : "Activer le picking" }}
      </UButton>
      <UCheckbox v-model="isMultiSelctingActivated" name="multi-select" label="Selection multiple" />
      <UButton :disabled="space === null && queryClient === null" :color="isMeasuringActivated ? 'red' : 'green'" @click="measure">
        {{ isMeasuringActivated ? "Désactiver la règle" : "Activer la règle" }}
      </UButton>
    </div>
    <div class="w-5/6">
      <SmplrViewer :space-id="spaceId" @mounted="setupIdList" @ready="onReady" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { QueryClient, RoomWithHoles, Smplr, SmplrCoord3d, Space } from '@smplrspace/smplr-loader';

const spaceId = ref<string>('spc_c8u5tvfx');
const idList = ref<{ value: string, name: string }[]>([]);
const isPickingActivated = ref<boolean>(false);
const isMultiSelctingActivated = ref<boolean>(false);
const isMeasuringActivated = ref<boolean>(false);

const toast = useToast();

const space = ref<Space | null>(null);
const queryClient = ref<QueryClient | null>(null);

const surface = ref<number>(0);
const selectedRooms = ref<Set<RoomWithHoles>>(new Set([]));

function togglePicking() {
  /**
   * Toggle the picking mode
   */
  isPickingActivated.value = !isPickingActivated.value;

  /**
   * If the picking mode is activated, we enable the picking mode
   */
  if(isPickingActivated.value) {
    space.value!.enablePickingMode({
      onPick: async (pick) => {

        /**
         * Get the room at the picked point
         */
        const room = await queryClient.value!.getRoomAtPoint({spaceId: spaceId.value, point: pick.coordinates});

        /**
         * If no room is found, we display a toast
         */
        if(!room) {
          console.log("TOAST !");
          toast.add({
            title: 'Erreur',
            description: 'Aucune pièce trouvée à cet endroit',
            color: 'red',
            timeout: 3000,
            icon: "error"
          })
        }

        /**
         * If the multi-selecting mode is activated, we add the room to the selected rooms set
         */
        if (isMultiSelctingActivated.value) {
          /**
           * If the room is already selected, we remove it from the selected rooms set
           */
          if(selectedRooms.value.has(room!)) {
            selectedRooms.value.delete(room!);
          } else {
            selectedRooms.value.add(room!);
          }
        } else {
          /**
           * If the multi-selecting mode is not activated, we clear the selected rooms set and add the room to it
           */
          selectedRooms.value = new Set([room!]);
        }

        /**
         * Add the selected rooms to the data layer
         */
        space.value!.addPolygonDataLayer({
            id: 'room',
            data: [...selectedRooms.value].map((room) => ({ coordinates: room.coordinates })),
            color: 'green',
            alpha: 0.5,
          });

        /**
         * Compute the total surface of the selected rooms
         */
        surface.value = [...selectedRooms.value].reduce(totalSurfaceReducer, 0);
      }
    });
  } else {
    /**
     * If the picking mode is disabled, we disable the picking mode and remove the data layer and set the surface to 0
     */
    resetSelectedRooms();
  }
}

function resetSelectedRooms() {
  space.value!.disablePickingMode();
  space.value!.removeDataLayer('room');
  selectedRooms.value = new Set([]);
  surface.value = 0;
}

async function setupIdList({ queryClient }: {queryClient: QueryClient, space: Space, client: Smplr}) {
  /**
   * Get the list of spaces and set the idList value
   */
  idList.value = (await queryClient.listSpaces()).map((space) => ({ value: space.sid, name: space.name }));
}

function onReady({ space: s, queryClient: q }: {queryClient: QueryClient, space: Space, client: Smplr}) {
  /**
   * Set the space and queryClient values
   */
  space.value = s;
  queryClient.value = q;
}

function totalSurfaceReducer(acc: number, room: RoomWithHoles) {
  /**
   * Compute the total surface of the selected rooms
   */
  return acc + queryClient.value!.getPolygonArea({polygon: room.room, unit: 'sqm'});
}

function measure() {
  let points: SmplrCoord3d[] = [];

  isMeasuringActivated.value = !isMeasuringActivated.value;
  isPickingActivated.value = false;
  resetSelectedRooms();

  /**
   * If the measuring mode is activated, we enable the picking mode and add the points and the polyline data layer
   */
  if(isMeasuringActivated.value) {

    space.value!.enablePickingMode({
      onPick: (pick) => {
        /**
         * If no point is set, we add the first point and display a toast
         */
        if(points.length == 0) {
          toast.add({
            title: "Point 1",
            description: "Premier point de mesure posé",
            timeout: 3000,
          });

          space.value!.addPointDataLayer({
            id: 'measure1',
            data: [{position: pick.coordinates}],
            shape: 'sphere',
            color: 'red',
            alpha: 0.8,
            onDrop ( dropped ) {
              points[0] = dropped.position;
            },
          })

          points.push(pick.coordinates);
        /**
         * If one point is set, we add the second point and the polyline data layer
         */
        } else if(points.length == 1) {
          toast.add({
            title: "Point 2",
            description: "Deuxième point de mesure posé",
            timeout: 3000,
          });

          points.push(pick.coordinates);

          space.value!.addPointDataLayer({
            id: 'measure2',
            data: [{position: pick.coordinates}],
            shape: 'sphere',
            color: 'red',
            alpha: 0.8,
            onDrop ( dropped ) {
              points[1] = dropped.position;
            },
          })

          space.value!.addPolylineDataLayer({
            id: 'measure',
            data: [{ coordinates: points }],
            color: 'green',
            alpha: 0.7,
            scale: 0.3,
            tooltip: () => "Distance: " + queryClient.value!.getPolylineLength({line: points, unit: "m"}).toFixed(2) + " m"
          })
        /**
         * If two points are set, we reset the measure
         */
        } else {
          toast.add({
            title: "Reset",
            description: "Mesure reset",
            timeout: 3000,
          });

          space.value!.removeDataLayer('measure1');
          space.value!.removeDataLayer('measure2');
          space.value!.removeDataLayer('measure');

          points = [];
        }
      }
    })
  /**
   * If the measuring mode is disabled, we disable the picking mode and remove the data layers
   */
  } else {
    space.value!.disablePickingMode();
    space.value!.removeDataLayer('measure1');
    space.value!.removeDataLayer('measure2');
    space.value!.removeDataLayer('measure');
    points = [];
  }
}
</script>