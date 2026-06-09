<template>
  <div class="h-(--ui-header-height) shrink-0 flex items-center px-4 border-b border-default">

  </div>
  <div class="flex flex-col items-center justify-around h-screen">
    
    <Stats :piece-id="pieceIdModale" v-model:open="storeStats.openModalPiece", v-model:name="pieceNameModale"/>
    
    <div class="flex items-center gap-5">
      <Viewertoolbar 
      v-model:space-id="spaceId" 
      v-model:id-list="idList" 
      v-model:is-picking-activated="isPickingActivated" 
      v-model:query-client="queryClient" 
      v-model:id-list-lots="idListLots"
      v-model:is-multi-selcting-activated="isMultiSelctingActivated"
      v-model:space="space"
      v-model:idlist="idList"
      v-model:is-furniture-showing="isFurnitureShowing"
      v-model:is-measuring-activated="isMeasuringActivated"
      v-model:is-multi-selecting-activated="isMultiSelctingActivated"
      v-model:open-side-bar="openSideBar"
      v-model:liste-scaps="listeScaps"
      v-model:id-scap="idScap"

      @afficher-spc-id="afficherSpaceId"  
      @measure="measure"
      @toggle-picking="togglePicking"
      @afficher-meubles="afficherMeubles"
      
      />

      </div>
      <SidebarSurface v-model:open="openSideBar"/>
      
      <div class="w-5/6" :style="{display:'flex'}">
      <div :style="{ display : 'flex', flexDirection: 'column', alignSelf:'center' }">
          <UButton :color="'success'" :disabled="storeLevels._currentLevel == storeLevels._maxLevels" @click="level('up')"> +1 </UButton>
          <p>{{ storeLevels._currentLevelName === null || storeLevels._currentLevelName === undefined ? "inconnu" : storeLevels._currentLevelName }}</p>
          <UButton :color="'success'" :disabled="storeLevels._currentLevel == 0" @click="level('down')"> -1</UButton>
      </div>
      <SmplrViewer :space-id="spaceId" @mounted="setupIdList" @ready="onReady" />
      <SelectData/>
    </div>
    <UBadge color="neutral">
      <div id="legende-scap-container" class="text-lg"></div>
      <div id="legende-lot-container" class="text-lg"></div>
    </UBadge>
  
  </div>
  </template>

<script setup lang="ts">
import Stats from '../components/stats.vue';
import SidebarSurface from '~/components/sidebarsurface.vue';
import type { QueryClient, SmplrCoord2d, RoomWithHoles,  Smplr,  SmplrCoord3d,  Space, SpaceLevel} from '@smplrspace/smplr-loader';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from '../app.vue';
import {useLevels} from '../composables/levels';
import { useDataLots } from '../composables/dataLots';
import { useDataScap } from '#imports';
import { useVariablesStore } from '~/stores/variables';
import { useSurfacesStore } from '~/stores/surfaces';
import { useLevelsStore } from '~/stores/levels';
import { useLotsStore } from '~/stores/lots';
import { useStatsStore } from '~/stores/stats';

//spc_c8u5tvfx
//spc_cx1svr5x

//SERIENCE spc_k4bxdm74

const storeVar = useVariablesStore();
const storeSurfaces = useSurfacesStore();
const storeLevels = useLevelsStore();
const storeLots = useLotsStore();
const storeStats = useStatsStore();
const {setupListLot} = useDataLots();
const {setupListScap} = useDataScap();
const spaceId = ref(storeVar._spaceId);
//const spaceId = ref<string>('spc_c8u5tvfx');
const idList = ref<{ value: string, label: string }[]>([]);
const isPickingActivated = ref<boolean>(false);
const isMultiSelctingActivated = ref<boolean>(false);
const isMeasuringActivated = ref<boolean>(false);
const isFurnitureShowing = ref<boolean>(false);

const toast = useToast();

const space = storeVar._space;
const queryClient = ref<QueryClient | null>(null);
const surface = ref<number>(0);


const selectedRooms = ref<Set<RoomWithHoles>>(new Set([]));
const idListLots = ref<{value: string, label:string}[]>([]);

const idScap = ref<string>('aucun');
const listeScaps = ref<{value: string, label:string}[]>([]);  //Reste plus qu'à faire colorerScap et c'est bon
const listeScapsQuery = ref<Array<any>>();
const listeSurfacesScap = ref<Array<number>>([]);


const coloredRooms = ref(new Set([]));

const count = ref<number>(0);

const currentLevel = ref<number>();


const openSideBar = ref(false);

const openModalPiece = ref(false);
const pieceIdModale = ref<string>('');
const pieceNameModale = ref<string>('');

const coordoCapteurs = ref<Array<any>>([]);

const {level, estUnePiece, totalSurfaceReducer, initLevels } = useLevels();

// Watch pour réinitialiser les données quand le bâtiment change
watch(spaceId, async (newSpaceId, oldSpaceId) => {
  if (newSpaceId && oldSpaceId && newSpaceId !== oldSpaceId) {
    console.log("Changement de bâtiment détecté, réinitialisation des données");
    
    storeSurfaces.resetGlobal();
    storeLevels.$reset();
    storeLots.$reset();
    storeVar.setIdLot("aucun");
    storeVar.setSpaceId(newSpaceId);
    storeVar.setIdPieces(await useFetch(`/api/piece/pieces/${newSpaceId}`, {server:false}));
    
    // Réinitialiser les variables locales
    currentLevel.value = undefined;
    coloredRooms.value = new Set([]);
    idScap.value = "aucun";
    coordoCapteurs.value = [];
    
    await initLevels(newSpaceId);
    await setupListLot();
    await setupListScap();
    await getGlobalSurface(newSpaceId);
    
    idListLots.value = [...storeLots._idListLots];

  }
});

async function afficherSpaceId(){
  console.log("Space ID changé:", spaceId.value);
  // Le watch sur spaceId va gérer la réinitialisation des données
}
async function afficherMeubles(){
  isFurnitureShowing.value = !isFurnitureShowing.value;
  if(!isFurnitureShowing.value){
    resetMeubles();
  }
  else{

    const meubles = ref<Array<any>>();
      meubles.value = await storeVar._queryClient?.getAllFurnitureInSpace(spaceId.value);
      count.value ++;
      if(meubles.value && count.value - 1 == meubles.value.length){
        count.value = 0;
      }
      if(meubles.value){
        meubles.value.forEach((meuble) => {
      console.log(meuble);
      if(meuble.name.includes("radiateur")){
        // storeVar._space!.addDataLayer({
          storeVar._space!.addFurnitureDataLayer({
            id:'radiateurs'+meuble.name,
          data:[{
            id:meuble.name,
            furnitureId:meuble.id,
            levelIndex: meuble.levelIndex,
          }],
          color:(d) => d.levelIndex == 1 ? 'green' : 'red', //Garder ça pour radiateurs à gaz / électriques
        });
        //   id: meuble.name,
        //   type: 'point',
        //   shape:'cube',
        //   data: [{ position: {
        //     levelIndex: meuble.levelIndex ?? 0,
        //     x: meuble.position.x,
        //     elevation: meuble.position.elevation,
        //     z: meuble.position.z,
        //   },
        //   rotation:meuble.rotation,  
        
        // }], 
        //   color:'error',
        //   anchor:'center',
        //   height:1,
        //   depth:0.3, 
        //   tooltip: () => `Nom: ${meuble.name}`,
        // });

        
      }
    });

    storeVar._space!.showUpToLevel(meubles.value[count.value].levelIndex);
    currentLevel.value = meubles.value[count.value].levelIndex;

    storeVar._space!.updateRenderOptions({
      walls:{
        alpha:0.4,
      }
    });
        storeVar._space!.setCameraPlacement({
          alpha:-Math.PI/2 + 1,
          beta:  Math.PI/2 - 0.3,
          radius:0,
          target:{
            x: meubles.value[count.value].position.x,
            z: meubles.value[count.value].position.z,
            y: meubles.value[count.value].position.elevation,
          },
          animate:true,
          
        })
  }
}
}
async function resetMeubles(){
  storeVar._space!.removeAllDataLayers();
    storeVar._space!.updateRenderOptions({
      walls:{
        alpha:1,
      }
    });

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
    storeVar._space!.enablePickingMode({
      onPick: async (pick) => {
        console.log(pick.coordinates);
        /**
         * Get the room at the picked point
         */
        const room = await storeVar._queryClient!.getRoomAtPoint({spaceId: spaceId.value, point: pick.coordinates});

        /**
         * If no room is found, we display a toast
         */
        if(!room) {
          console.log("TOAST !");
          toast.add({
            title: 'Erreur',
            description: 'Aucune pièce trouvée à cet endroit',
            color: 'error',
            ////timeout: 3000,
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
        storeVar._space!.addPolygonDataLayer({
            id: 'room',
            data: [...selectedRooms.value].map((room) => ({ coordinates: room.coordinates })),
            color: 'green',
            alpha: 0.5,
          });
        

        /**
         * Compute the total surface of the selected rooms
         */
        surface.value = [...selectedRooms.value].reduce(totalSurfaceReducer, 0);
        console.log(surface.value);
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
  storeVar._space!.disablePickingMode();
  storeVar._space!.removeDataLayer('room');
  selectedRooms.value = new Set([]);
  surface.value = 0;
}

async function setupIdList({ queryClient }: {queryClient: QueryClient, space: Space, client: Smplr}) {
  /**
   * Get the list of spaces and set the idList value
   */
  idList.value = (await queryClient.listSpaces()).map((space) => ({ value: space.sid, label: space.name }));
}

// async function setupListLot(){

//   idLotsQuery.value = await $fetch(`/api/lot/lots/space/${spaceId.value}`, {method:"GET"});
//   if(idLotsQuery.value){
//     idListLots.value = idLotsQuery.value.map((lot) => ({value:lot["idlot"], label:lot["numlot"]}));
//     idListLots.value.push({value: "tous", label:"Tous"});
//     idListLots.value.push({value: "aucun", label:"Aucun"});
//   }
// //.forEach((lot) => ({name:lot["numlot"], value:lot["idlot"]}));

// }



async function getGlobalSurface(spaceId:string){
  /*
  Essayer de récupérer toutes les rooms, utiliser totalSurfaceReducer pour chaque Room dans la liste des rooms de tous les étages.
  Là il faut que j'arrive à itérer sur le getRoomsOnLevel
  */

  if(storeVar._queryClient){
    storeVar._queryClient.getSpaceLevels(spaceId).then(async (levels) => {
      for(const etage of levels){
        if(etage.index != levels.length - 1){ //Comparaison pour ne pas compter le toit (dernier étage)
          const rooms = await $fetch(`/api/piece/pieces/etage/${etage.index}&${spaceId}`);

            for(const room of rooms){
                if(room.surface){
                  console.log("room surface en bdd, calcul");
                  storeSurfaces.incrementGlobal(room.surface, room.surface * 2.5);
                }
                else{
                  console.log("calcul par taille polygone");
                  storeSurfaces.incrementGlobal(storeVar._queryClient!.getPolygonArea({polygon: room.asset.coordinates, unit: 'sqm'}), storeVar._queryClient!.getPolygonArea({polygon: room.asset.coordinates, unit: 'sqm'}) * 2.5)

                }
              

            }
        }

      }
    });    
  }

}



// if(!(coordonneesSalle[0]["x"] < coordo.get("xMin")! || coordonneesSalle[0]["x"] > coordo.get("xMax")! || coordonneesSalle[0]["y"] < coordo.get("yMin")! || coordonneesSalle[0]["y"] > coordo.get("yMax")!)){
function findXYminMax(coordo:any){
  //Pour l'instant ne sert à rien, récupère le xmin, xmax, ymin, ymax pour vérifier si un point est dans un polygone
  const res = new Map<string, number>();
  res.set("xMin", 1000); 
  res.set("xMax", 0);
  res.set("yMin", 1000);
  res.set("yMax", 0);
  coordo.forEach((point:any) => {
    if(point["x"] < res.get("xMin")!){
      res.set("xMin", point["x"]);
    }
    if(point["x"] > res.get("xMax")!){
      res.set("xMax", point["x"]);
    }
    if(point["y"] < res.get("yMin")!){
      res.set("yMin", point["y"]);
    }
    if(point["y"] > res.get("yMax")!){
      res.set("yMax", point["y"]);
    }
  })
  return res;
}


async function onReady({ space: s, queryClient: q, client: cli }: {queryClient: QueryClient, space: Space, client: Smplr}) {
  /**
   * Set the space and queryClient values
   */

   coordoCapteurs.value = [];


  storeVar.init(s, q, await $fetch(`/api/piece/pieces/${spaceId.value}`), cli);
  await initLevels(spaceId.value);
  await setupListLot();
  await setupListScap();
  await getGlobalSurface(spaceId.value);
  
  // Synchroniser idListLots avec le store et initialiser currentLevel
  idListLots.value = [...storeLots._idListLots];
  currentLevel.value = storeLevels._currentLevel;
  
  storeVar.space!.hideNavigationButtons();
  storeVar.space!.hideLevelPicker();

  console.log("C'est prêt");
  //essaiHeatMap();
  // boutonUp.value = document.getElementsByClassName("sc-jOrMOR edmxfw smplr_control_button")[0];
  // boutonUp.value.addEventListener("click", () => {
  //   if(currentLevel.value && currentLevel.value < maxLevels.value){
  //     level('up');
  //     console.log("+1 FZEIUFGHEZ");
  //   }
  // });
  // boutonDown.value = document.getElementsByClassName('sc-jOrMOR hEjPcR smplr_control_button')[0];
  // boutonDown.value.addEventListener("click", () => {
  //   if(currentLevel.value && currentLevel.value > 0){
  //     level('down'),
  //     console.log("-1 ZDOAZP");
  //   } 
  // })
  

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

    storeVar._space!.enablePickingMode({
      onPick: (pick) => {
        /**
         * If no point is set, we add the first point and display a toast
         */
        if(points.length == 0) {
          toast.add({
            title: "Point 1",
            description: "Premier point de mesure posé",
            //timeout: 3000,
          });
          console.log(pick.coordinates);
          storeVar._space!.addPointDataLayer({
            id: 'measure1',
            data: [{position: pick.coordinates}],
            shape: 'sphere',
            color: 'error',
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
            //timeout: 3000,
          });

          points.push(pick.coordinates);

          storeVar._space!.addPointDataLayer({
            id: 'measure2',
            data: [{position: pick.coordinates}],
            shape: 'sphere',
            color: 'error',
            alpha: 0.8,
            onDrop ( dropped ) {
              points[1] = dropped.position;
            },
          })

          storeVar._space!.addPolylineDataLayer({
            id: 'measure',
            data: [{ coordinates: points }],
            color: 'success',
            alpha: 0.7,
            scale: 0.3,
            tooltip: () => "Distance: " + storeVar._queryClient!.getPolylineLength({line: points, unit: "m"}).toFixed(2) + " m"
          })
        /**
         * If two points are set, we reset the measure
         */
        } else {
          toast.add({
            title: "Reset",
            description: "Mesure reset",
            //timeout: 3000,
          });

          storeVar._space!.removeDataLayer('measure1');
          storeVar._space!.removeDataLayer('measure2');
          storeVar._space!.removeDataLayer('measure');

          points = [];
        }
      }
    })
  /**
   * If the measuring mode is disabled, we disable the picking mode and remove the data layers
   */
  } else {
    storeVar._space!.disablePickingMode();
    storeVar._space!.removeDataLayer('measure1');
    storeVar._space!.removeDataLayer('measure2');
    storeVar._space!.removeDataLayer('measure');
    points = [];
  }
}


</script>