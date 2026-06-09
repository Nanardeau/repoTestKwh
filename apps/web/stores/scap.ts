import type { QueryClient, Space, Smplr } from '@smplrspace/smplr-loader';
import { number } from 'echarts/core';
import { defineStore } from 'pinia';

export const useScapStore = defineStore('scap', {
    state: () => { return {
        //spc_c8u5tvfx spc_ixzzca01 
        idListScap : [] as Array<{value: string, label: string}>,
    }
    
    },
    getters: {
        _idListScap: (state) => state.idListScap,

    },
    actions:{

        setIdListScap(idListScap : Array<{value: string, label:string}>){
            this.idListScap = idListScap;
        },
        addIdScap(idScap: any){
            this.idListScap.push(idScap);
        }
    }
})