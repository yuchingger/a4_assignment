import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonListHeader, IonItem, IonLabel, IonDatetime, IonDatetimeButton, IonModal, IonButton, IonRadioGroup, IonRadio, IonNote, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent } from '@ionic/angular/standalone';
import { SleepService } from '../services/sleep.service';
import { SleepData } from '../data/sleep-data';
import { OvernightSleepData } from '../data/overnight-sleep-data';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';

function toLocalISO(date:Date):string {
  const pad = (n:number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

@Component({
	selector: 'app-home',
	templateUrl: 'home.page.html',
	styleUrls: ['home.page.scss'],
	imports: [
	  FormsModule,
	  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonListHeader, IonItem, IonLabel,
	  IonDatetime, IonDatetimeButton, IonModal, IonButton, IonRadioGroup, IonRadio, IonNote,
	  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent
	],
  })
export class HomePage {
  scaleValues = StanfordSleepinessData.ScaleValues;
  scaleOptions = [1, 2, 3, 4, 5, 6, 7];
  bedtime:string = '';
  wakeTime:string = '';
  sleepinessValue:number | null = null;
  sleepinessTime:string = '';

  constructor(public sleepService:SleepService) {
    this.resetSleepForm();
    this.resetSleepinessForm();
  }

  ngOnInit() {
    console.log(this.allSleepData);
  }

  get allSleepData() {
    return SleepService.AllSleepData;
  }

  get todayString():string {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  get lastSleep():OvernightSleepData | undefined {
    const all = SleepService.AllOvernightData;
    return all[all.length - 1];
  }

  get lastSleepiness():StanfordSleepinessData | undefined {
    return [...SleepService.AllSleepinessData]
      .sort((a, b) => b.loggedAt.getTime() - a.loggedAt.getTime())[0];
  }

  get logsNewestFirst():SleepData[] {
    return [...this.allSleepData].reverse();
  }

  resetSleepForm() {
    const bed = new Date();
    bed.setDate(bed.getDate() - 1);
    bed.setHours(23, 0, 0, 0);
    const wake = new Date();
    wake.setHours(7, 0, 0, 0);
    this.bedtime = toLocalISO(bed);
    this.wakeTime = toLocalISO(wake);
  }

  get sleepMinutes():number {
    return Math.round((new Date(this.wakeTime).getTime() - new Date(this.bedtime).getTime()) / 60000);
  }

  get sleepDurationText():string {
    return `${Math.floor(this.sleepMinutes / 60)}h ${this.sleepMinutes % 60}m`;
  }

  get sleepError():string | null {
    if (this.sleepMinutes <= 0) return 'Wake time must be after bedtime.';
    if (this.sleepMinutes > 24 * 60) return 'That is more than 24 hours. Check the dates.';
    if (new Date(this.wakeTime).getTime() > Date.now()) return 'Wake time cannot be in the future.';
    return null;
  }

  saveSleep() {
    if (this.sleepError) return;
    this.sleepService.logOvernightData(new OvernightSleepData(new Date(this.bedtime), new Date(this.wakeTime)));
    this.resetSleepForm();
  }

  resetSleepinessForm() {
    this.sleepinessValue = null;
    this.sleepinessTime = toLocalISO(new Date());
  }

  saveSleepiness() {
    if (this.sleepinessValue === null) return;
    this.sleepService.logSleepinessData(new StanfordSleepinessData(this.sleepinessValue, new Date(this.sleepinessTime)));
    this.resetSleepinessForm();
  }

  isSleep(d:SleepData):boolean {
    return d instanceof OvernightSleepData;
  }

  timeString(d:SleepData):string {
    return d.loggedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
}