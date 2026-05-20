import type { RoomWithHoles } from "@smplrspace/smplr-loader";
import { useVariablesStore } from "~/stores/variables";
import { useSurfacesStore } from "~/stores/surfaces";
import { useLevelsStore } from "~/stores/levels";
import { ref } from 'vue';

export const useLevels = () =>  {
  const storeVar = useVariablesStore();
  const storeSurfaces = useSurfacesStore();
  const storeLevels = useLevelsStore();

  async function initLevels(spaceId: string) {
    try {
      const { data: etages } = await useFetch(`/api/piece/etage/${spaceId}`);
      
      if (!etages.value || etages.value.length === 0) {
        console.error("Aucun étage trouvé pour l'espace:", spaceId);
        return;
      }

      // Réinitialise les levelNames
      storeLevels.levelNames.length = 0;
      
      // Remplit levelNames avec les numéros d'étages
      etages.value.forEach((etage: any) => {
        storeLevels.addLevelName(etage.etage);
      });
      
      // Ajoute "Toit"
      storeLevels.addLevelName("Toit");
      
      // Initialise les paramètres du store
      const minLevel = etages.value[0]["etage"];
      const maxLevels = etages.value.length;
      const currentLevel = maxLevels;
      const currentLevelName = storeLevels._levelNames[currentLevel];
      
      storeLevels.init(minLevel, maxLevels, currentLevel, currentLevelName);
      
      console.log("Levels initialized:", {
        minLevel,
        maxLevels,
        currentLevel,
        currentLevelName,
        levelNames: storeLevels._levelNames
      });
    } catch (e) {
      console.error("Erreur initialisation des niveaux:", e);
    }
  }

  async function level(direction: string){
    try {
      storeSurfaces.resetLevel();
      direction == 'up' ? (storeLevels._currentLevel != storeLevels._maxLevels ? storeLevels.incrementCurrentLevel() : null) : (storeLevels._currentLevel != 0 ? storeLevels.decrementCurrentLevel() : null);
      
      storeLevels.setCurrentLevelName(String(storeLevels._levelNames[storeLevels._currentLevel]));
      console.log(storeLevels._currentLevel);
      console.log("Current Level Name:", storeLevels._currentLevelName);
      
      // Appel de l'API pour récupérer les salles
      const salles = await $fetch(`/api/piece/pieces/etage/${storeLevels._currentLevelName}&${storeVar._spaceId}`); 
      console.log("SALLES ÉTAGE "+storeLevels._currentLevel);
      console.log("Salles:", salles);
      
      // Afficher l'étage
      storeVar._space!.showUpToLevel(storeLevels._currentLevel!);
      
      // Calculer la surface
      salles?.forEach((salle : any) => {
        if(salle.asset){
          storeSurfaces.incrementLevel(
            storeVar._queryClient!.getPolygonArea({polygon: salle.asset.coordinates, unit: 'sqm'}), 
            storeVar._queryClient!.getPolygonArea({polygon: salle.asset.coordinates, unit: 'sqm'}) * 2.5
          );
        }
      });
    } catch(e){
      console.error("Erreur level():", e);
    }
  }

  function estUnePiece(coordonneesSalle: Array<any>){
    let res = false;
    /*
    * Je fais trop de boucles : pour chaque salle je regarde pour chaque pièce dans la bdd si les coordonnées correspondent ou pas
    */

    //  let data = storeVar._idPieces["data"][3]["asset"]["coordinates"][0];
    const data = (storeVar._idPieces as Record<string, any>)?.data as any[] || [];
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


    // console.log("DATA ASSET COORD "+ data["asset"]["coordinates"][0]);
    // console.log("COORDO SALLE "+coordonneesSalle);
  }

  function totalSurfaceReducer(acc: number, room: RoomWithHoles) {
    /**
     * Compute the total surface of the selected rooms
     */
    return acc + storeVar._queryClient!.getPolygonArea({polygon: room.room, unit: 'sqm'});
  }


  return { level, estUnePiece, totalSurfaceReducer, initLevels};
}