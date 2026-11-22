import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { SleepData } from '../data/sleep-data';
import { OvernightSleepData } from '../data/overnight-sleep-data';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';

@Injectable({
  providedIn: 'root'
})
export class SleepService {
	private static LoadDefaultData:boolean = true;
	public static AllSleepData:SleepData[] = [];
	public static AllOvernightData:OvernightSleepData[] = [];
	public static AllSleepinessData:StanfordSleepinessData[] = [];

	private static StorageKey:string = 'sleep-logs';

	/* Load saved logs when app starts. */
	constructor() {
		if(SleepService.LoadDefaultData) {
			SleepService.LoadDefaultData = false;
			this.loadFromStorage();
		}
	}

	private addDefaultData() {
		var goToBed = new Date();
		goToBed.setDate(goToBed.getDate() - 1); //set to yesterday
		goToBed.setHours(1, 3, 0); //1:03am
		var wakeUp = new Date();
		wakeUp.setTime(goToBed.getTime() + 8 * 60 * 60 * 1000); //Sleep for exactly eight hours, waking up at 9:03am
		this.logOvernightData(new OvernightSleepData(goToBed, wakeUp)); // add that person was asleep 1am-9am yesterday
		var sleepinessDate = new Date();
		sleepinessDate.setDate(sleepinessDate.getDate() - 1); //set to yesterday
		sleepinessDate.setHours(14, 38, 0); //2:38pm
		this.logSleepinessData(new StanfordSleepinessData(4, sleepinessDate)); // add sleepiness at 2pm
		goToBed = new Date();
		goToBed.setDate(goToBed.getDate() - 1); //set to yesterday
		goToBed.setHours(23, 11, 0); //11:11pm
		wakeUp = new Date();
		wakeUp.setTime(goToBed.getTime() + 9 * 60 * 60 * 1000); //Sleep for exactly nine hours
		this.logOvernightData(new OvernightSleepData(goToBed, wakeUp));
	}

	/* Adds a overnight sleep log and saves */
	public logOvernightData(sleepData:OvernightSleepData) {
		SleepService.AllSleepData.push(sleepData);
		SleepService.AllOvernightData.push(sleepData);
		this.saveToStorage();
	}

	/* Adds a sleepiness log and saves */
	public logSleepinessData(sleepData:StanfordSleepinessData) {
		SleepService.AllSleepData.push(sleepData);
		SleepService.AllSleepinessData.push(sleepData);
		this.saveToStorage();
	}

	/* Saves every log and called each time a log is added / removed. */
	private async saveToStorage() {
		await Preferences.set({
			key: SleepService.StorageKey,
			value: JSON.stringify(SleepService.AllSleepData),
		});
	}

	private async loadFromStorage() {
		const { value } = await Preferences.get({ key: SleepService.StorageKey });
		if (!value) {
			this.addDefaultData();
			return;
		}

		const saved:any[] = JSON.parse(value);
		for (const item of saved) {
			let data:SleepData;
			if (item.sleepStart) {
				data = new OvernightSleepData(new Date(item.sleepStart), new Date(item.sleepEnd));
				SleepService.AllOvernightData.push(data as OvernightSleepData);
			} else {
				data = new StanfordSleepinessData(item.loggedValue, new Date(item.loggedAt));
				SleepService.AllSleepinessData.push(data as StanfordSleepinessData);
			}
			data.id = item.id;
			data.loggedAt = new Date(item.loggedAt);
			SleepService.AllSleepData.push(data);
		}
	}

	/* Removes a log and updates storage */
	public deleteData(sleepData:SleepData) {
		SleepService.AllSleepData = SleepService.AllSleepData.filter(d => d.id !== sleepData.id);
		SleepService.AllOvernightData = SleepService.AllOvernightData.filter(d => d.id !== sleepData.id);
		SleepService.AllSleepinessData = SleepService.AllSleepinessData.filter(d => d.id !== sleepData.id);
		this.saveToStorage();
	}
}