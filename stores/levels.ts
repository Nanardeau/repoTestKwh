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
        currentLevelName : "" as String | undefined

    }
    
    },
    getters: {
        _currentLevel: (state) => state.currentLevel,
        _maxLevels: (state) => state.maxLevels,
        _minLevel: (state) => state.minLevel,
        _currentLevelName: (state) => state.currentLevelName,
        _levelNames : (state) => state.levelNames,

    },
    actions:{
        incrementCurrentLevel(){
            this.currentLevel ++;
        },
        decrementCurrentLevel(){
            this.currentLevel --;
        },
        setCurrentLevelName(nouveauName : string | undefined){
            this.currentLevelName = nouveauName;
        },
        addLevelName(levelName : string){
            this.levelNames.push(levelName);
        },
        init(minLevel: number, maxLevels: number, currentLevel : number, currentLevelName: any){
            this.minLevel = minLevel;
            this.maxLevels = maxLevels;
            this.currentLevel = currentLevel;
            this.currentLevelName = currentLevelName;
        }
    }
})