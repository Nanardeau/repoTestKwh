import type { QueryClient, Space } from '@smplrspace/smplr-loader';
import { defineStore } from 'pinia';

export const useSurfacesStore = defineStore('surfaces', {
    state: () => ( {
        surfaceTotale : 0 as number ,
        volumeTotal : 0 as number,
        surfaceTotaleLevel : 0 as number,
        volumeTotalLevel : 0 as number,
        surfaceTotaleLot : 0 as number,
        volumeTotalLot : 0 as number,        
    }
    
),
    getters: {
        _surfaceTotale: (state) => state.surfaceTotale,
        _volumeTotal: (state) => state.volumeTotal,
        _surfaceTotaleLevel: (state) => state.surfaceTotaleLevel,
        _volumeTotalLevel : (state) => state.volumeTotalLevel,
        _surfaceTotaleLot: (state) => state.surfaceTotaleLot,
        _volumeTotalLot: (state) => state.volumeTotalLot,        

    },
    actions:{
        resetSurfaces(){
            this.surfaceTotale = 0;
            this.surfaceTotaleLevel = 0;
            this.surfaceTotaleLot = 0;
        },
        resetVolumes(){
            this.volumeTotal = 0;
            this.volumeTotalLevel = 0;
            this.volumeTotalLot = 0;
        },
        resetGlobal(){
            this.surfaceTotale = 0;
            this.volumeTotal = 0;
        },
        resetLevel(){
            this.surfaceTotaleLevel = 0;
            this.volumeTotalLevel = 0;
        },
        resetLot(){
            this.surfaceTotaleLot = 0;
            this.volumeTotalLot = 0;
        },
        incrementGlobal(surf:number, vol:number){
            this.surfaceTotale += surf;
            this.volumeTotal += vol;
        },
        incrementLevel(surf:number, vol:number){
            this.surfaceTotaleLevel += surf;
            this.volumeTotalLevel += vol;
        },
        incrementLot(surf:number, vol:number){
            this.surfaceTotaleLot += surf;
            this.volumeTotalLot += vol;
        }
    }

})