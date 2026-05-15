<template>
  <div class="h-(--ui-header-height) shrink-0 flex items-center px-4 border-b border-default">

  </div>
  <div class="flex flex-col items-center justify-around h-screen">
    
    <Stats :piece-id="pieceIdModale" v-model:open="openModalPiece", v-model:name="pieceNameModale"/>
    
    <div class="flex items-center gap-5">
      <Viewertoolbar 
      v-model:space-id="spaceId" 
      v-model:id-list="idList" 
      v-model:is-picking-activated="isPickingActivated" 
      v-model:query-client="queryClient" 
      v-model:id-list-lots="idListLots"
      v-model:is-multi-selcting-activated="isMultiSelctingActivated"
      v-model:space="space"
      v-model:id-lot="idLot"
      v-model:idlist="idList"
      v-model:is-furniture-showing="isFurnitureShowing"
      v-model:is-measuring-activated="isMeasuringActivated"
      v-model:is-multi-selecting-activated="isMultiSelctingActivated"
      v-model:open-side-bar="openSideBar"

      @afficher-spc-id="afficherSpaceId"
      @colorer-lot="colorerLot"
      @essai-heat-map="essaiHeatMap"
      @measure="measure"
      @toggle-picking="togglePicking"
      @afficher-meubles="afficherMeubles"
      />

      </div>

      <!-- <UBadge color="info" variant="soft">
        <div :style="{ display : 'flex', flexDirection: 'column' }">
          <div :style="{ display : 'flex', flexDirection: 'column' }">
            <h1 class="text-lg">Surface lot : {{ surfaceTotaleLot.toFixed(2) }} m²</h1> 
            <h1 class="text-lg">Volume lot : {{ volumeTotalLot.toFixed(2) }} m<sup>3</sup></h1>
          </div>
          <div :style="{ display : 'flex', flexDirection: 'column' }">
            <h1 class="text-lg">Surface lvl : {{ surfaceTotaleLevel.toFixed(2) }} m²</h1> 
            <h1 class="text-lg">Volume lvl : {{ volumeTotalLevel.toFixed(2) }} m<sup>3</sup></h1>
          </div>
        </div>
      </UBadge> -->

      <SidebarSurface v-model:open="openSideBar"/>
      
      <div class="w-5/6" :style="{display:'flex'}">
      <div :style="{ display : 'flex', flexDirection: 'column', alignSelf:'center' }">
          <UButton :color="'success'" :disabled="currentLevel! == maxLevels!" @click="level('up')"> +1 </UButton>
          <p>{{ currentLevelName === null || currentLevelName === undefined ? "inconnu" : currentLevelName }}</p>
          <UButton :color="'success'" :disabled="currentLevel! == 0" @click="level('down')"> -1</UButton>
      </div>
      <SmplrViewer :space-id="spaceId" @mounted="setupIdList" @ready="onReady" />
      <SelectData/>
    </div>
    <UBadge color="primary">
      <p id="smplr-legend"/>
    </UBadge>
  
  </div>
  </template>

<script setup lang="ts">
import Stats from '../components/stats.vue';
import SidebarSurface from '~/components/sidebarsurface.vue';
import type { QueryClient, SmplrCoord2d, RoomWithHoles,  Smplr,  SmplrCoord3d,  Space, SpaceLevel} from '@smplrspace/smplr-loader';
import { useRoute } from "vue-router";
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from '../app.vue';

import { useVariablesStore } from '~/stores/variables';
import { useSurfacesStore } from '~/stores/surfaces';

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
//spc_c8u5tvfx
//spc_cx1svr5x

//SERIENCE spc_k4bxdm74

const smplrRef= ref<Smplr>();
const storeVar = useVariablesStore();
const storeSurfaces = useSurfacesStore();

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
const idPieces = ref<any>();
const idLotsQuery = ref<Array<any>>();
const idListLots = ref<{value: string, label:string}[]>([]);

const coloredRooms = ref(new Set([]));
const idLot = ref<string>('aucun');
const boutonUp = ref();
const boutonDown = ref();
const count = ref<number>(0);

const currentLevel = ref<number>();
const currentLevelName = ref<string>();
const maxLevels = ref<number>(0);
const minLevel = ref<number>(0);
const levelNames = ref<Array<string>>([]);

const openSideBar = ref(false);

const openModalPiece = ref(false);
const pieceIdModale = ref<string>('');
const pieceNameModale = ref<string>('');

const coordoCapteurs = ref<Array<any>>([]);
const valeursCapteurs = ref<Array<any>>([]);
const roomsOnLevel = ref<any>();
const capteurSeul = ref<any>();

async function afficherSpaceId(){
  console.log(count.value);
  console.log("SPACE ID");
  console.log(spaceId.value);
  storeVar.setIdPieces(await useFetch(`/api/piece/pieces/${spaceId.value}`, {server:false}));

  storeSurfaces.resetGlobal()

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

async function setupListLot(){

  idLotsQuery.value = await $fetch(`/api/lot/lots/space/${spaceId.value}`, {method:"GET"});
  if(idLotsQuery.value){
    idListLots.value = idLotsQuery.value.map((lot) => ({value:lot["idlot"], label:lot["numlot"]}));
    idListLots.value.push({value: "tous", label:"Tous"});
    idListLots.value.push({value: "aucun", label:"Aucun"});
  }
//.forEach((lot) => ({name:lot["numlot"], value:lot["idlot"]}));

}
async function level(direction: string){
  storeSurfaces.resetLevel();
  direction == 'up' ? (currentLevel.value != maxLevels.value ? currentLevel.value!++ : null) : (currentLevel.value != 0 ? currentLevel.value!-- : null);
  const temp = ref<any>();
    currentLevelName.value = levelNames.value[currentLevel.value!];
    console.log(currentLevel.value);
    
    if(currentLevel.value! >= minLevel.value){
      try{
        storeVar._space!.showUpToLevel(currentLevel.value!);
        
      }catch(e){
        console.log("ERREUR "+e);
      }
      
    //CALCUL SURFACE À UN ÉTAGE
    const salles = await $fetch(`/api/piece/pieces/etage/${currentLevelName!.value}&${spaceId.value}`); 
    console.log("SALLES ÉTAGE "+currentLevel.value);
    console.log(currentLevelName.value);
    console.log(salles);
    salles?.forEach((salle : any) => {
        if(salle.asset){
          
          storeSurfaces.incrementLevel(storeVar._queryClient!.getPolygonArea({polygon: salle.asset.coordinates, unit: 'sqm'}), storeVar._queryClient!.getPolygonArea({polygon: salle.asset.coordinates, unit: 'sqm'}) * 2.5)
          console.log(storeVar._queryClient?.getPolygonArea({polygon: salle.asset.coordinates, unit:"sqm"}));

        }
        else{
          console.log("SALLE pas asset");
          console.log(salle);
        }

      
    });
  }
}
async function colorerLot(){
  coloredRooms.value = new Set([]);
  storeSurfaces.resetLot();
  for(let i = 0 ; i < idListLots.value.length ; i++){
    if(storeVar._space != null){
      storeVar._space!.removeDataLayer('lots' +i);

    }

  }
  if(idLot.value == "aucun"){
    storeVar._space?.removeAllDataLayers();
  }
  else if(idLot.value != "tous"){
    let dernierLevel = 0;
    coloredRooms.value = await $fetch(`/api/piece/lots/${idLot.value}`, {method:"GET"});   

      coloredRooms.value.forEach((room: any) => {
        if(room["asset"]){

        
        const coordo = ref<SmplrCoord2d[]>([]);
          room["asset"]["coordinates"][0].forEach((point:any) => {
            coordo.value.push({x: point["x"], z: point["z"], levelIndex:room["asset"]["levelIndex"]});
          });
          if(room["asset"]["levelIndex"] > dernierLevel){
            dernierLevel = room["asset"]["levelIndex"];
          }
          const temp = storeVar._queryClient!.getPolygonArea({polygon: coordo.value, unit: 'sqm'});
          storeSurfaces.incrementLot(temp, temp * 2.50);

      }
    });
        storeVar._space!.showUpToLevel(dernierLevel);
        currentLevel.value = dernierLevel;
        currentLevelName.value = levelNames.value[dernierLevel];
        storeVar._space!.addPolygonDataLayer({
          id : 'lot',
          data: [...coloredRooms.value].map((room) => ({coordinates : room["asset"]["coordinates"], name:room["nompiece"], id:room["idpiece"] })),
          color:'yellow',
          alpha:0.5,
          tooltip: d => `${d.name}`,
          onClick: (event) =>  {openModalPiece.value = true; pieceIdModale.value = event.id; pieceNameModale.value = event.name}
        }); 
  }
  else{
    if(storeVar._space != null){
      storeVar._space!.removeDataLayer('lot');

    }
    coloredRooms.value = new Set([]);
    const couleurs = ['blue', 'green', 'yellow', 'orange', 'purple', 'brown', 'magenta'];
    
    for(let i = 0 ; i < idListLots.value.length - 1 ; i++){ // -1 pour ne pas inclure le lot "tous"
      //J'itère sur chacun des lots de la liste de lots pour faire un GET des pièces de ce lot, pour ensuite les colorier
      coloredRooms.value = (await $fetch(`/api/piece/lots/${idListLots.value[i]!.value}`, {method:"GET"}));
      coloredRooms.value.forEach((room:any) => {
        const coordo = ref<SmplrCoord2d[]>([]);
          room["asset"]["coordinates"][0].forEach((point: any) => {
            
            coordo.value.push({x: point["x"], z: point["z"], levelIndex:room["asset"]["levelIndex"]});
          });

          /*
          * Je passe par une variable temporaire pour adapter si jamais on a la taille de chaque mur
          */

          const temp = storeVar._queryClient!.getPolygonArea({polygon: coordo.value, unit: 'sqm'});
          storeSurfaces.incrementLot(temp, temp * 2.50);  // Ici, 2,5m mais si jamais ça change on n'aura qu'à mettre la taille des murs
      });

      const couleur = couleurs.pop(); // Améliorer ça, que ça boucle sur les couleurs plutôt que d'en prévoir un nombre fini
      // i % 2 == 0 ? 'blue' : 'success';    
      storeVar._space!.addPolygonDataLayer({
        id : 'lots'+i,
        data: [...coloredRooms.value].map((room) => ({coordinates : room["asset"]["coordinates"], name:room["nompiece"], id:room["idpiece"], lot: idListLots.value[i]!.label})),
        tooltip: d => `${d.lot == '1' ? 'Commun' : 'Lot ' + d.lot} - ${d.name}`,
        onClick: (e) => {openModalPiece.value = true;  pieceIdModale.value = e.id; pieceNameModale.value = e.name},
        color: couleur,
        alpha:0.5,
        
    }); 
    }
  }

  
}


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
              
                storeSurfaces.incrementGlobal(storeVar._queryClient!.getPolygonArea({polygon: room.asset.coordinates, unit: 'sqm'}), storeVar._queryClient!.getPolygonArea({polygon: room.asset.coordinates, unit: 'sqm'}) * 2.5)
              

            }
        }

      }
    });    
  }

}

function estUnePiece(coordonneesSalle: Array<any>){
  let res = false;
  /*
  * Je fais trop de boucles : pour chaque salle je regarde pour chaque pièce dans la bdd si les coordonnées correspondent ou pas
  */


//  let data = storeVar._idPieces["data"][3]["asset"]["coordinates"][0];
  let data = new Array<any>(); 
  data = storeVar._idPieces["data"];
  data.forEach((pieceBdd) => {
    // let coordo = findXYminMax(pieceBdd["asset"]["coordinates"][0]);
    
    // Je compare les coordonnées du PREMIER POINT de la salle 
    // => pas optimal parce que certains data layers sont ajustés à la main
    if(pieceBdd["asset"]){

      if(coordonneesSalle[0]["x"] == pieceBdd["asset"]["coordinates"][0][0]["x"] && pieceBdd["asset"]["coordinates"][0][0]["y"] == coordonneesSalle[0]["y"] && pieceBdd["asset"]["coordinates"][0][0]["levelIndex"] == coordonneesSalle[0]["levelIndex"] ){
        res = true;
      }
    }
  })
  return res;
    // console.log("DATA ASSET COORD "+ data["asset"]["coordinates"][0]);
    // console.log("COORDO SALLE "+coordonneesSalle);

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
async function essaiHeatMap(){
  coordoCapteurs.value = [];
  storeVar._space!.removeDataLayer('hm');
  storeVar._space!.removeAllDataLayers();
  roomsOnLevel.value = await $fetch(`/api/piece/pieces/etage/${currentLevel.value}&${spaceId.value}`);
  console.log("LEVEL COURANT : " + currentLevel.value);

  for (const room of roomsOnLevel.value) {
  const capteur = await $fetch(`/api/capteur/${room.idpiece}`);
  
  if (capteur) {
    const warpData = await $fetch(`/api/capteur/warp10/${room.idpiece}&${storeVar._typeData}`);
    coordoCapteurs.value.push([room, warpData]);
  }
}

  console.log("COORDOCAPTEURS ");
  console.log(coordoCapteurs.value);

 coordoCapteurs.value.forEach((donnee: any) => {
  const temperature = donnee[1][0]?.["v"]?.[0]?.[1];
  
  if (temperature !== undefined) {
    storeVar._space!.addPolygonDataLayer({
      id: donnee[0]["idpiece"],
      data: [{
        id: donnee[0]["idpiece"],
        coordinates: donnee[0]["asset"]["coordinates"],
        name: donnee[0]["nompiece"],
        value: temperature
      }],
      color: (d) => {
        switch(storeVar._typeData){
          case 'co2':
            if(d.value > 600) return "red";
            if(d.value < 400) return "green";
            return "yellow";
            break;
          default:
            if (d.value > 25) return "red";
            if (d.value < 20) return "green";
            return "yellow";
            break;
        }
      },
      alpha: 0.5,
      tooltip: (d) => storeVar._typeData === 'co2' ? `CO2 : ${d.value}` : `Température : ${d.value}°C`,
      onClick: (event) =>  {openModalPiece.value = true; pieceIdModale.value = event.id; pieceNameModale.value = event.name}
    });
  }
});


  // Les coordonnées se basent sur le SOL, si elles sont dans les airs ça ne fonctionnera pas
const rawData = [     
  { id:1, levelIndex: 2, x: 182.126, z: -54.355, value: 17 },
  { id:2, levelIndex: 2, x: 176.879, z: -55.209, value: 25 },
  { id:3, levelIndex: 2,  x: 195.989, z: -60.264, value: 20 },
  { id:4, levelIndex: 2, x: 193.524, z: -57.278, value: 22 },
  { id:5, levelIndex: 2, x: 176.262, z: -55.732, value: 27 },
  { id:6, levelIndex: 2, x: 181.227, z: -53.254, value: 15 },
  { id:7, levelIndex: 2, x: 172.337, z: -56.399, value: 17 },
  { id:8, levelIndex: 2, x: 193.144, z: -63.587, value: 17 },
];

const dataHm = rawData.map((d) => ({
  id: d.id,
  position: {
    levelIndex: d.levelIndex,
    x: d.x,
    z: d.z,
  },
  value: d.value,
}));

const dataTest = [
  { id:1, value: 17, position : {levelIndex:2, x: 120.72363861531221, z: -55.37731272654325, elevation: 0.009999999776482582}},
  { id:2, value: 19, position : {levelIndex:2, x: 120.31616658822531, z: -40.32848595282147, elevation: 0.009999999776486135}},
  { id:3, value: 20, position : {levelIndex:2, x: 117.51274810528558, z: -38.38687380878737, elevation: 0.009999999776482582}},
  { id:4, value: 22, position : {levelIndex:2, x: 117.82239335232062, z: -49.51764202937709, elevation: 0.009999999776486135}},
  { id:5, value: 24, position : {levelIndex:2,x: 136.54854211915313, z: -56.12197980280458, elevation: 0.009999999776482582}},
  { id:6, value: 15, position : {levelIndex:2, x: 97.77430667927675, z: -57.3023438052912, elevation: 0.009999999776482582}},
]
    //console.log('Heatmap data:', dataHm);
  
    const colorScale = storeVar._smplrRef?.Color?.numericScale?.({
      name: 'RdYlGn',
      domain: [15, 25],
      invert:true
    });

    // storeVar._space!.addHeatmapDataLayer({
    //   id: 'hm', 
    //   style: 'bar-chart',
    //   data: dataHm,
    //   value: (d) => d.value,
    //   color: colorScale!,
    //   // HEIGHT OBLIGATOIRE POUR BAR-CHART
    //   height: (v:number) => (v - 15) / 4,
    //   gridSize: 0.5,        
    //   confidenceRadius: 9,
    // });

   /* POUR LES FLUX D'AIR
    storeVar._space!.addDottedPolylineDataLayer({
      id:'flux',
      data:dataRail,
      animation:'railway',
      speed:0.5,
    }); */

}


async function onReady({ space: s, queryClient: q, client: cli }: {queryClient: QueryClient, space: Space, client: Smplr}) {
  /**
   * Set the space and queryClient values
   */

   coordoCapteurs.value = [];

  levelNames.value = [];

  storeVar.init(s, q, await $fetch(`/api/piece/pieces/${spaceId.value}`), cli);
  setupListLot();
  getGlobalSurface(spaceId.value);
  //const temp = ref<any>();
  const { data: temp } = await useFetch(() => `/api/piece/etage/${spaceId.value}`);
// levels sera automatiquement une Ref
  console.log(temp.value);
  minLevel.value = temp.value[0]["etage"];
  temp.value.forEach((etage:any) => { levelNames.value.push(etage.etage) });
  levelNames.value.push("Toit");
  maxLevels.value = temp.value.length;
  currentLevel.value = maxLevels.value;
  currentLevelName.value = levelNames.value[currentLevel.value!];
  
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

function totalSurfaceReducer(acc: number, room: RoomWithHoles) {
  /**
   * Compute the total surface of the selected rooms
   */
  return acc + storeVar._queryClient!.getPolygonArea({polygon: room.room, unit: 'sqm'});
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