<template>
  <div class="h-(--ui-header-height) shrink-0 flex items-center px-4 border-b border-default">

  </div>
  <div class="flex flex-col items-center justify-around h-screen">
    
    <Stats :piece-id="pieceIdModale" v-model:open="openModalPiece", :name="pieceNameModale"/>
    
    <div class="flex items-center gap-5">
      <USelect v-model="spaceId" :items="idList"  placeholder="Chargement ..." @change="afficherSpaceId"/>
      <USelect v-model="idLot" :items="idListLots" placeholder="Numéro de lot" @change="colorerLot"/>

      <UButton :color="isPickingActivated ? 'error' : 'success'" :disabled="space === null && queryClient === null" @click="togglePicking">
        {{ isPickingActivated ? "Désactiver le picking mode" : "Activer le picking" }}
      </UButton>
      <UCheckbox v-model="isMultiSelctingActivated" name="multi-select" label="Selection multiple" />
      <UButton :disabled="space === null && queryClient === null" :color="isMeasuringActivated ? 'error' : 'success'" @click="measure">
        {{ isMeasuringActivated ? "Désactiver la règle" : "Activer la règle" }}
      </UButton>
      <div :style="{display: 'flex', flexDirection:'column'}">
        <UButton :color="isFurnitureShowing ? 'error' : 'success'" @click="essaiHeatMap"> <!-- colorerLot('lot_wrRRGnvdGZvY7YD') -->
          {{ isFurnitureShowing ? "Masquer les meubles" : "Montrer meubles" }}
        </UButton>
        

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
            <UButton
      icon="i-lucide-panel-left"
      color="neutral"
      variant="ghost"
      aria-label="Toggle sidebar"
      @click="openSideBar = !openSideBar"
      >Surfaces-Volumes</UButton>
    </div>
    <SidebarSurface v-model:open="openSideBar" :surface-totale="surfaceTotale" :volume-total="volumeTotal" :surface-lot="surfaceTotaleLot" :volume-lot="volumeTotalLot" :surface-lvl="surfaceTotaleLevel" :volume-lvl="volumeTotalLevel"/>
    <div class="w-5/6" :style="{display:'flex'}">

      <div :style="{ display : 'flex', flexDirection: 'column', alignSelf:'center' }">
        <UButton :color="'success'" :disabled="currentLevel! == maxLevels!" @click="level('up')"> +1 </UButton>
        <p>{{ currentLevelName ? currentLevelName : "" }}</p>
        <UButton :color="'success'" :disabled="currentLevel! == 0" @click="level('down')"> -1</UButton>
      </div>
      <SmplrViewer :space-id="spaceId" @mounted="setupIdList" @ready="onReady" />
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
//spc_c8u5tvfx
//spc_cx1svr5x

//SERIENCE spc_k4bxdm74
const smplrRef= ref<Smplr>();

const spaceId = ref<string>('spc_c8u5tvfx');
const idList = ref<{ value: string, label: string }[]>([]);
const isPickingActivated = ref<boolean>(false);
const isMultiSelctingActivated = ref<boolean>(false);
const isMeasuringActivated = ref<boolean>(false);
const isFurnitureShowing = ref<boolean>(false);

const toast = useToast();

const space = ref<Space | null>(null);
const queryClient = ref<QueryClient | null>(null);
const surface = ref<number>(0);
const surfaceTotale = ref<number>(0);
const volumeTotal = ref<number>(0);

const surfaceTotaleLot = ref<number>(0);
const volumeTotalLot = ref<number>(0);

const surfaceTotaleLevel = ref<number>(0);
const volumeTotalLevel = ref<number>(0);

const selectedRooms = ref<Set<RoomWithHoles>>(new Set([]));
const idPieces = ref<any>();
const idLotsQuery = ref<Array<any>>();
const idListLots = ref<{value: string, label:string}[]>([]);

const coloredRooms = ref(new Set([]));
const idLot = ref<string>('tous');
const boutonUp = ref();
const boutonDown = ref();
const count = ref<number>(0);

const currentLevel = ref<number>();
const currentLevelName = ref<string>();
const maxLevels = ref<number>(0);
const levelNames = ref<Array<string>>([]);

const openSideBar = ref(false);

const openModalPiece = ref(false);
const pieceIdModale = ref<string>('');
const pieceNameModale = ref<string>('');

const coordoCapteurs = ref<Array<any>>([]);
const roomsOnLevel = ref<any>();
const capteurSeul = ref<any>();

async function afficherSpaceId(){
  console.log(count.value);
  idPieces.value = await useFetch(`/api/piece/pieces/${spaceId.value}`, {server:false});

  surfaceTotale.value = 0;
  volumeTotal.value = 0;


}
async function afficherMeubles(){
  isFurnitureShowing.value = !isFurnitureShowing.value;
  if(!isFurnitureShowing.value){
    resetMeubles();
  }
  else{

    const meubles = ref<Array<any>>();
      meubles.value = await queryClient.value?.getAllFurnitureInSpace(spaceId.value);
      count.value ++;
      if(meubles.value && count.value - 1 == meubles.value.length){
        count.value = 0;
      }
      if(meubles.value){
        meubles.value.forEach((meuble) => {
      console.log(meuble);
      if(meuble.name.includes("radiateur")){
        // space.value!.addDataLayer({
          space.value!.addFurnitureDataLayer({
            id:'radiateurs'+meuble.name,
          data:[{
            id:meuble.name,
            furnitureId:meuble.id,
            levelIndex: meuble.levelIndex,
          }],
          color:(d) => d.levelIndex == 1 ? 'success' : 'error',
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

    space.value!.showUpToLevel(meubles.value[count.value].levelIndex);
    currentLevel.value = meubles.value[count.value].levelIndex;

    space.value!.updateRenderOptions({
      walls:{
        alpha:0.4,
      }
    });
        space.value!.setCameraPlacement({
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
  space.value!.removeAllDataLayers();
    space.value!.updateRenderOptions({
      walls:{
        alpha:1,
      }
    });

}
async function level(direction: string){
  surfaceTotaleLevel.value = 0;
  volumeTotalLevel.value = 0;
  direction == 'up' ? (currentLevel.value != maxLevels.value ? currentLevel.value!++ : null) : (currentLevel.value != 0 ? currentLevel.value!-- : null);
  console.log("LEVEL COURANT : " +currentLevel.value);
  const temp = ref<any>();
  currentLevelName.value = levelNames.value[currentLevel.value!];


  if(currentLevel.value! >= 0){
    try{
      space.value!.showUpToLevel(currentLevel.value!);

    }catch(e){
      console.log("ERREUR "+e);
    }

    //CALCUL SURFACE À UN ÉTAGE
    const salles = await queryClient.value?.getRoomsOnLevel({spaceId: spaceId.value, levelIndex: currentLevel.value!});
    salles?.forEach((salle) => {
      if(estUnePiece(salle.coordinates[0]!)){
        surfaceTotaleLevel.value += totalSurfaceReducer(0, salle);
        volumeTotalLevel.value += totalSurfaceReducer(0, salle) * 2.5;
      }
    });
  }
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
        console.log(pick.coordinates);
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
  idList.value = (await queryClient.listSpaces()).map((space) => ({ value: space.sid, label: space.name }));
}

async function setupListLot(){

  idLotsQuery.value = await $fetch(`/api/lot/lots/space/${spaceId.value}`, {method:"GET"});
  if(idLotsQuery.value){
    idListLots.value = idLotsQuery.value.map((lot) => ({value:lot["idlot"], label:lot["numlot"]}));
    idListLots.value.push({value: "tous", label:"Tous"});
  }
//.forEach((lot) => ({name:lot["numlot"], value:lot["idlot"]}));

}

async function colorerLot(){
  coloredRooms.value = new Set([]);
  surfaceTotaleLot.value = 0;
  volumeTotalLot.value = 0;
  for(let i = 0 ; i < idListLots.value.length ; i++){
    if(space.value != null){
      space.value!.removeDataLayer('lots' +i);

    }

  }
  if(idLot.value != "tous"){
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
          const temp = queryClient.value!.getPolygonArea({polygon: coordo.value, unit: 'sqm'});
          surfaceTotaleLot.value += temp;
          volumeTotalLot.value += temp * 2.50; 
      }
    });
        space.value!.showUpToLevel(dernierLevel);
        currentLevel.value = dernierLevel;
        currentLevelName.value = levelNames.value[dernierLevel];
        space.value!.addPolygonDataLayer({
          id : 'lot',
          data: [...coloredRooms.value].map((room) => ({coordinates : room["asset"]["coordinates"], name:room["nompiece"], id:room["idpiece"] })),
          color:'yellow',
          alpha:0.5,
          tooltip: d => `${d.name}`,
          onClick: (event) =>  {openModalPiece.value = true; pieceIdModale.value = event.id; pieceNameModale.value = event.name}
        }); 
  }
  else{
    if(space.value != null){
      space.value!.removeDataLayer('lot');

    }
    coloredRooms.value = new Set([]);
    const couleurs = ['blue', 'green', 'yellow', 'orange', 'purple', 'brown', 'gray'];
    
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

          const temp = queryClient.value!.getPolygonArea({polygon: coordo.value, unit: 'sqm'});
          surfaceTotaleLot.value += temp;
          volumeTotalLot.value += temp * 2.50; // Ici, 2,5m mais si jamais ça change on n'aura qu'à mettre la taille des murs
      });

      const couleur = couleurs.pop(); // Améliorer ça, que ça boucle sur les couleurs plutôt que d'en prévoir un nombre fini
      // i % 2 == 0 ? 'blue' : 'success';    
      space.value!.addPolygonDataLayer({
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
              if(estUnePiece(room.coordinates[0]!)){
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
  space.value!.removeDataLayer('hm');
  roomsOnLevel.value = await $fetch(`/api/piece/pieces/etage/${currentLevel.value}&${spaceId.value}`);
  console.log(roomsOnLevel.value);
  roomsOnLevel?.value.forEach(async(room : any) => {
    capteurSeul.value = await $fetch(`/api/capteur/${room.idpiece}`);

  
    console.log("CAPTEUR SEUL "+room.idpiece);
    console.log(capteurSeul.value);
    if(capteurSeul.value){

      coordoCapteurs.value.push(capteurSeul.value);
    }

    
     
  });

  console.log("COORDOCAPTEURS ");
  console.log(coordoCapteurs.value);
  coordoCapteurs.value.forEach((capteur) => {
    if(capteur.length > 0){
      console.log("ABCDEFGH ");
      console.log(capteur[0]["asset"]);
      space.value!.addPointDataLayer({
        id: "capteur",
        shape:'sphere',
        data : [{id: capteur[0]["idpiece"], position : capteur[0]["asset"]["position"]}],
        color:"blue"
      })
    }
  })


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

const dataRail = [
  {
    id: 'rail-complete',
    coordinates: [
      { levelIndex: 2, x: 120, z: -50, elevation: 0.8 },

      { levelIndex: 2, x: 179.174, z: -69.572, elevation: 0.8 },
    ]
  }
];
  
   /*const dataHm = rawData.map((d) => ({
     id:d.x * d.value,
     coordinates: [{
       levelIndex: d.levelIndex,
       x: d.x,
       z: d.z,
       elevation:d.elevation
      }],
      //value: d.value,
    }));*/
    
    console.log('Heatmap data:', dataHm);
  
    const colorScale = smplrRef.value?.Color?.numericScale?.({
      name: 'RdYlGn',
      domain: [15, 25],
      invert:true
    });

    space.value!.addHeatmapDataLayer({
      id: 'hm', 
      style: 'bar-chart',
      data: dataHm,
      value: (d) => d.value,
      color: colorScale!,
      // HEIGHT OBLIGATOIRE POUR BAR-CHART
      height: (v:number) => (v - 15) / 4,
      gridSize: 0.5,        
      confidenceRadius: 9,
    });

   /* POUR LES FLUX D'AIR
    space.value!.addDottedPolylineDataLayer({
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
  levelNames.value = [];
  smplrRef.value = cli;
  space.value = s;
  queryClient.value = q;
  idPieces.value = await useFetch(`/api/piece/pieces/${spaceId.value}`, {server:false});
  setupListLot();
  getGlobalSurface(spaceId.value);
  const temp = ref<any>();
  temp.value = (await queryClient.value!.getSpaceLevels(spaceId.value));
  maxLevels.value = temp.value.length - 1;
  temp.value.forEach((etage:SpaceLevel) => { levelNames.value.push(etage.name) });
  currentLevel.value = maxLevels.value;
  currentLevelName.value = levelNames.value[currentLevel.value!];
  space.value.hideNavigationButtons();
  space.value.hideLevelPicker();
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
            //timeout: 3000,
          });
          console.log(pick.coordinates);
          space.value!.addPointDataLayer({
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

          space.value!.addPointDataLayer({
            id: 'measure2',
            data: [{position: pick.coordinates}],
            shape: 'sphere',
            color: 'error',
            alpha: 0.8,
            onDrop ( dropped ) {
              points[1] = dropped.position;
            },
          })

          space.value!.addPolylineDataLayer({
            id: 'measure',
            data: [{ coordinates: points }],
            color: 'success',
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
            //timeout: 3000,
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