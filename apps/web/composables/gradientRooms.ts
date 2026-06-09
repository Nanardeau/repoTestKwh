import { useVariablesStore } from "~/stores/variables";
import { useLevelsStore } from "~/stores/levels";
import { useStatsStore } from "~/stores/stats";
import { ref } from 'vue';

export const useGradientRooms = () => {
    const storeVar = useVariablesStore();
    const storeLevels = useLevelsStore();
    const storeStats = useStatsStore();
    const roomsOnLevel = ref<Array<any>>([]);
    const coordoCapteurs = ref<Array<any>>([]);
    
async function essaiHeatMap(){
  try {
    coordoCapteurs.value = [];
    storeVar._space!.removeDataLayer('hm');
    storeVar._space!.removeAllDataLayers();
    
    console.log("Fetching rooms for level:", storeLevels._currentLevelName, "in space:", storeVar._spaceId);
    roomsOnLevel.value = await $fetch(`/api/piece/pieces/etage/${storeLevels._currentLevelName}&${storeVar._spaceId}`);
    console.log("LEVEL COURANT : " + storeLevels._currentLevelName);
    console.log("Rooms found on this level:", roomsOnLevel.value?.length || 0);

    if (!roomsOnLevel.value || roomsOnLevel.value.length === 0) {
      console.warn("No rooms found for this level");
      return;
    }

    for (const room of roomsOnLevel.value) {
      try {
        const capteur = await $fetch(`/api/capteur/${room.idpiece}`);
        console.log("Capteur for room", room.idpiece, ":", capteur);
        
        if (capteur) {
          storeStats.addDevEui(capteur[0].idpiece, capteur[0].deveui);
          const warpData = await $fetch(`/api/capteur/warp10/${capteur[0].deveui}&${storeVar._typeData}`);
          console.log("Warp data for room", room.idpiece, ":", warpData);
          coordoCapteurs.value.push([room, warpData]);
        }
      } catch (roomError) {
        console.warn("Error fetching capteur data for room", room.idpiece, ":", roomError);
      }
    }

    console.log("COORDOCAPTEURS ", coordoCapteurs.value.length, "items");
    console.log(coordoCapteurs.value);

    coordoCapteurs.value.forEach((donnee: any) => {
      const temperature = donnee[1][0]?.["v"]?.[0]?.[1];
      console.log("TEMPERATURE");
      console.log(temperature);
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
                if(d.value > 1000) return "red";
                if(d.value < 800) return "green";
                return "yellow";
                break;
              default:
                if (d.value > 30) return "red";
                if (d.value < 15) return "yellow";
                return "green";
                break;
            }
          },
          alpha: 0.5,
          tooltip: (d) => storeVar._typeData === 'co2' ? `CO2 : ${d.value}` : `Température : ${d.value}°C`,
          onClick: (event) =>  {storeStats.openModal(event.id, event.name)}
        });
      }
    });
  } catch (e) {
    console.error("Erreur essaiHeatMap():", e);
  }


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

} return {essaiHeatMap}
} 