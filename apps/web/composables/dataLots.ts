import type { RoomWithHoles, SmplrCoord2d } from "@smplrspace/smplr-loader";
import { useVariablesStore } from "~/stores/variables";
import { useSurfacesStore } from "~/stores/surfaces";
import { useLevelsStore } from "~/stores/levels";
import { useLotsStore } from "~/stores/lots";
import { useStatsStore } from "~/stores/stats";
import { ref } from 'vue';

export const useDataLots = () => {
    const storeLots = useLotsStore();
    const storeVar = useVariablesStore();
    const storeLevels = useLevelsStore();
    const storeSurfaces = useSurfacesStore();
    const storeStats = useStatsStore();
    const temp = ref();
async function setupListLot(){
  //storeLots.resetIdListLots();
  storeVar.setIdLot("aucun");
  storeLots.$reset();
  temp.value = await $fetch(`/api/lot/lots/space/${storeVar._spaceId}`, {method:"GET"});
  storeLots.setQuery(temp.value);
  if(storeLots._idLotsQuery){
    storeLots.setIdListLots( storeLots.idLotsQuery.map((lot:any) => ({value:lot["idlot"], label:lot["numlot"]})) );
    storeLots.addIdLot({value: "tous", label:"Tous"});
    storeLots.addIdLot({value: "aucun", label:"Aucun"});
  }
//.forEach((lot) => ({name:lot["numlot"], value:lot["idlot"]}));

}
async function colorerLot(){
  const couleurs = ['blue', 'green', 'yellow', 'orange', 'purple', 'brown', 'magenta'];

  storeVar.setIdScap("aucun");
  storeSurfaces.resetLot();
  storeVar._space?.removeAllDataLayers();
  if(storeVar._idLot == "aucun"){
    document.getElementById('legende-lot')?.remove();

    storeVar._space?.removeAllDataLayers();
  }
  else if(storeVar._idLot != "tous"){
    document.getElementById('legende-lot')?.remove();
    let dernierLevel = 0;
    storeVar.setColoredRooms(await $fetch(`/api/piece/lots/${storeVar._idLot}`, {method:"GET"}));   

      storeVar._coloredRooms.forEach((room: any) => {
        if(room["asset"] !== null){
          let tab = [];
          tab = room["asset"]["coordinates"] !== undefined ? room["asset"]["coordinates"][0] : room["asset"];

        const coordo = ref<SmplrCoord2d[]>([]);
          tab.forEach((point:any) => {
            coordo.value.push({x: point["x"], z: point["z"], levelIndex:tab["levelIndex"]});
            if(point["levelIndex"] > dernierLevel){
              dernierLevel = point["levelIndex"];
            }
          });
          const temp = storeVar._queryClient!.getPolygonArea({polygon: coordo.value, unit: 'sqm'});
          storeSurfaces.incrementLot(temp, temp * 2.50);

      }
    });
        storeVar._space!.showUpToLevel(dernierLevel);
        storeLevels.setCurrentLevel(dernierLevel);
        storeLevels.setCurrentLevelName(String(storeLevels._levelNames[dernierLevel]));
        storeVar._space!.addPolygonDataLayer({
          id : 'lot',
          data: [...storeVar._coloredRooms].map((room) => ({coordinates : room["asset"]["coordinates"] !== undefined ? room["asset"]["coordinates"] : room["asset"], name:room["nompiece"], id:room["idpiece"] })),
          color:'yellow',
          alpha:0.5,
          tooltip: d => `${d.name}`,
          onClick: (event) =>  {storeStats.openModal(event.id, event.name) }
        }); 
  }
  else{
    if(storeVar._space != null){
      storeVar._space!.removeDataLayer('lot');

    }
    storeVar.resetColoredRooms();
    const labelsLegende: {color : string , label : string}[] = [];
    const couleurs_deux = ['blue', 'green', 'yellow', 'orange', 'purple', 'brown', 'magenta'];
    if(storeVar._idLot != "tous"){
        document.getElementById('legende-lot')!.remove();
      
    }
  
    for(let i = 0 ; i < storeLots._idListLots.length - 1 ; i++){ // -1 pour ne pas inclure le lot "tous"
      //J'itère sur chacun des lots de la liste de lots pour faire un GET des pièces de ce lot, pour ensuite les colorier
      storeVar.setColoredRooms(await $fetch(`/api/piece/lots/${storeLots._idListLots[i]!.value}`, {method:"GET"}));
      const couleurLot = couleurs_deux.pop();
      
      if(storeLots._idListLots[i]!.value != "tous" && storeLots._idListLots[i]!.value != "aucun" && couleurLot){
        labelsLegende.push({color: couleurLot, label: 'Lot n°'+ storeLots._idListLots[i]!.label + `\nSurface : 0m²`});
      }
      
      storeVar._coloredRooms.forEach((room:any) => {
        const coordo = ref<SmplrCoord2d[]>([]);
        let tab2;
        if(room["asset"]["coordinates"] != undefined){
          tab2 = room["asset"]["coordinates"][0];
        }
        else{
          tab2 = room["asset"];
        }
        console.log(tab2);
        tab2.forEach((point: any) => {  
          coordo.value.push({x: point["x"], z: point["z"], levelIndex:point["levelIndex"]});
        });

        /*
        * Je passe par une variable temporaire pour adapter si jamais on a la taille de chaque mur
        */

        const temp = storeVar._queryClient!.getPolygonArea({polygon: coordo.value, unit: 'sqm'});
        storeSurfaces.incrementLot(temp, temp * 2.50);  // Ici, 2,5m mais si jamais ça change on n'aura qu'à mettre la taille des murs
      });
      let couleur = couleurLot;
      // i % 2 == 0 ? 'blue' : 'success';    
      storeVar._space!.addPolygonDataLayer({
        id : 'lots'+i,
        data: [...storeVar._coloredRooms].map((room) => ({coordinates : room["asset"]["coordinates"] ? room["asset"]["coordinates"] : room["asset"], name:room["nompiece"], id:room["idpiece"], lot: storeLots._idListLots[i]!.label})),
        tooltip: d => `${d.lot == '1' ? 'Commun' : 'Lot ' + d.lot} - ${d.name}`,
        onClick: (e) => {storeStats.openModal(e.id, e.name)},
        color: couleur,
        alpha:0.5,
        
    }); 
    }
    let legende = document.createElement('div');
    legende.id = 'legende-lot';
    document.getElementById('legende-lot-container')!.appendChild(legende);
    storeVar._smplrRef?.Color.drawColorSwatches({
    containerId: 'legende-lot',
    swatches: labelsLegende,
    size:25
  });
  }

  
}
    return { setupListLot, colorerLot}
}