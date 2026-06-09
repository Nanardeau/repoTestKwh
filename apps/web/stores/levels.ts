import type { QueryClient, Space, Smplr } from '@smplrspace/smplr-loader';
import { number } from 'echarts/core';
import { defineStore } from 'pinia';

export const useLevelsStore = defineStore('levels', {
    state: () => { return {
        //spc_c8u5tvfx spc_ixzzca01 
        maxLevels: 0 as number,
        currentLevel: 0 as number,
        minLevel: 0 as number,
        levelNames : [] as Array<String>,
        currentLevelName : "" as String | undefined,
        roomsOnLevel : [] as Array<any>,

    }
    
    },
    getters: {
        _currentLevel: (state) => state.currentLevel,
        _maxLevels: (state) => state.maxLevels,
        _minLevel: (state) => state.minLevel,
        _currentLevelName: (state) => state.currentLevelName,
        _levelNames : (state) => state.levelNames,
        _roomsOnLevel : (state) => state.roomsOnLevel,

    },
    actions:{
        incrementCurrentLevel(){
            this.currentLevel ++;
        },
        decrementCurrentLevel(){
            this.currentLevel --;
        },
        setCurrentLevel(nouveauLvl:number){
            this.currentLevel = nouveauLvl;
        },
        setCurrentLevelName(nouveauName : string | undefined){
            this.currentLevelName = nouveauName;
        },
        addLevelName(levelName : string){
            this.levelNames.push(levelName);
        },
        addRoomOnLevel(room : any){
            this.roomsOnLevel.push(room);
        },
        resetRoomsOnLevel(){
            this.roomsOnLevel = [];
        },
        init(minLevel: number, maxLevels: number, currentLevel : number, currentLevelName: any){
            this.minLevel = minLevel;
            this.maxLevels = maxLevels;
            this.currentLevel = currentLevel;
            this.currentLevelName = currentLevelName;
        }
    }
})