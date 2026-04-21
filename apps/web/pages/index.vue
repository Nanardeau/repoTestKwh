<template>
  <div class="flex flex-col items-center justify-around h-screen">
    <div class="flex items-center gap-5">
      <UBadge color="primary" variant="soft">
        <h1 class="text-lg">Surface sélectionnée : {{ surface.toFixed(2) }} m²</h1>
      </UBadge>
      
      <USelect v-model="spaceId" :options="idList" option-attribute="name" placeholder="Chargement ..." @change="afficherSpaceId"/>
      <USelect v-model="idLot" :options="idListLots" option-attribute="name" placeholder="Numéro de lot" @change="colorerLot"/>

      <UButton :color="isPickingActivated ? 'red' : 'green'" :disabled="space === null && queryClient === null" @click="togglePicking">
        {{ isPickingActivated ? "Désactiver le picking mode" : "Activer le picking" }}
      </UButton>
      <UCheckbox v-model="isMultiSelctingActivated" name="multi-select" label="Selection multiple" />
      <UButton :disabled="space === null && queryClient === null" :color="isMeasuringActivated ? 'red' : 'green'" @click="measure">
        {{ isMeasuringActivated ? "Désactiver la règle" : "Activer la règle" }}
      </UButton>
      <UButton :color="'green'" @click=""> <!-- colorerLot('lot_wrRRGnvdGZvY7YD') -->
        {{ "Bouton test" }}
      </UButton>
      <UBadge color="primary" variant="soft">
        
        <h1 class="text-lg">Surface totale : {{ surfaceTotale.toFixed(2) }} m²</h1>
        <h1 class="text-lg">Volume total : {{ volumeTotal.toFixed(2) }} m<sup>3</sup></h1>
      </UBadge>
    </div>
    <div class="w-5/6">
      <SmplrViewer :space-id="spaceId" @mounted="setupIdList" @ready="onReady" />
    </div>
    <UBadge color="primary">
      <p>{{ "Lots : " + idListLots }}</p>
    </UBadge>
  </div>
</template>

<script setup lang="ts">
import type { QueryClient, RoomWithHoles, Smplr, SmplrCoord3d, Space } from '@smplrspace/smplr-loader';
import { useRoute } from "vue-router";
//spc_c8u5tvfx
//spc_cx1svr5x
const spaceId = ref<string>('spc_c8u5tvfx');
//const clientToken = ref<string>('pub_5e459d2d172140c69f966900315f1286');
const idList = ref<{ value: string, name: string }[]>([]);
const isPickingActivated = ref<boolean>(false);
const isMultiSelctingActivated = ref<boolean>(false);
const isMeasuringActivated = ref<boolean>(false);

const toast = useToast();

const space = ref<Space | null>(null);
const vraiQuery = ref<QueryClient>;
const queryClient = ref<QueryClient | null>(null);
const surface = ref<number>(0);
const surfaceTotale = ref<number>(0);
const volumeTotal = ref<number>(0);
const selectedRooms = ref<Set<RoomWithHoles>>(new Set([]));
const idPieces = ref<any>();
const idLotsQuery = ref<Array<any>>();
const idListLots = ref<{value: string, name:string}[]>([]);
//<{ value: string, name: string }[]>([]);

const idLot = ref<string>('tous');
colorerLot();

const coloredRooms = ref(new Set([]));



async function afficherSpaceId(){
  idPieces.value = await useFetch(`/api/piece/pieces/${spaceId.value}`, {server:false});
  console.log("IDPIECE TYPE" + idPieces.value.type);

  surfaceTotale.value = 0;
  volumeTotal.value = 0;

}
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
        //surfaceTotale.value = queryClient.getRoomsOnLevel(1);
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

async function setupListLot(){

  idLotsQuery.value = await $fetch(`/api/lot/lots/space/${spaceId.value}`, {method:"GET"});
  if(idLotsQuery.value){
    idListLots.value = idLotsQuery.value.map((lot) => ({value:lot.value["idlot"], name:lot["numlot"]}));
    idListLots.value.push({value: "tous", name:"Tous"});
  }
//.forEach((lot) => ({name:lot["numlot"], value:lot["idlot"]}));

}

async function colorerLot(){
  coloredRooms.value = new Set([]);
  for(let i = 0 ; i < idListLots.value.length ; i++){
    space.value!.removeDataLayer('lots' +i);

  }
  if(idLot.value != "tous"){
    coloredRooms.value = await $fetch(`/api/piece/lots/${idLot.value}`, {method:"GET"});    
    space.value!.addPolygonDataLayer({
      id : 'lot',
      data: [...coloredRooms.value].map((room) => ({coordinates : room["asset"]["coordinates"]})),
      color:'yellow',
      alpha:0.5,
    }); 
  }
  else{
    space.value!.removeDataLayer('lot');
    coloredRooms.value = new Set([]);
    for(let i = 0 ; i < idListLots.value.length -1 ; i++){
      coloredRooms.value = (await $fetch(`/api/piece/lots/${idListLots.value[i].value}`, {method:"GET"}));
      let couleur = i % 2 == 0 ? 'blue' : 'green';    
      space.value!.addPolygonDataLayer({
        id : 'lots'+i,
        data: [...coloredRooms.value].map((room) => ({coordinates : room["asset"]["coordinates"]})),
        color: couleur,
        alpha:0.5,
    }); 
    }
  }

  
}


function getGlobalSurface(spaceId:string){
  /*
  Essayer de récupérer toutes les rooms, utiliser totalSurfaceReducer pour chaque Room dans la liste des rooms de tous les étages.
  Là il faut que j'arrive à itérer sur le getRoomsOnLevel
  */

  if(queryClient.value){
    queryClient.value.getSpaceLevels(spaceId).then((levels) => {
      levels.forEach((etage) => {
        if(etage.index != levels.length - 1){ //Comparaison pour ne pas compter le toit (dernier étage)
          queryClient.value?.getRoomsOnLevel({spaceId:spaceId, levelIndex:etage.index}).then((rooms) => {
            rooms?.forEach((room) => {
              if(estUnePiece(room.coordinates[0])){
                surfaceTotale.value += totalSurfaceReducer(0, room);
                volumeTotal.value += totalSurfaceReducer(0, room) * 2.50;
              }

            })
          });

        }

      })
    });    
  }

}

function estUnePiece(coordonneesSalle: Array<any>){
  let res = false;
  /*
  * Je fais trop de boucles : pour chaque salle je regarde pour chaque pièce dans la bdd si les coordonnées correspondent ou pas
  */


//  let data = idPieces.value["data"][3]["asset"]["coordinates"][0];
  let data = new Array<any>(); 
  data = idPieces.value["data"];
  
  data.forEach((pieceBdd) => {
    // Je compare les coordonnées du PREMIER POINT de la salle
    if(pieceBdd["asset"]["coordinates"][0][0]["x"] == coordonneesSalle[0]["x"] && pieceBdd["asset"]["coordinates"][0][0]["y"] == coordonneesSalle[0]["y"] && pieceBdd["asset"]["coordinates"][0][0]["levelIndex"] == coordonneesSalle[0]["levelIndex"] ){
      res = true;
    }
  })
  return res;
    // console.log("DATA ASSET COORD "+ data["asset"]["coordinates"][0]);
    // console.log("COORDO SALLE "+coordonneesSalle);

}
async function onReady({ space: s, queryClient: q }: {queryClient: QueryClient, space: Space, client: Smplr}) {
  /**
   * Set the space and queryClient values
   */
  space.value = s;
  queryClient.value = q;
  idPieces.value = await useFetch(`/api/piece/pieces/${spaceId.value}`, {server:false});
  setupListLot();

  getGlobalSurface(spaceId.value);

  
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