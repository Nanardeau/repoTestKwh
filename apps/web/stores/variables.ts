import type { QueryClient, Space, Smplr } from '@smplrspace/smplr-loader';
import { defineStore } from 'pinia';

export const useVariablesStore = defineStore('variables', {
    state: () => { return {
        // spc_ixzzca01 spc_gk4ar35x spc_c8u5tvfx
        spaceId: 'spc_nopyd1oi',
        space: null as Space | null,
        queryClient: null as QueryClient | null,
        idPieces : [],
        smplrRef : null as Smplr | null,
        typeData : 'temperature',
        idLot: "" as string,
        idScap: "" as string,
        coloredRooms : [] as Array<any>,
        warpData : [] as Array<any>,
        

    }
    
    },
    getters: {
        _spaceId: (state) => state.spaceId,
        _space: (state) => state.space,
        _queryClient: (state) => state.queryClient,
        _idPieces: (state) => state.idPieces,
        _smplrRef : (state) => state.smplrRef,
        _typeData : (state) => state.typeData,
        _idLot : (state) => state.idLot,
        _idScap : (state) => state.idScap,
        _coloredRooms : (state) => state.coloredRooms,
        _warpData: (state) => state.warpData,


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
        setIdLot(idlot : string){
            this.idLot = idlot;
        },
        setIdScap(idScap : string){
            this.idScap = idScap;
        },
        setColoredRooms(array: Array<any>){
            this.coloredRooms = array;
        },
        addColoredRoom(room : any){
            this.coloredRooms.push(room);
        },
        resetColoredRooms(){
            this.coloredRooms = new Array([]);
        },
        addWarpData(warpData: any){
            this.warpData = warpData;
        }
    }
})