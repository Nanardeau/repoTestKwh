import type { RoomWithHoles } from "@smplrspace/smplr-loader";
export const useLevels = (surfaceTotaleLevel : any, volumeTotalLevel : any, idPieces: any, currentLevel : any, maxLevels : any, currentLevelName : any, levelNames : any, queryClient : any, spaceId : any, space : any ) =>  {
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
    salles?.forEach((salle : any) => {
      if(estUnePiece(salle.coordinates[0]!)){
        surfaceTotaleLevel.value += totalSurfaceReducer(0, salle);
        volumeTotalLevel.value += totalSurfaceReducer(0, salle) * 2.5;
      }
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
function totalSurfaceReducer(acc: number, room: RoomWithHoles) {
  /**
   * Compute the total surface of the selected rooms
   */
  return acc + queryClient.value!.getPolygonArea({polygon: room.room, unit: 'sqm'});
}
  return { level, estUnePiece, totalSurfaceReducer};

}