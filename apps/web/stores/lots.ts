import type { QueryClient, Space, Smplr } from '@smplrspace/smplr-loader';
import { number } from 'echarts/core';
import { defineStore } from 'pinia';

export const useLotsStore = defineStore('lots', {
    state: () => { return {
        //spc_c8u5tvfx spc_ixzzca01 
        idListLots : [] as Array<{value: string, label: string}>,
        idLotsQuery: null as any,


    }
    
    },
    getters: {
        _idListLots: (state) => state.idListLots,
        _idLotsQuery: (state) => state.idLotsQuery,

    },
    actions:{
        setQuery(query: Array<{value: string, label: string}>){
            this.idLotsQuery = query;
        },
        setIdListLots(idListLots : any){
            this.idListLots = idListLots;
        },
        addIdLot(idLot: any){
            this.idListLots.push(idLot);
        },
        resetIdListLots(){
            this.idListLots = [];
        },
    }
})