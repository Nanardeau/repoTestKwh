import type { RoomWithHoles, SmplrCoord2d } from "@smplrspace/smplr-loader";
import { useVariablesStore } from "~/stores/variables";
import { useSurfacesStore } from "~/stores/surfaces";
import { useLevelsStore } from "~/stores/levels";
import { useScapStore } from "~/stores/scap";
import { useLotsStore } from "~/stores/lots";
import { useStatsStore } from "~/stores/stats";
import { ref } from 'vue';

export const useDataScap = () => {
  const storeVar = useVariablesStore();
  const storeSurfaces = useSurfacesStore();
  const storeStats = useStatsStore();
  const storeLevels = useLevelsStore();
  const storeScap = useScapStore();
  const listeScapsQuery = ref<any>()
  const listeSurfacesScap = ref<Array<number>>([]);

 async function setupListScap(){
    listeScapsQuery.value = await $fetch(`/api/scap/${storeVar._spaceId}`);
    if(listeScapsQuery.value){
    storeScap.setIdListScap(listeScapsQuery.value.map((scap : any) => ({value:scap["codescap"], label:scap["codescap"]})));
    storeScap.addIdScap({value:'tous', label:'Tous'});
    storeScap.addIdScap({value:'aucun', label:'Aucun'});

    }
}

async function colorerScap(){

  storeVar.setIdLot("aucun");
  storeVar._space?.removeAllDataLayers();
  
  console.log("COLORER SCAP");
  storeVar.resetColoredRooms();
  const couleurs = ['blue', 'green', 'yellow', 'indigo', 'purple', 'hotpink', 'magenta'];
  const labelsLegende: {color : string , label : string}[] = [];
  
  // Effacer la légende si on sélectionne autre chose que "tous"
  if(storeVar._idScap != "tous"){
      document.getElementById('legende-scap')!.remove();
    
  }
  
  for(let i = 0 ; i < storeScap._idListScap.length ; i++){
    if(storeVar._space != null){
      storeVar._space!.removeDataLayer('scap' +i);
    }
  }
  if(storeVar._idScap != "tous" && storeVar._idScap != "aucun"){

    storeVar.setColoredRooms(await $fetch(`/api/scap/piece/${storeVar._spaceId}&${storeVar._idScap}`, {method: "GET"}));
    
    console.log(storeVar._coloredRooms);
    colorerPieces('scap', couleurs.pop());
  }
  else if(storeVar._idScap == "tous"){
    for(let i = 0 ; i < storeScap._idListScap.length ; i++){
      //Faire les coloredRooms pour chaque SCAP
      
      storeVar.setColoredRooms(await $fetch(`/api/scap/piece/${storeVar._spaceId}&${storeScap._idListScap[i]!.value}`, {method:"GET"}));
      console.log(i);
      let couleur = couleurs.pop()!;
      colorerPieces('scap' + i, couleur);
      if(storeScap._idListScap[i]!.value != "tous" && storeScap._idListScap[i]!.value != "aucun"){
        labelsLegende.push({color: couleur, label: storeScap._idListScap[i]!.value + `\nSurface : ${listeSurfacesScap.value[i]!.toFixed(2)}m²`});
        
      }
    }
    //LA LÉGENDE
    let legende = document.createElement('div');
    legende.id = 'legende-scap';
    document.getElementById('legende-scap-container')!.appendChild(legende);
    storeVar._smplrRef?.Color.drawColorSwatches({
    containerId: 'legende-scap',
    swatches: labelsLegende,
    size:25
  });
    //   storeVar._space!.updateRenderOptions({
    //   walls:{
    //     alpha:0,
    //     render:false,
    //   },
    //   doors:{
    //     render:false,
    //   },
    //   windows:{
    //     render:false,
        
    //   },
    //   objects:{
    //     render:false,
    //   },
    //   grounds:{
    //     render:false
    //   },
    //   compass:false,
    //   annotations:{
    //     render:false
    //   },
    //   openings:{
    //     render:false,
    //   },
      
    // });
  }

}

function colorerPieces(idPolygon: string, couleur:any){
  let dernierLevel = 0;
 // Améliorer ça, que ça boucle sur les couleurs plutôt que d'en prévoir un nombre fini
  const tempSurf = ref(0);
  storeVar._coloredRooms.forEach((room: any) => {
        if(room["asset"] !== null){
          if(room["surface"] != null){
            tempSurf.value += room["surface"];
          }
          else{
            if(storeVar._queryClient){
              tempSurf.value += storeVar._queryClient?.getPolygonArea({polygon: room["asset"]["coordinates"] ? room["asset"]["coordinates"] : room["asset"], unit:'sqm'});

            }
          }
        let tab = room["asset"]["coordinates"] !== undefined ? room["asset"]["coordinates"][0] : room["asset"];
        const coordo = ref<SmplrCoord2d[]>([]);
          tab.forEach((point:any) => {
            coordo.value.push({x: point["x"], z: point["z"], levelIndex:point["levelIndex"]});
          });
          if(tab["levelIndex"] > dernierLevel){
            dernierLevel = tab["levelIndex"];
          }
          const temp = storeVar._queryClient!.getPolygonArea({polygon: coordo.value, unit: 'sqm'});
          storeSurfaces.incrementScap(temp, temp * 2.50);

      }

    });
    listeSurfacesScap.value.push(tempSurf.value);
    
        storeVar._space!.showUpToLevel(dernierLevel);
        storeLevels.setCurrentLevel(dernierLevel);
        storeLevels.setCurrentLevelName(String(storeLevels._levelNames[dernierLevel]));
        storeVar._space!.addPolygonDataLayer({
          id : idPolygon,
          data: [...storeVar._coloredRooms].map((room) => ({coordinates : room["asset"]["coordinates"] !== undefined ?  room["asset"]["coordinates"] : room["asset"], name:room["nompiece"], id:room["idpiece"], scap: room["codescap"], lot: room["numlot"]})),
          color:couleur,
          alpha:0.5,
          tooltip: d => `${'Pièce ' + d.name + d.scap + ' Lot '+ d.lot}`,
          onClick: (event) =>  {storeStats.openModal(event.id, event.name);},
          //height:0.5,
        
        });
        //Je fais ça pour essayer d'espacer et permettre une visualisation statique à Guénolé
  }

  return { setupListScap, colorerScap, colorerPieces }
}