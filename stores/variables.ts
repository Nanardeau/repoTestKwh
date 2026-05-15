import type { QueryClient, Space, Smplr } from '@smplrspace/smplr-loader';
import { defineStore } from 'pinia';

export const useVariablesStore = defineStore('variables', {
    state: () => { return {
        //spc_ixzzca01
        spaceId: 'spc_c8u5tvfx',
        space: null as Space | null,
        queryClient: null as QueryClient | null,
        idPieces : [],
        smplrRef : null as Smplr | null,
        typeData : 'temperature',
    }
    
    },
    getters: {
        _spaceId: (state) => state.spaceId,
        _space: (state) => state.space,
        _queryClient: (state) => state.queryClient,
        _idPieces: (state) => state.idPieces,
        _smplrRef : (state) => state.smplrRef,
        _typeData : (state) => state.typeData,

    },
    actions:{
        init(space: Space, queryClient: QueryClient, idPieces : any, smplrRef : Smplr){
            this.space = space; 
            this.queryClient = queryClient;
            this.idPieces = idPieces;
            this.smplrRef = smplrRef;
        },
        setSpaceId(spaceId: string){
            this.spaceId = spaceId;
        },
        setIdPieces(idPieces : any){
            this.idPieces = idPieces;
        },
        setTypeData(nouveauType: string){
            this.typeData = nouveauType
        },
    }
})