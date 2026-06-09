import type { QueryClient, Space, Smplr } from '@smplrspace/smplr-loader';
import { number } from 'echarts/core';
import { defineStore } from 'pinia';

export const useStatsStore = defineStore('stats', {
    state: () => { return {
        openModalPiece: false as boolean,
        pieceIdModale: "" as string,
        namePieceModale: "" as string,
        devEui: {} as Record<string, string>, //pour l'instant j'en mets qu'un par pièce


    }
    
    },
    getters: {
        _openModalPiece: (state) => state.openModalPiece,
        _pieceIdModale: (state) => state.pieceIdModale,
        _namePieceModale: (state) => state.namePieceModale,
        _deveui: (state) => state.devEui,

    },
    actions:{
        openModal(pieceId : string, pieceName : string){
            this.openModalPiece = true;
            this.pieceIdModale = pieceId;
            this.namePieceModale = pieceName; 
        },
        addDevEui(idPiece:string, devEui: string){
            this.devEui[idPiece] = devEui;
        },

    }
})